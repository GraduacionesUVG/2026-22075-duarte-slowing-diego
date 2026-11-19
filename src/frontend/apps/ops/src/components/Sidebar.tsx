import QDot from "./QDot";

export type NavItem = {
  label: string;
};

type SidebarProps = {
  items: NavItem[];
  activeIndex: number;
  onSelect: (index: number) => void;
};

export default function Sidebar({ items, activeIndex, onSelect }: SidebarProps) {
  return (
    <aside className="flex h-full w-60 flex-shrink-0 flex-col gap-1 bg-brand-sidebar p-5">
      <div className="mb-4 flex flex-row items-center gap-2 px-2">
        <QDot className="h-6 w-6" />
        <span className="text-sm font-semibold text-white">QOrder Ops</span>
      </div>

      {items.map((item, index) => (
        <button
          key={item.label}
          type="button"
          onClick={() => onSelect(index)}
          className={`rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
            index === activeIndex
              ? "bg-white/10 text-white"
              : "text-indigo-200 hover:bg-white/5 hover:text-white"
          }`}
        >
          {item.label}
        </button>
      ))}
    </aside>
  );
}
