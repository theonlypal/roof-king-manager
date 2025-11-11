import { NextRequest, NextResponse } from 'next/server';
import { suggestCategoryWithGemini } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.description || typeof body.description !== 'string') {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 });
    }
    if (body.description.length > 500) {
      return NextResponse.json({ error: 'Description too long' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ category: null });
    }

    const category = await suggestCategoryWithGemini(apiKey, body.description);
    return NextResponse.json({ category });
  } catch (error) {
    console.error('Suggest category error:', error);
    return NextResponse.json({ category: null });
  }
}
