import { useState } from "react";
import LoginAdmin from "./views/LoginAdmin";
import ChangePassword from "./views/ChangePassword";
import ResetPassword from "./views/ResetPassword";
import DashboardHome from "./views/DashboardHome";
import MenuPricing from "./views/MenuPricing";
import Categories from "./views/Categories";
import CatalogImport from "./views/CatalogImport";
import RestaurantSettings from "./views/RestaurantSettings";
import ShiftsSummary from "./views/ShiftsSummary";
import AdminShell from "./components/AdminShell";
import { useAdminAuth } from "./hooks/useAdminAuth";
import { readResetRoute } from "./hooks/usePasswordReset";

const NAV_ITEMS = [
  { label: "Dashboard" },
  { label: "Menús y Precios" },
  { label: "Categorías" },
  { label: "Importación de catálogos" },
  { label: "Configuración" },
  { label: "Resumen de turnos" },
];

export default function App() {
  const auth = useAdminAuth();
  const [activeIndex, setActiveIndex] = useState(0);
  const [resetRoute, setResetRoute] = useState(readResetRoute);

  if (resetRoute.active) {
    return (
      <ResetPassword
        token={resetRoute.token}
        onBackToLogin={() => {
          window.history.replaceState(null, "", "/");
          setResetRoute({ active: false, token: null });
        }}
      />
    );
  }

  if (!auth.isAuthenticated) {
    return <LoginAdmin auth={auth} />;
  }

  if (auth.mustChangePassword) {
    return <ChangePassword auth={auth} />;
  }

  const activeItem = NAV_ITEMS[activeIndex] ?? NAV_ITEMS[0]!;

  return (
    <AdminShell
      navItems={NAV_ITEMS}
      activeIndex={activeIndex}
      onSelect={setActiveIndex}
      title={activeItem.label}
      userName={`${auth.adminName} · ${auth.localName}`}
      onLogout={auth.logout}
    >
      {activeIndex === 0 && <DashboardHome />}
      {activeIndex === 1 && (
        <MenuPricing
          localName={auth.localName}
          onGoToImport={() => setActiveIndex(3)}
          onGoToCategories={() => setActiveIndex(2)}
        />
      )}
      {activeIndex === 2 && <Categories localName={auth.localName} />}
      {activeIndex === 3 && <CatalogImport />}
      {activeIndex === 4 && <RestaurantSettings localName={auth.localName} />}
      {activeIndex === 5 && <ShiftsSummary />}
    </AdminShell>
  );
}
