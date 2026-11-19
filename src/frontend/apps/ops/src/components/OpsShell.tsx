import type { ReactNode } from "react";
import Sidebar, { type NavItem } from "./Sidebar";
import TopBar from "./TopBar";

type OpsShellProps = {
  navItems: NavItem[];
  activeIndex: number;
  onSelect: (index: number) => void;
  title: string;
  userName: string;
  onLogout: () => void;
  children: ReactNode;
};

export default function OpsShell({ navItems, activeIndex, onSelect, title, userName, onLogout, children }: OpsShellProps) {
  return (
    <div className="flex h-screen w-screen flex-row bg-gray-50">
      <Sidebar items={navItems} activeIndex={activeIndex} onSelect={onSelect} />
      <div className="flex min-w-0 flex-grow flex-col">
        <TopBar title={title} userName={userName} onLogout={onLogout} />
        <div className="flex min-h-0 flex-grow flex-col gap-7 overflow-auto px-8 py-7">{children}</div>
      </div>
    </div>
  );
}
