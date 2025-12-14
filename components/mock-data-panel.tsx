'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Database, Loader2, CheckCircle2, XCircle, Waves, Building2, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

export function MockDataPanel() {
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState('all');
  const [limit, setLimit] = useState('5');
  const [lastResult, setLastResult] = useState<any>(null);

  const handleIngest = async () => {
    setLoading(true);
    setLastResult(null);

    try {
      const response = await fetch('/api/ingest-mock-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          limit: parseInt(limit),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setLastResult(data.summary);
        toast.success(`Ingested ${data.summary.successful} disasters successfully!`);
      } else {
        toast.error(data.error || 'Failed to ingest data');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to ingest data');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: 'all', label: 'All Disasters', icon: Database, color: 'text-gray-600' },
    { value: 'floods', label: 'Flood Alerts', icon: Waves, color: 'text-blue-600' },
    { value: 'earthquakes', label: 'Earthquakes', icon: Building2, color: 'text-orange-600' },
    { value: 'social', label: 'Social Media', icon: MessageSquare, color: 'text-purple-600' },
  ];

  const selectedCategory = categories.find(c => c.value === category);
  const Icon = selectedCategory?.icon || Database;

  return (
    <Card className="border-2 border-dashed border-gray-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-blue-600" />
          Mock Data Ingestion
        </CardTitle>
        <CardDescription>
          Load sample disaster data for testing and demos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Data Source</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    <div className="flex items-center gap-2">
                      <cat.icon className={`h-4 w-4 ${cat.color}`} />
                      {cat.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Number of Records</label>
            <Select value={limit} onValueChange={setLimit}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 record</SelectItem>
                <SelectItem value="3">3 records</SelectItem>
                <SelectItem value="5">5 records</SelectItem>
                <SelectItem value="10">10 records</SelectItem>
                <SelectItem value="999">All available</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Action</label>
            <Button
              onClick={handleIngest}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Ingesting...
                </>
              ) : (
                <>
                  <Icon className="h-4 w-4 mr-2" />
                  Ingest Data
                </>
              )}
            </Button>
          </div>
        </div>

        {lastResult && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-2">
            <h4 className="font-semibold text-sm">Ingestion Results</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600">Total:</span>
                <Badge variant="outline">{lastResult.total}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3 w-3 text-green-600" />
                <span className="text-xs text-gray-600">Success:</span>
                <Badge className="bg-green-100 text-green-800">{lastResult.successful}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="h-3 w-3 text-red-600" />
                <span className="text-xs text-gray-600">Failed:</span>
                <Badge className="bg-red-100 text-red-800">{lastResult.failed}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600">Rate:</span>
                <Badge variant="outline">{lastResult.success_rate}</Badge>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 p-3 bg-blue-50 rounded-lg text-xs text-blue-800">
          <p className="font-semibold mb-1">Demo Tip:</p>
          <p>Use this to quickly populate your dashboard with realistic disaster scenarios. Each record triggers full AI analysis and RL prioritization.</p>
        </div>
      </CardContent>
    </Card>
  );
}
