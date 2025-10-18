"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface AnalyticsLoadingProps {
  sections?: number;
  chartsPerSection?: number;
}

export const AnalyticsLoading: React.FC<AnalyticsLoadingProps> = ({
  sections = 3,
  chartsPerSection = 2
}) => {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-12 h-12 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        
        {/* KPI Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="border-slate-200/70">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="w-12 h-12 rounded-xl" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Sections Skeleton */}
      {Array.from({ length: sections }).map((_, sectionIndex) => (
        <motion.div
          key={sectionIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: sectionIndex * 0.1 }}
          className="space-y-6"
        >
          {/* Section Header */}
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>

          {/* Charts Grid */}
          <div className={`grid grid-cols-1 ${chartsPerSection > 1 ? 'lg:grid-cols-2' : ''} gap-6`}>
            {Array.from({ length: chartsPerSection }).map((_, chartIndex) => (
              <Card key={chartIndex} className="border-slate-200/70">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-9 h-9 rounded-lg" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-3 w-36" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-64 w-full rounded-lg" />
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default AnalyticsLoading;
