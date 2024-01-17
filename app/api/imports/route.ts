import { Course } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const getSchema = z.object({
  term: z.string().optional(),
  take: z.coerce.number().min(1),
  lastId: z.coerce.number().nullish(),
  status: z.string().optional(),
  page: z.coerce.number().min(0).default(0),
  courses: z
    .string()
    .transform((val, _) => (val ? val.split(",") : []))
    .pipe(z.nativeEnum(Course).array())
    .nullish(),
});

export async function GET(request: NextRequest) {
  const args = getSchema.parse(
    Object.fromEntries(request.nextUrl.searchParams.entries())
  );

  const termFilter = args.term
    ? {
        OR: [
          {
            title: { contains: `%${args.term}%`, mode: "insensitive" } as const,
          },
          {
            url: { contains: `%${args.term}%`, mode: "insensitive" } as const,
          },
        ],
      }
    : {};

  const count = await prisma.recipeImport.count({
    where: {
      AND: {
        status: args.status,
        ...termFilter,
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const imports = await prisma.recipeImport.findMany({
    where: {
      AND: {
        status: args.status,
        ...termFilter,
      },
    },
    orderBy: { createdAt: "asc" },
    take: args.take,
    skip: args.page * args.take,
  });

  return NextResponse.json({
    meta: {
      count,
      pages: Math.ceil(count / args.take),
    },
    imports,
  });
}
