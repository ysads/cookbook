import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({ id: z.coerce.number().int() });
export async function POST(request: NextRequest) {
  try {
    const args = schema.parse(await request.json());
    console.log(":: args", args);

    await prisma.recipeImport.update({
      data: { status: "rejected" },
      where: { id: args.id },
    });

    return NextResponse.json({ id: args.id });
  } catch (ee) {
    console.log(ee);
    return NextResponse.json({}, { status: 422 });
  }
}
