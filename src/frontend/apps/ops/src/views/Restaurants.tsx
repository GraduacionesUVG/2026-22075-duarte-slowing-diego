import StatusBadge from "../components/StatusBadge";
import { useRestaurants } from "../hooks/useRestaurants";

export default function Restaurants() {
  const {
    locales,
    selected,
    selectedId,
    selectLocale,
    loading,
    error,
    notice,
    formName,
    setFormName,
    formAdminName,
    setFormAdminName,
    formEmail,
    setFormEmail,
    formLocation,
    setFormLocation,
    canCreate,
    creating,
    createRestaurant,
    resendAccess,
    resendingId,
    newAdminName,
    setNewAdminName,
    newAdminEmail,
    setNewAdminEmail,
    canAddAdmin,
    addingAdmin,
    addAdmin,
  } = useRestaurants();

  const activeCount = locales.filter((l) => l.status === "success").length;
  const connectedStations = locales.reduce((n, l) => n + l.stations.filter((s) => s.connected).length, 0);
  const totalStations = locales.reduce((n, l) => n + l.stations.length, 0);

  return (
    <>
      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-xs font-medium text-red-700">{error}</p>}
      {notice && <p className="rounded-lg bg-green-50 px-4 py-3 text-xs font-medium text-green-700">{notice}</p>}
      <div className="flex flex-row gap-5">
        <div className="flex w-64 flex-shrink-0 flex-col gap-2 rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
          <span className="text-xs font-semibold text-gray-500">Restaurantes activos</span>
          <span className="text-lg font-bold text-gray-900">{activeCount}</span>
        </div>
        <div className="flex w-64 flex-shrink-0 flex-col gap-2 rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
          <span className="text-xs font-semibold text-gray-500">Estaciones KDS conectadas</span>
          <span className="text-lg font-bold text-gray-900">
            {connectedStations} de {totalStations}
          </span>
        </div>
      </div>

      <div className="flex flex-row items-start gap-6">
        <div className="flex min-w-0 flex-grow flex-col gap-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <div className="flex flex-row items-center gap-3">
            <span className="flex-grow text-sm font-semibold text-gray-900">Restaurantes registrados</span>
            <span className="whitespace-nowrap text-xs text-gray-500">
              {loading ? "Cargando…" : `${locales.length} locales`}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {locales.map((loc) => (
              <button
                key={loc.id}
                type="button"
                onClick={() => selectLocale(loc.id)}
                className={`flex flex-row items-center gap-4 rounded-lg bg-white p-4 text-left shadow-sm ring-1 ${
                  loc.id === selectedId ? "ring-2 ring-brand-primary" : "ring-gray-200"
                }`}
              >
                <div className="flex min-w-0 flex-grow flex-col gap-1">
                  <span className="text-sm font-semibold text-gray-900">{loc.name}</span>
                  <span className="text-xs text-gray-500">{loc.location}</span>
                </div>
                <div className="flex w-32 flex-shrink-0 flex-col gap-1">
                  <span className="text-xs font-semibold text-gray-500">Estaciones KDS</span>
                  <span className="font-bold text-gray-900">{loc.stations.length}</span>
                </div>
                <StatusBadge status={loc.status} label={loc.statusLabel} />
              </button>
            ))}
          </div>
        </div>

        <div className="flex w-96 flex-shrink-0 flex-col gap-6">
          <div className="flex flex-col gap-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <span className="text-sm font-semibold text-gray-900">Registrar restaurante</span>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-gray-600">Nombre del local</span>
              <input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="h-10 rounded-lg px-3 text-sm text-gray-900 ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-gray-600">Usuario del administrador</span>
              <input
                value={formAdminName}
                onChange={(e) => setFormAdminName(e.target.value)}
                className="h-10 rounded-lg px-3 text-sm text-gray-900 ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-gray-600">Correo del administrador</span>
              <input
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                className="h-10 rounded-lg px-3 text-sm text-gray-900 ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
              <span className="text-xs text-gray-500">
                A este correo llega el enlace para crear la contraseña del back-office. No existe
                registro público.
              </span>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-gray-600">Ubicación del local (opcional)</span>
              <input
                value={formLocation}
                onChange={(e) => setFormLocation(e.target.value)}
                maxLength={300}
                placeholder="Ej. CIT · Nivel 1"
                className="h-10 rounded-lg px-3 text-sm text-gray-900 ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </label>

            <div className="flex flex-col gap-1.5 rounded-lg bg-gray-50 p-4">
              <span className="text-xs font-semibold text-gray-900">Al crear el restaurante</span>
              <span className="text-xs leading-relaxed text-gray-500">
                Se crea el restaurante y la cuenta de back-office de su administrador. Las
                estaciones KDS (usuario y PIN) las crea el propio administrador y el bot ofrece el local en cuanto
                publique menú.
              </span>
            </div>

            <button
              type="button"
              onClick={() => void createRestaurant()}
              disabled={!canCreate}
              className="h-11 rounded-lg bg-brand-primary text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              {creating ? "Creando…" : "Crear restaurante"}
            </button>
          </div>

          {selected && (
            <div className="flex flex-col gap-3 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
              <span className="text-sm font-semibold text-gray-900">{selected.name}</span>
              {[
                { label: "Ubicación", value: selected.location },
                {
                  label: "Estaciones conectadas",
                  value: `${selected.stations.filter((s) => s.connected).length} de ${selected.stations.length}`,
                },
              ].map((row) => (
                <div key={row.label} className="flex flex-row gap-3">
                  <span className="flex-grow text-xs text-gray-500">{row.label}</span>
                  <span className="text-right text-xs font-bold text-gray-900">{row.value}</span>
                </div>
              ))}

              <span className="pt-2 text-xs font-semibold text-gray-600">Administradores</span>
              {selected.admins.length === 0 && <span className="text-xs text-gray-500">Sin administradores.</span>}
              {selected.admins.map((admin) => (
                <div key={admin.id} className="flex flex-row items-center gap-3">
                  <div className="flex min-w-0 flex-grow flex-col">
                    <span className="truncate text-xs font-bold text-gray-900">{admin.email}</span>
                    <span className="text-xs text-gray-500">
                      {admin.password_pending
                        ? "Aún no define su contraseña"
                        : admin.last_login_at
                          ? `Último ingreso ${new Date(admin.last_login_at).toLocaleDateString("es-GT")}`
                          : "Sin ingresos todavía"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => void resendAccess(admin)}
                    disabled={resendingId === admin.id}
                    className="whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold text-gray-700 ring-1 ring-gray-200 disabled:opacity-50"
                  >
                    {resendingId === admin.id ? "Enviando…" : admin.password_pending ? "Reenviar acceso" : "Enviar cambio de clave"}
                  </button>
                </div>
              ))}

              <div className="flex flex-col gap-2 rounded-lg bg-gray-50 p-3">
                <span className="text-xs font-semibold text-gray-600">Agregar administrador</span>
                <input
                  value={newAdminName}
                  onChange={(e) => setNewAdminName(e.target.value)}
                  placeholder="Usuario"
                  aria-label="Usuario del nuevo administrador"
                  className="h-9 rounded-lg px-3 text-xs text-gray-900 ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
                <input
                  type="email"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  placeholder="Correo"
                  aria-label="Correo del nuevo administrador"
                  className="h-9 rounded-lg px-3 text-xs text-gray-900 ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
                <button
                  type="button"
                  onClick={() => void addAdmin()}
                  disabled={!canAddAdmin}
                  className="h-9 rounded-lg bg-brand-primary text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {addingAdmin ? "Creando…" : "Crear administrador"}
                </button>
              </div>

              <span className="pt-2 text-xs font-semibold text-gray-600">Estaciones KDS</span>
              {selected.stations.length === 0 && <span className="text-xs text-gray-500">Sin estaciones.</span>}
              {selected.stations.map((s) => (
                <div key={s.kds_user_id} className="flex flex-row items-center gap-3">
                  <span className="flex-grow text-xs font-bold text-gray-900">{s.username}</span>
                  <StatusBadge
                    status={!s.active ? "warning" : s.connected ? "success" : "info"}
                    label={!s.active ? "Pausada" : s.connected ? "Conectada" : "Sin conexión"}
                  />
                </div>
              ))}
              <p className="text-xs leading-relaxed text-gray-500">
                Por seguridad los PIN no se pueden consultar. El administrador del local puede definir uno nuevo
                desde su back-office.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
