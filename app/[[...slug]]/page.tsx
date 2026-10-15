"use client";

import dynamic from "next/dynamic";

const AppRouter = dynamic(
  () =>
    import("@/components/app-router").then((module) => module.AppRouter),
  { ssr: false },
);

export default function Page() {
  return <AppRouter />;
}
