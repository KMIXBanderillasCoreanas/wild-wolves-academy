// app/api/nba/traditional-stats/route.ts
// Endpoint API de consulta de Estadísticas Tradicionales de la NBA (stats.nba.com)
// Vigencia: Ventana Activa de 30 Días (2 de Noviembre al 2 de Diciembre de 2026)

import { NextRequest, NextResponse } from 'next/server';
import { queryNbaTraditionalStats, getNbaApiStatus } from '@/lib/nba-intelligence/nbaStatsClient';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const player = searchParams.get('player') || undefined;
    const season = searchParams.get('season') || '2023-24';
    const seasonType = (searchParams.get('seasonType') as 'Regular Season' | 'Playoffs') || 'Regular Season';

    const result = await queryNbaTraditionalStats({
      playerQuery: player,
      season,
      seasonType
    });

    return NextResponse.json({
      success: true,
      session: result.session,
      source: result.source,
      totalPlayers: result.data.length,
      data: result.data,
      metadata: {
        queriedPlayer: player || 'TODOS',
        season,
        seasonType,
        officialReferenceUrl: 'https://www.nba.com/stats/players/traditional?utm_source=chatgpt.com',
        note: 'Datos oficiales verificados de la NBA. Cuando una métrica no existe para una temporada histórica, se indica como no disponible.'
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error al consultar el servicio de estadísticas tradicionales de la NBA.',
        session: getNbaApiStatus()
      },
      { status: 500 }
    );
  }
}
