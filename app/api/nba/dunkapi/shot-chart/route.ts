// app/api/nba/dunkapi/shot-chart/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getPlayerShotChart } from '@/lib/nba-intelligence/dunkApiClient';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const playerId = searchParams.get('playerId') || '3975'; // Default Stephen Curry
    const season = parseInt(searchParams.get('season') || '2024', 10);

    const shotChart = await getPlayerShotChart(playerId, season);

    return NextResponse.json({
      success: true,
      data: shotChart,
      provider: 'DunkAPI Spatial Intelligence',
      mcpTransport: 'https://mcp.dunkapi.com/mcp'
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error al obtener mapa de tiros de DunkAPI'
      },
      { status: 500 }
    );
  }
}
