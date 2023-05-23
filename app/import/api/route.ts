import { importRecipe } from "@/lib/sources/import";
import { NextResponse, NextRequest } from "next/server";
import { z } from "zod";
import { zfd } from "zod-form-data";

const schema = zfd.formData({
  url: z.string().url(),
});

export async function POST(req: NextRequest) {
  const form = schema.parse(await req.formData());
  const recipe = await importRecipe(form.url);

  return NextResponse.json(recipe);
}
