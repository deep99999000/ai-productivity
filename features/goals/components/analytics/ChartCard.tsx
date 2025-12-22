"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ChartCardProps {
  title: string;
  icon: React.ReactNode;
  className?: string;
  children: React.ReactNode;
  subtitle?: string;
  actionButton?: React.ReactNode;
}

export const ChartCard: React.FC<ChartCardProps> = ({ title, icon, className = "", children, subtitle, actionButton }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    className={className}
  >
    <Card className="border-slate-200/70 shadow-sm hover:shadow-md transition-all duration-300 bg-gradient-to-br from-white to-slate-50 h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50 text-indigo-600 flex items-center justify-center">
              {icon}
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-slate-900">{title}</CardTitle>
              {subtitle && <p className="text-sm text-slate-600 mt-0.5">{subtitle}</p>}
            </div>
          </div>
          {actionButton}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {children}
      </CardContent>
    </Card>
  </motion.div>
);

export default ChartCard;
