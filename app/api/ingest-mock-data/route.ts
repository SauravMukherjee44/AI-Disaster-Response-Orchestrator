import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface MockDisaster {
  source: string;
  timestamp: string;
  location: {
    name: string;
    latitude: number;
    longitude: number;
  };
  severity: string;
  disaster_type: string;
  message: string;
  affected_population: number;
  metadata: Record<string, any>;
}

async function ingestSingleDisaster(disaster: MockDisaster) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const payload = {
    title: disaster.message.substring(0, 100) + (disaster.message.length > 100 ? '...' : ''),
    description: disaster.message,
    disaster_type: disaster.disaster_type,
    severity: disaster.severity,
    latitude: disaster.location.latitude,
    longitude: disaster.location.longitude,
    affected_population: disaster.affected_population,
    metadata: {
      ...disaster.metadata,
      original_source: disaster.source,
      original_timestamp: disaster.timestamp,
      location_name: disaster.location.name,
    },
  };

  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/kestra-webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Failed to ingest disaster');
    }

    const disasterId = data.disaster.id;

    const [summarizeResponse, prioritizeResponse] = await Promise.all([
      fetch(`${supabaseUrl}/functions/v1/ai-summarize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({ disaster_id: disasterId }),
      }),
      fetch(`${supabaseUrl}/functions/v1/rl-prioritize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({ disaster_id: disasterId }),
      }),
    ]);

    return {
      success: true,
      disaster_id: disasterId,
      location: disaster.location.name,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      location: disaster.location.name,
    };
  }
}

function loadMockData(category: string): MockDisaster[] {
  const dataFiles: Record<string, string> = {
    floods: 'flood-alerts.json',
    earthquakes: 'earthquake-alerts.json',
    social: 'social-media-alerts.json',
  };

  const filename = dataFiles[category];
  if (!filename) {
    return [];
  }

  try {
    const filePath = path.join(process.cwd(), 'mock-data', filename);
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error loading ${filename}:`, error);
    return [];
  }
}

export async function POST(request: Request) {
  try {
    const { category, limit } = await request.json();

    const validCategories = ['floods', 'earthquakes', 'social', 'all'];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { success: false, error: 'Invalid category' },
        { status: 400 }
      );
    }

    let allDisasters: MockDisaster[] = [];

    if (category === 'all') {
      allDisasters = [
        ...loadMockData('floods'),
        ...loadMockData('earthquakes'),
        ...loadMockData('social'),
      ];
    } else {
      allDisasters = loadMockData(category);
    }

    const disastersToIngest = limit
      ? allDisasters.slice(0, limit)
      : allDisasters;

    if (disastersToIngest.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No data found for category',
      });
    }

    const results = [];
    for (const disaster of disastersToIngest) {
      const result = await ingestSingleDisaster(disaster);
      results.push(result);

      await new Promise(resolve => setTimeout(resolve, 500));
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    return NextResponse.json({
      success: true,
      summary: {
        total: results.length,
        successful,
        failed,
        success_rate: ((successful / results.length) * 100).toFixed(1) + '%',
      },
      results,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const floods = loadMockData('floods');
    const earthquakes = loadMockData('earthquakes');
    const social = loadMockData('social');

    return NextResponse.json({
      success: true,
      available_data: {
        floods: {
          count: floods.length,
          locations: floods.map(d => d.location.name),
        },
        earthquakes: {
          count: earthquakes.length,
          locations: earthquakes.map(d => d.location.name),
        },
        social: {
          count: social.length,
          platforms: Array.from(new Set(social.map(d => d.source.split(' ')[0]))),
        },
        total: floods.length + earthquakes.length + social.length,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
