type TopBarProps = {
  title: string;
  userName: string;
  onLogout: () => void;
};

export default function TopBar({ title, userName, onLogout }: TopBarProps) {
  return (
    <div className="flex h-[72px] flex-shrink-0 flex-row items-center gap-4 border-b border-gray-200 bg-white px-8">
      <h1 className="flex-grow text-sm font-semibold text-gray-900">{title}</h1>
      <span className="whitespace-nowrap text-xs text-gray-500">{userName}</span>
      <button
        type="button"
        onClick={onLogout}
        className="whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold text-brand-primary hover:bg-orange-50"
      >
        Cerrar sesión
      </button>
    </div>
  );
}
