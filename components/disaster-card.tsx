import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, MapPin, Users, Clock } from 'lucide-react';
import { Disaster } from '@/lib/supabase';

interface DisasterCardProps {
  disaster: Disaster;
}

export function DisasterCard({ disaster }: DisasterCardProps) {
  const severityColors = {
    critical: 'bg-red-600 hover:bg-red-700',
    high: 'bg-orange-500 hover:bg-orange-600',
    medium: 'bg-yellow-500 hover:bg-yellow-600',
    low: 'bg-blue-500 hover:bg-blue-600',
  };

  const statusColors = {
    active: 'bg-red-100 text-red-800 border-red-300',
    responding: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    resolved: 'bg-green-100 text-green-800 border-green-300',
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            {disaster.title}
          </CardTitle>
          <Badge className={severityColors[disaster.severity]}>
            {disaster.severity.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-gray-600 line-clamp-2">{disaster.description}</p>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span className="text-gray-700">{disaster.disaster_type}</span>
          </div>

          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-500" />
            <span className="text-gray-700">{disaster.affected_population.toLocaleString()}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Clock className="h-3 w-3 text-gray-400" />
          <span className="text-gray-500">
            {new Date(disaster.created_at).toLocaleString()}
          </span>
        </div>

        <Badge variant="outline" className={statusColors[disaster.status]}>
          {disaster.status.toUpperCase()}
        </Badge>
      </CardContent>
    </Card>
  );
}
