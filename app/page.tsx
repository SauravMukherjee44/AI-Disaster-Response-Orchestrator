'use client';

import { useEffect, useState } from 'react';
import { Navigation } from '@/components/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase, Disaster } from '@/lib/supabase';
import { MapPin, Users, Activity, AlertTriangle, Database, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function LiveMapPage() {
  const [disasters, setDisasters] = useState<Disaster[]>([]);
  const [loading, setLoading] = useState(true);
  const [ingesting, setIngesting] = useState(false);
  const [selectedDisaster, setSelectedDisaster] = useState<Disaster | null>(null);

  const fetchDisasters = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('disasters')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDisasters(data || []);
    } catch (error: any) {
      toast.error('Failed to fetch disasters');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisasters();

    const channel = supabase
      .channel('disasters-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'disasters' }, () => {
        fetchDisasters();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600 text-white border-red-700';
      case 'high': return 'bg-orange-600 text-white border-orange-700';
      case 'medium': return 'bg-yellow-600 text-white border-yellow-700';
      case 'low': return 'bg-blue-600 text-white border-blue-700';
      default: return 'bg-gray-600 text-white border-gray-700';
    }
  };

  const getDisasterIcon = (type: string) => {
    return '🌍';
  };

  const centerLat = disasters.length > 0
    ? disasters.reduce((sum, d) => sum + d.latitude, 0) / disasters.length
    : 0;
  const centerLng = disasters.length > 0
    ? disasters.reduce((sum, d) => sum + d.longitude, 0) / disasters.length
    : 0;

  const handleIngestMockData = async () => {
    setIngesting(true);
    try {
      const response = await fetch('/api/ingest-mock-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: 'all',
          limit: 10,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to ingest mock data');
      }

      toast.success(`Successfully ingested ${data.summary?.successful || 0} disasters (${data.summary?.failed || 0} failed)`);
      fetchDisasters();
    } catch (error: any) {
      toast.error(error.message || 'Failed to ingest mock data');
      console.error(error);
    } finally {
      setIngesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navigation onRefresh={fetchDisasters} loading={loading} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white">Live Disaster Map</h2>
            <p className="text-slate-400 mt-1">Real-time visualization of active emergency situations</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2 text-slate-300">
                <Activity className="h-4 w-4 text-green-500 animate-pulse" />
                <span>Live Updates</span>
              </div>
              <div className="text-slate-400">
                {disasters.length} Active Events
              </div>
            </div>
            <Button
              onClick={handleIngestMockData}
              disabled={ingesting}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg"
            >
              {ingesting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Ingesting...
                </>
              ) : (
                <>
                  <Database className="h-4 w-4 mr-2" />
                  Load Mock Data
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="bg-slate-800/50 border-slate-700 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-red-500" />
                  Geographic Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative bg-slate-900 rounded-lg overflow-hidden border border-slate-700" style={{ height: '500px' }}>
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900">
                    <div className="absolute inset-0 opacity-20">
                      <svg width="100%" height="100%">
                        <defs>
                          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgb(148, 163, 184)" strokeWidth="0.5"/>
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                      </svg>
                    </div>

                    <div className="relative w-full h-full flex items-center justify-center">
                      <div className="relative" style={{ width: '90%', height: '90%' }}>
                        {disasters.map((disaster, index) => {
                          const normalizedLat = ((disaster.latitude + 90) / 180) * 100;
                          const normalizedLng = ((disaster.longitude + 180) / 360) * 100;

                          return (
                            <div
                              key={disaster.id}
                              className="absolute cursor-pointer group"
                              style={{
                                left: `${normalizedLng}%`,
                                top: `${100 - normalizedLat}%`,
                                transform: 'translate(-50%, -50%)',
                              }}
                              onClick={() => setSelectedDisaster(disaster)}
                            >
                              <div className="relative">
                                <div className={`absolute inset-0 rounded-full blur-xl opacity-60 animate-pulse ${
                                  disaster.severity === 'critical' ? 'bg-red-500' :
                                  disaster.severity === 'high' ? 'bg-orange-500' :
                                  disaster.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                                }`} style={{ width: '60px', height: '60px', transform: 'translate(-50%, -50%)', left: '50%', top: '50%' }} />

                                <div className={`relative w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold shadow-lg ring-2 ring-white/30 transition-transform group-hover:scale-125 ${
                                  disaster.severity === 'critical' ? 'bg-red-600' :
                                  disaster.severity === 'high' ? 'bg-orange-500' :
                                  disaster.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                                }`}>
                                  {getDisasterIcon(disaster.disaster_type)}
                                </div>
                              </div>

                              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                <div className="bg-slate-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl border border-slate-700 whitespace-nowrap">
                                  <div className="font-semibold">{disaster.title}</div>
                                  <div className="text-slate-400 mt-1">{disaster.disaster_type}</div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {disasters.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-slate-500">
                        <AlertTriangle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p className="text-lg font-medium">No Active Disasters</p>
                        <p className="text-sm mt-1">Monitoring all regions</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 mt-4 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-600" />
                    <span>Critical</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500" />
                    <span>High</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <span>Medium</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span>Low</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-white text-lg">Event Details</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedDisaster ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-white mb-1">{selectedDisaster.title}</h3>
                      <Badge className={getSeverityColor(selectedDisaster.severity)}>
                        {selectedDisaster.severity.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div>
                        <div className="text-slate-400 mb-1">Description</div>
                        <p className="text-slate-200">{selectedDisaster.description}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-slate-400 mb-1">Type</div>
                          <p className="text-white font-medium capitalize">{selectedDisaster.disaster_type}</p>
                        </div>
                        <div>
                          <div className="text-slate-400 mb-1">Status</div>
                          <p className="text-white font-medium capitalize">{selectedDisaster.status}</p>
                        </div>
                      </div>

                      <div>
                        <div className="text-slate-400 mb-1 flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Affected Population
                        </div>
                        <p className="text-white font-semibold text-lg">
                          {selectedDisaster.affected_population.toLocaleString()}
                        </p>
                      </div>

                      <div>
                        <div className="text-slate-400 mb-1">Coordinates</div>
                        <p className="text-slate-300 font-mono text-xs">
                          {selectedDisaster.latitude.toFixed(4)}, {selectedDisaster.longitude.toFixed(4)}
                        </p>
                      </div>

                      <div>
                        <div className="text-slate-400 mb-1">Reported</div>
                        <p className="text-slate-300">
                          {new Date(selectedDisaster.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <MapPin className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Click on a marker to view details</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-white text-lg">Recent Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {disasters.slice(0, 5).map((disaster) => (
                    <div
                      key={disaster.id}
                      className={`p-3 rounded-lg cursor-pointer transition-all hover:bg-slate-700/50 border ${
                        selectedDisaster?.id === disaster.id
                          ? 'bg-slate-700/50 border-red-500'
                          : 'bg-slate-900/50 border-slate-700'
                      }`}
                      onClick={() => setSelectedDisaster(disaster)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-white text-sm truncate">{disaster.title}</p>
                          <p className="text-xs text-slate-400 mt-1 capitalize">{disaster.disaster_type}</p>
                        </div>
                        <Badge className={`${getSeverityColor(disaster.severity)} text-xs flex-shrink-0`}>
                          {disaster.severity}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {disasters.length === 0 && (
                    <p className="text-center text-slate-500 py-4 text-sm">No events to display</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
