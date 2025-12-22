import React from "react";

export const CHART_COLORS = {
  primary: ['#6366f1', '#8b5cf6', '#3b82f6', '#06b6d4', '#10b981'],
  secondary: ['#f59e0b', '#ef4444', '#ec4899', '#84cc16', '#f97316'],
  gradients: {
    blue: 'url(#blueGradient)',
    purple: 'url(#purpleGradient)',
    green: 'url(#greenGradient)',
    orange: 'url(#orangeGradient)',
    red: 'url(#redGradient)',
  }
};

export const ChartGradients = () => (
  <defs>
    <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1}/>
    </linearGradient>
    <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
    </linearGradient>
    <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
      <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
    </linearGradient>
    <linearGradient id="orangeGradient" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
    </linearGradient>
    <linearGradient id="redGradient" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
      <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
    </linearGradient>
  </defs>
);

export default ChartGradients;
