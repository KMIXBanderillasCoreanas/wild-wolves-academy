// app/api/nba/intelligence-profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getComprehensive6DPlayerProfile } from '@/lib/nba-intelligence/dunkApiClient';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const playerKey = (searchParams.get('player') || 'curry') as 'curry' | 'lebron' | 'jordan';

    const profile = await getComprehensive6DPlayerProfile(playerKey);

    return NextResponse.json({
      success: true,
      data: profile
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error al obtener perfil 6D'
      },
      { status: 500 }
    );
  }
}
