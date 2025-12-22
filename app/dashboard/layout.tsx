"use client";

import React from "react";
import ProductivityLayout from "../(productivity)/layout";

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  // 📐 Reuse the productivity sidebar layout so the sidebar is always visible on the dashboard
  return <ProductivityLayout>{children}</ProductivityLayout>;
}
