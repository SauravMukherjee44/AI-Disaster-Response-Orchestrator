'use client';

import { useEffect, useState } from 'react';
import { Navigation } from '@/components/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase, Disaster, AISummary } from '@/lib/supabase';
import { FileText, Sparkles, Brain, TrendingUp, AlertCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function SummaryPage() {
  const [disasters, setDisasters] = useState<(Disaster & { ai_summaries: AISummary[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDisaster, setSelectedDisaster] = useState<(Disaster & { ai_summaries: AISummary[] }) | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('disasters')
        .select(`
          *,
          ai_summaries (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      const disastersWithSummaries = (data || []).filter(d => d.ai_summaries.length > 0);
      setDisasters(disastersWithSummaries);

      if (disastersWithSummaries.length > 0 && !selectedDisaster) {
        setSelectedDisaster(disastersWithSummaries[0]);
      }
    } catch (error: any) {
      toast.error('Failed to fetch AI summaries');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel('ai-summaries-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ai_summaries' }, () => {
        fetchData();
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
      case 'medium': return 'bg-yellow-700 text-white border-yellow-800';
      case 'low': return 'bg-blue-600 text-white border-blue-700';
      default: return 'bg-gray-600 text-white border-gray-700';
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.9) return 'text-green-400';
    if (score >= 0.7) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const avgConfidence = selectedDisaster?.ai_summaries.length
    ? selectedDisaster.ai_summaries.reduce((sum, s) => sum + s.confidence_score, 0) / selectedDisaster.ai_summaries.length
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navigation onRefresh={fetchData} loading={loading} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
              <Brain className="h-8 w-8 text-blue-400" />
              AI Situation Reports
            </h2>
            <p className="text-slate-400 mt-1">Automated intelligence analysis from Kestra workflows</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-white">{disasters.length}</div>
              <div className="text-xs text-slate-400">Reports Generated</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <Card className="bg-slate-800/50 border-slate-700 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-white text-sm">Analyzed Disasters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {disasters.map((disaster) => (
                    <div
                      key={disaster.id}
                      onClick={() => setSelectedDisaster(disaster)}
                      className={`p-3 rounded-lg cursor-pointer transition-all border ${
                        selectedDisaster?.id === disaster.id
                          ? 'bg-blue-600 border-blue-400'
                          : 'bg-slate-900/50 border-slate-700 hover:bg-slate-700/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="font-medium text-white text-sm line-clamp-2">
                          {disaster.title}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge className={`${getSeverityColor(disaster.severity)} text-xs`}>
                          {disaster.severity}
                        </Badge>
                        <span className="text-xs text-slate-400">
                          {disaster.ai_summaries.length} report{disaster.ai_summaries.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  ))}
                  {disasters.length === 0 && (
                    <div className="text-center py-8 text-slate-500">
                      <FileText className="h-10 w-10 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No AI reports yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {selectedDisaster && (
              <Card className="bg-slate-800/50 border-slate-700 shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-white text-sm">Analysis Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-slate-400">Confidence Score</span>
                      <span className={`text-lg font-bold ${getConfidenceColor(avgConfidence)}`}>
                        {(avgConfidence * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${avgConfidence * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">AI Model</span>
                      <span className="text-white font-medium">
                        {selectedDisaster.ai_summaries[0]?.model_used || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Reports</span>
                      <span className="text-white font-medium">
                        {selectedDisaster.ai_summaries.length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Affected</span>
                      <span className="text-white font-medium">
                        {selectedDisaster.affected_population.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="lg:col-span-3 space-y-6">
            {selectedDisaster ? (
              <>
                <Card className="bg-slate-800/50 border-slate-700 shadow-2xl">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-white text-xl mb-2">
                          {selectedDisaster.title}
                        </CardTitle>
                        <div className="flex items-center gap-3 text-sm">
                          <Badge className={getSeverityColor(selectedDisaster.severity)}>
                            {selectedDisaster.severity.toUpperCase()} SEVERITY
                          </Badge>
                          <span className="text-slate-400 capitalize">
                            {selectedDisaster.disaster_type}
                          </span>
                          <span className="text-slate-500">•</span>
                          <span className="text-slate-400 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(selectedDisaster.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                      <p className="text-slate-300 leading-relaxed">
                        {selectedDisaster.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {selectedDisaster.ai_summaries.map((summary) => (
                  <Card key={summary.id} className="bg-slate-800/90 border-blue-700/50 shadow-2xl">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-blue-400" />
                        AI-Generated Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <h4 className="text-blue-300 font-semibold mb-3 flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Executive Summary
                        </h4>
                        <div className="bg-slate-900/70 border border-slate-700 rounded-lg p-4">
                          <p className="text-slate-100 leading-relaxed text-base">
                            {summary.summary}
                          </p>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-blue-300 font-semibold mb-3 flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          Key Intelligence Insights
                        </h4>
                        <div className="grid gap-3">
                          {summary.key_insights.map((insight, idx) => (
                            <div
                              key={idx}
                              className="flex items-start gap-3 bg-slate-900/70 border border-slate-700 rounded-lg p-4 hover:border-blue-700/50 transition-colors"
                            >
                              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold mt-0.5">
                                {idx + 1}
                              </div>
                              <p className="text-slate-100 leading-relaxed flex-1">
                                {insight}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                        <div className="flex items-center gap-6 text-sm">
                          <div className="flex items-center gap-2">
                            <Brain className="h-4 w-4 text-blue-400" />
                            <span className="text-slate-400">Model:</span>
                            <span className="text-white font-medium">{summary.model_used}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-green-400" />
                            <span className="text-slate-400">Confidence:</span>
                            <span className={`font-bold ${getConfidenceColor(summary.confidence_score)}`}>
                              {(summary.confidence_score * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                        <div className="text-xs text-slate-500">
                          Generated {new Date(summary.created_at).toLocaleString()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <Card className="bg-slate-800/50 border-slate-700 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">Processing Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-slate-400 mb-1">Workflow Source</div>
                        <p className="text-white font-medium">Kestra AI Agent</p>
                      </div>
                      <div>
                        <div className="text-slate-400 mb-1">Processing Time</div>
                        <p className="text-white font-medium">~10-20 seconds</p>
                      </div>
                      <div>
                        <div className="text-slate-400 mb-1">Integration</div>
                        <p className="text-white font-medium">Supabase Real-time</p>
                      </div>
                      <div>
                        <div className="text-slate-400 mb-1">Status</div>
                        <Badge className="bg-green-600 text-white">Active</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="bg-slate-800/50 border-slate-700 shadow-2xl">
                <CardContent className="py-20">
                  <div className="text-center text-slate-500">
                    <AlertCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">No Disaster Selected</p>
                    <p className="text-sm mt-2">Select a disaster from the list to view AI-generated reports</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
