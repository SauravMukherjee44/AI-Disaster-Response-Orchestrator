'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AlertCircle, Map, FileText, CheckSquare, TrendingUp, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NavigationProps {
  onRefresh?: () => void;
  loading?: boolean;
}

export function Navigation({ onRefresh, loading }: NavigationProps) {
  const pathname = usePathname();

  const navItems = [
    {
      href: '/',
      label: 'Live Map',
      icon: Map,
      description: 'Real-time disaster visualization'
    },
    {
      href: '/summary',
      label: 'AI Reports',
      icon: FileText,
      description: 'Generated situation reports'
    },
    {
      href: '/actions',
      label: 'Actions',
      icon: CheckSquare,
      description: 'Response decisions'
    },
    {
      href: '/learning',
      label: 'RL Insights',
      icon: TrendingUp,
      description: 'Learning improvements'
    },
  ];

  return (
    <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-red-900/20 shadow-2xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-red-500 rounded-xl blur-md opacity-60 animate-pulse" />
              <div className="relative p-2.5 bg-gradient-to-br from-red-500 to-red-700 rounded-xl shadow-lg ring-2 ring-red-400/30">
                <AlertCircle className="h-7 w-7 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Emergency Response Command
              </h1>
              <p className="text-xs text-slate-400 font-medium">
                AI-Orchestrated Crisis Management System
              </p>
            </div>
          </div>
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
              className="border-slate-600 bg-slate-800/50 text-slate-200 hover:bg-slate-700 hover:text-white hover:border-slate-500 transition-all"
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
              Refresh Data
            </Button>
          )}
        </div>

        <nav className="flex items-center gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200",
                  isActive
                    ? "bg-red-600 text-white shadow-lg shadow-red-500/25"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                )}
              >
                <Icon className={cn(
                  "h-4 w-4 transition-transform",
                  isActive ? "scale-110" : "group-hover:scale-105"
                )} />
                <span className="text-sm">{item.label}</span>

                {isActive && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
