import { importRecipe, listRecipes } from "@/lib/sources";
import { NextResponse, NextRequest } from "next/server";
import { z } from "zod";
import { zfd } from "zod-form-data";

const schema = zfd.formData({
  url: z.string().url(),
});

export async function GET(req: NextRequest) {
  const { url } = schema.parse(req.nextUrl.searchParams);
  const result = await listRecipes(url);
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const form = schema.parse(await req.formData());
  const result = await importRecipe(form.url);
  return NextResponse.json(result);
}
