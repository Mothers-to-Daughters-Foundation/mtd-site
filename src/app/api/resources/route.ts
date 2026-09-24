import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getAllResources,
  createResource,
} from "@/lib/models/resources";

export async function GET() {
  try {
    const resources = await getAllResources();

    return NextResponse.json({
      resources,
    });
  } catch (error) {
    console.error("[Resources GET]", error);

    return NextResponse.json(
      { error: "Failed to load resources." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const resource = await createResource({
      uploaded_by: user.id,
      title: body.title,
      description: body.description,
      type: body.type,
      file_url: body.file_url,
      thumbnail_url: body.thumbnail_url ?? null,
      visibility: body.visibility,
      category: body.category ?? null,
      tags: body.tags ?? null,
      download_count: 0,
    });

    return NextResponse.json(resource);
  } catch (error) {
    console.error("[Resources POST]", error);

    return NextResponse.json(
      { error: "Failed to create resource." },
      { status: 500 }
    );
  }
}