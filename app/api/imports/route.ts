import { Course } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { IMPORT_STATUS } from "@/lib/types";

const getSchema = z.object({
  term: z.string().optional(),
  take: z.coerce.number().min(1),
  lastId: z.coerce.number().nullish(),
  status: z
    .enum(IMPORT_STATUS)
    .or(z.enum(IMPORT_STATUS).array())
    .optional()
    .transform((val) => (typeof val === "string" ? [val] : val)),
  page: z.coerce.number().min(0).default(0),
  courses: z
    .string()
    .transform((val, _) => (val ? val.split(",") : []))
    .pipe(z.nativeEnum(Course).array())
    .nullish(),
});

// INFO: needed because Object.entries() doesn't work with arrays
function objFromSearchParams(searchParams: URLSearchParams) {
  const obj: Record<string, any> = {};
  for (const key of searchParams.keys()) {
    const values = searchParams.getAll(key);
    obj[key] = values.length === 1 ? values[0] : values;
  }
  return obj;
}

export async function GET(request: NextRequest) {
  const args = getSchema.parse(
    objFromSearchParams(request.nextUrl.searchParams)
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
        status: { in: args.status },
        ...termFilter,
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const imports = await prisma.recipeImport.findMany({
    where: {
      AND: {
        status: { in: args.status },
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
