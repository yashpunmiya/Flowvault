"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { docsNav } from "@/lib/docs-nav";

export function DocsSidebar() {
  const pathname = usePathname();

  const groups = {
    Start: docsNav.filter((item) => item.group === "Start"),
    Build: docsNav.filter((item) => item.group === "Build"),
    Operate: docsNav.filter((item) => item.group === "Operate"),
  };

  return (
    <aside className="docs-sidebar" aria-label="Documentation navigation">
      <Link href="/docs/getting-started" className="docs-brand">
        <span className="docs-brand-mark" />
        <span>FlowVault Docs</span>
      </Link>

      {(Object.keys(groups) as Array<keyof typeof groups>).map((group) => (
        <div key={group} className="docs-group">
          <h3>{group}</h3>
          <ul>
            {groups[group].map((item) => {
              const active = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link href={item.href} className={active ? "active" : ""}>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </aside>
  );
}
