"use client";

import React from "react";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, ArrowDown, Minus, LucideIcon } from "lucide-react";

interface EnhancedMetricCardProps {
  title: string;
  value: number;
  suffix?: string;
  change?: number;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  iconColor?: string;
  subtitle?: string;
  delay?: number;
  decimals?: number;
  animateValue?: boolean;
  badge?: string;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

export const EnhancedMetricCard: React.FC<EnhancedMetricCardProps> = ({
  title,
  value,
  suffix = '',
  change,
  changeType = 'neutral',
  icon: Icon,
  iconColor = 'from-indigo-500 to-purple-600',
  subtitle,
  delay = 0,
  decimals = 0,
  animateValue = true,
  badge,
  badgeVariant = 'default'
}) => {
  const fadeIn = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay },
  };

  return (
    <motion.div {...fadeIn}>
      <Card className="relative overflow-hidden border-slate-200/70 shadow-sm hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white via-slate-50/20 to-slate-100/30 group">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-3 flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-600">{title}</p>
                {badge && (
                  <Badge variant={badgeVariant} className="text-xs">
                    {badge}
                  </Badge>
                )}
              </div>
              
              <div className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                {animateValue ? (
                  <CountUp 
                    end={value} 
                    duration={2} 
                    decimals={decimals}
                    suffix={suffix}
                  />
                ) : (
                  `${value}${suffix}`
                )}
              </div>
              
              <div className="flex items-center gap-3">
                {change !== undefined && (
                  <div className={`flex items-center gap-1 text-sm font-medium ${
                    changeType === 'positive' ? 'text-emerald-600' : 
                    changeType === 'negative' ? 'text-red-600' : 'text-slate-500'
                  }`}>
                    {changeType === 'positive' ? <ArrowUp className="w-3 h-3" /> :
                     changeType === 'negative' ? <ArrowDown className="w-3 h-3" /> :
                     <Minus className="w-3 h-3" />}
                    {Math.abs(change)}%
                  </div>
                )}
                {subtitle && (
                  <span className="text-xs text-slate-500">{subtitle}</span>
                )}
              </div>
            </div>
            
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${iconColor} flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
          </div>
          
          {/* Subtle background pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-slate-100/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default EnhancedMetricCard;
