import { NextRequest, NextResponse } from 'next/server';

let blinkConfig: {
  title: string;
  description: string;
  icon: string;
  amounts: string[];
} | null = null;

export async function POST(req: NextRequest) {
  const formData = await req.formData();

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const amounts = JSON.parse(formData.get('amounts') as string); // send as JSON string from frontend
  const file = formData.get('icon') as File | null;

  let icon = '';

  if (file && file.type.startsWith('image/')) {
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    icon = `data:${file.type};base64,${base64}`;
  }

  blinkConfig = { title, description, icon, amounts };
  return NextResponse.json({ success: true });
}

export async function GET() {
  return NextResponse.json(blinkConfig || {});
}
