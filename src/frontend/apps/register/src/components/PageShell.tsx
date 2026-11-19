import type { ReactNode } from "react";

export default function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[420px] flex-col gap-6 px-6 py-10">
      {children}
    </div>
  );
}
