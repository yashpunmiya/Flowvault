"use client";

import dynamic from "next/dynamic";

const FlowVaultDemo = dynamic(
  () => import("@/components/FlowVaultDemo").then((module) => module.FlowVaultDemo),
  { ssr: false }
);

export function DemoShell() {
  return <FlowVaultDemo />;
}
