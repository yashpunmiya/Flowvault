export type DocsNavItem = {
  href: string;
  label: string;
  group: "Start" | "Build" | "Integrate" | "Operate";
};

export const docsNav: DocsNavItem[] = [
  { href: "/docs/getting-started", label: "Getting Started", group: "Start" },
  { href: "/docs/contracts", label: "Contracts", group: "Build" },
  { href: "/docs/sdk", label: "FlowVault SDK", group: "Build" },
  { href: "/docs/events", label: "Event Documentation", group: "Build" },
  { href: "/docs/demo-app", label: "Demo App", group: "Build" },
  { href: "/docs/implementation", label: "Implementation", group: "Build" },
  { href: "/docs/ai-integration", label: "AI Integration", group: "Integrate" },
  { href: "/docs/indexing", label: "Historical Indexing", group: "Operate" },
  { href: "/docs/deployment", label: "Deployment", group: "Operate" },
  { href: "/docs/troubleshooting", label: "Troubleshooting", group: "Operate" },
];
