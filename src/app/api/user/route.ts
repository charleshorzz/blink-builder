import { createClient } from "@/app/lib/supabase-server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = createClient();

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: user, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("id", session.user.id)
    .single();

  if (userError) {
    return NextResponse.json({ error: userError.message }, { status: 400 });
  }

  return NextResponse.json({ user });
}

export async function PUT(request: Request) {
  const supabase = createClient();

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const updates = await request.json();

  const { data: user, error: userError } = await supabase
    .from("users")
    .update(updates)
    .eq("id", session.user.id)
    .select()
    .single();

  if (userError) {
    return NextResponse.json({ error: userError.message }, { status: 400 });
  }

  return NextResponse.json({ user });
}
