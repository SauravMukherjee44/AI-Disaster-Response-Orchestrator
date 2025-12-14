import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Activity, CheckCircle2, Users } from 'lucide-react';

interface StatCardsProps {
  activeDisasters: number;
  totalAffected: number;
  activeActions: number;
  completedActions: number;
}

export function StatCards({
  activeDisasters,
  totalAffected,
  activeActions,
  completedActions
}: StatCardsProps) {
  const stats = [
    {
      label: 'Active Disasters',
      value: activeDisasters,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      gradient: 'from-red-500 to-red-600',
      borderColor: 'border-red-200',
    },
    {
      label: 'People Affected',
      value: totalAffected.toLocaleString(),
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      gradient: 'from-orange-500 to-orange-600',
      borderColor: 'border-orange-200',
    },
    {
      label: 'Active Actions',
      value: activeActions,
      icon: Activity,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      gradient: 'from-blue-500 to-blue-600',
      borderColor: 'border-blue-200',
    },
    {
      label: 'Completed Actions',
      value: completedActions,
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      gradient: 'from-green-500 to-green-600',
      borderColor: 'border-green-200',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card
          key={stat.label}
          className={`border-2 ${stat.borderColor} card-hover animate-scale-in overflow-hidden`}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <CardContent className="p-0">
            <div className={`h-1 bg-gradient-to-r ${stat.gradient}`} />
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                    {stat.label}
                  </p>
                  <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
                <div className={`p-4 rounded-2xl ${stat.bgColor} ring-2 ring-white shadow-lg`}>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
