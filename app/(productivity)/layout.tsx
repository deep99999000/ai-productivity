"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  CheckSquare,
  Clock,
  Target,
  Folder,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Todos", icon: CheckSquare, href: "/todos" },
  { label: "Pomodoro", icon: Clock, href: "/pomodoro" },
  { label: "Goals", icon: Target, href: "/goals" },
  { label: "Projects", icon: Folder, href: "/dashboard/projects" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-gray-1 text-gray-12">
      {/* Sidebar */}
      <aside
        className={cn(
          "flex flex-col border-r border-gray-6 bg-gray-2 transition-all duration-300 ease-in-out",
          collapsed ? "w-20" : "w-72"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-6">
          {!collapsed && <h1 className="text-xl font-bold">Productivity</h1>}
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navItems.map(({ label, icon: Icon, href }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-12 hover:bg-gray-4 transition-colors",
                collapsed && "justify-center px-2"
              )}
            >
              <Icon className="w-5 h-5" />
              {!collapsed && <span>{label}</span>}
            </Link>
          ))}
        </nav>

        <Separator />

        {/* Settings */}
        <div className="p-2">
          <Link
            href="/settings"
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-12 hover:bg-gray-4 transition-colors",
              collapsed && "justify-center px-2"
            )}
          >
            <Settings className="w-5 h-5" />
            {!collapsed && <span>Settings</span>}
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}
