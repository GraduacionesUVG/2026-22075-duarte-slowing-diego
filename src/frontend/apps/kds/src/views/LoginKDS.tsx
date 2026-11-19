import Keypad from "../components/Keypad";
import PinBoxes from "../components/PinBoxes";
import QDot from "../components/QDot";
import { useKdsAuth } from "../hooks/useKdsAuth";

type LoginKDSProps = {
  auth: ReturnType<typeof useKdsAuth>;
};

export default function LoginKDS({ auth }: LoginKDSProps) {
  const { pin, minPinLength, maxPinLength, error, enterDigit, backspace, clear, submit } = auth;
  const { savedUsername, usernameInput, changeUsername, switchUser, canSubmit, submitting } = auth;
  // Cuadros del PIN: 4 como mínimo, y crecen si el PIN del local es más largo (hasta 8).
  const boxes = Math.min(maxPinLength, Math.max(minPinLength, pin.length));

  return (
    <div className="flex h-screen w-screen flex-row bg-white">
      <div className="flex w-64 flex-shrink-0 flex-col gap-5 bg-kds-sidebar p-8 lg:w-96 lg:p-12">
        <div className="flex flex-row items-center gap-2.5">
          <QDot className="h-6 w-6" />
          <span className="text-lg font-semibold text-white">QOrder KDS</span>
        </div>
        <span className="mt-auto text-lg font-semibold leading-tight text-white">
          {savedUsername
            ? "Ingresa el PIN de tu estación."
            : "Ingresa el usuario y el PIN de tu estación."}
        </span>
      </div>

      <div className="flex flex-grow flex-col items-center overflow-auto p-6 short:p-4 lg:p-12">
        <div className="my-auto flex w-[352px] max-w-full flex-col items-center gap-7 short:gap-4">
          {savedUsername ? (
            <div className="flex flex-col items-center gap-1">
              <span className="text-lg font-semibold text-gray-900">
                {savedUsername}
              </span>
              <button
                type="button"
                onClick={switchUser}
                className="text-xs font-semibold text-kds-brand underline"
              >
                No soy yo · cambiar usuario
              </button>
            </div>
          ) : (
            <input
              type="text"
              autoFocus
              autoCapitalize="none"
              autoComplete="username"
              placeholder="Usuario"
              value={usernameInput}
              onChange={(e) => changeUsername(e.target.value)}
              className="kds-ring-border h-14 w-full rounded-[20px] bg-white px-5 text-center text-lg font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-kds-brand"
            />
          )}
          <span className="text-lg font-semibold text-gray-900">PIN</span>
          <PinBoxes length={boxes} value={pin} error={!!error} />
          <Keypad onDigit={enterDigit} onClear={clear} onBackspace={backspace} />
          {error && <span className="text-center text-xs font-semibold text-red-600">{error}</span>}
          <button
            type="button"
            disabled={!canSubmit}
            onClick={() => void submit()}
            className="h-14 w-full rounded-[20px] bg-kds-brand text-lg font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting ? "Ingresando…" : "Iniciar sesión"}
          </button>
        </div>
      </div>
    </div>
  );
}
