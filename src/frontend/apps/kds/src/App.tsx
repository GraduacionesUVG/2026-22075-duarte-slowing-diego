import { useState, type ReactNode } from "react";
import LoginKDS from "./views/LoginKDS";
import DashboardKDS from "./views/DashboardKDS";
import AcceptanceKDS from "./views/AcceptanceKDS";
import MenuKDS from "./views/MenuKDS";
import DeliveryCodeKDS from "./views/DeliveryCodeKDS";
import StartShiftKDS from "./views/StartShiftKDS";
import ShiftSummaryKDS from "./views/ShiftSummaryKDS";
import WaitingModal from "./components/WaitingModal";
import EndShiftDialog from "./components/EndShiftDialog";
import Spinner from "./components/Spinner";
import type { ShiftBar, ViewNav } from "./components/BoardLayout";
import { useKdsAuth, type KdsView } from "./hooks/useKdsAuth";
import { useOrders } from "./hooks/useOrders";
import { useShift } from "./hooks/useShift";
import { useNow } from "./hooks/useNow";
import { useOrderAlerts } from "./hooks/useOrderAlerts";
import { useSoundEnabled } from "./hooks/useSoundEnabled";
import { pendingAcceptanceOrders, queuedDeliveryOrders, scheduledOrders } from "./lib/orderFilters";

type Screen = "board" | "code";

export default function App() {
  const auth = useKdsAuth();
  const shift = useShift({ token: auth.token, onUnauthorized: auth.logout });
  const orders = useOrders({
    token: auth.token,
    restaurantId: auth.restaurantId,
    onUnauthorized: auth.logout,
    onShiftEvent: shift.handleSocketEvent,
  });
  const now = useNow();
  const sound = useSoundEnabled();
  // Suena cuando cae un pedido nuevo en Aceptación o en Entrega (solo con el tablero abierto).
  useOrderAlerts({
    orders: orders.orders,
    loading: orders.loading,
    now,
    active: auth.isAuthenticated && !!shift.shift && !shift.shift.stale && !shift.summary,
  });
  const [screen, setScreen] = useState<Screen>("board");
  const [selectedView, setSelectedView] = useState<KdsView>("delivery");
  const [showWaiting, setShowWaiting] = useState(false);
  const [activeCodeOrderId, setActiveCodeOrderId] = useState<string | null>(null);
  // Diálogo de "Finalizar turno": primero se consultan los pendientes (checking), luego se confirma.
  const [endDialog, setEndDialog] = useState<"closed" | "checking" | "ready">("closed");

  if (!auth.isAuthenticated) {
    return <LoginKDS auth={auth} />;
  }

  // Un turno abierto sin cerrar de un día anterior no abre el panel: se cierra o se inicia uno nuevo.
  const openShift = shift.shift;

  if (shift.summary) {
    return <ShiftSummaryKDS summary={shift.summary} onDone={shift.closeSummary} />;
  }

  if (shift.loading || shift.loadingSummary) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex h-screen w-screen flex-col items-center justify-center gap-4 bg-[var(--kds-app-bg)] text-gray-500"
      >
        <Spinner className="h-10 w-10" />
        <span className="text-lg font-semibold">
          {shift.loadingSummary ? "Cargando resumen del turno…" : "Cargando turno…"}
        </span>
      </div>
    );
  }

  if (!openShift || openShift.stale) {
    return (
      <StartShiftKDS
        localName={auth.localName}
        username={auth.savedUsername}
        nextShiftNo={shift.nextShiftNo}
        enCurso={shift.pendientes.en_curso}
        staleShift={openShift}
        closedNotice={shift.closedNotice}
        starting={shift.busy === "start"}
        ending={shift.busy === "end"}
        error={shift.error}
        onStart={() => void shift.start()}
        onEndStale={() => void shift.end()}
        onViewSummary={(id) => void shift.openSummary(id)}
        onDismissNotice={shift.dismissNotice}
        onLogout={auth.logout}
      />
    );
  }

  const shiftBar: ShiftBar = {
    label: openShift.label,
    startedAtLabel: openShift.hora_inicio,
    pausedSince: shift.openPause?.started_at ?? null,
    pausedSinceLabel: shift.openPause?.hora_inicio ?? null,
    pauseBusy: shift.busy === "pause",
    onEnd: () => {
      setEndDialog("checking");
      void shift.refresh().then(() => setEndDialog("ready"));
    },
  };
  const boardError = orders.error ?? shift.error;

  const endShiftDialog = endDialog !== "closed" && (
    <EndShiftDialog
      shiftLabel={openShift.label}
      pendientes={endDialog === "checking" ? null : shift.pendientes}
      ending={shift.busy === "end"}
      onCancel={() => setEndDialog("closed")}
      onConfirm={() => void shift.end().then(() => setEndDialog("closed"))}
    />
  );

  // La página activa siempre debe estar entre las permitidas (p. ej. tras cambiar de sesión).
  const view = auth.views.includes(selectedView) ? selectedView : (auth.views[0] ?? "delivery");
  const nav: ViewNav = {
    active: view,
    allowed: auth.views,
    onChange: (next) => {
      setSelectedView(next);
      setShowWaiting(false);
    },
    counts: {
      acceptance: pendingAcceptanceOrders(orders.orders).length,
      delivery: queuedDeliveryOrders(orders.orders, now).length,
    },
    sound: { on: sound.enabled, onToggle: sound.toggle },
    waiting: {
      count: scheduledOrders(orders.orders, now).length,
      open: showWaiting,
      onToggle: () => setShowWaiting((open) => !open),
    },
  };

  // El popup de pedidos en espera se abre encima de cualquier página (botón del sidebar).
  const withWaiting = (screen: ReactNode) => (
    <>
      {screen}
      {endShiftDialog}
      {showWaiting && (
        <WaitingModal
          orders={orders.orders}
          now={now}
          onClose={() => setShowWaiting(false)}
        />
      )}
    </>
  );

  if (view === "acceptance") {
    return withWaiting(
      <AcceptanceKDS
        localName={auth.localName}
        nav={nav}
        orders={orders.orders}
        busyIds={orders.busyIds}
        error={boardError}
        isPaused={shift.paused}
        onAccept={orders.acceptOrder}
        onReject={orders.rejectOrder}
        onSimulatePayment={orders.simulatePayment}
        togglePaused={() => void shift.togglePause()}
        shiftBar={shiftBar}
        reload={orders.reload}
        onLogout={auth.logout}
      />
    );
  }

  if (view === "menu") {
    return withWaiting(
      <MenuKDS
        localName={auth.localName}
        nav={nav}
        isPaused={shift.paused}
        onUnauthorized={auth.logout}
        togglePaused={() => void shift.togglePause()}
        shiftBar={shiftBar}
        onLogout={auth.logout}
      />
    );
  }

  const activeCodeOrder = orders.orders.find((o) => o.id === activeCodeOrderId) ?? null;

  if (screen === "code" && activeCodeOrder) {
    return (
      <DeliveryCodeKDS
        order={activeCodeOrder}
        onConfirm={async (orderId, code) => {
          const ok = await orders.confirmDelivery(orderId, code);
          if (ok) setScreen("board");
          return ok;
        }}
        onBack={() => setScreen("board")}
      />
    );
  }

  return withWaiting(
    <DashboardKDS
      localName={auth.localName}
      nav={nav}
      orders={orders.orders}
      busyIds={orders.busyIds}
      error={boardError}
      isPaused={shift.paused}
      advanceStage={orders.advanceStage}
      onOpenCode={(orderId) => {
        setActiveCodeOrderId(orderId);
        setScreen("code");
      }}
      togglePaused={() => void shift.togglePause()}
      shiftBar={shiftBar}
      reload={orders.reload}
      onLogout={auth.logout}
    />
  );
}
