import { prisma } from "@/lib/prisma";
import { parseRecipe } from "@/lib/sources";
import dotenv from "dotenv";

async function main() {
  dotenv.config({ path: ".env.local" });

  const imports = await prisma.recipeImport.findMany({
    where: { status: "partial" },
  });
  console.log(":::: found", imports.length, "imports with status=error");

  for (const imp of imports) {
    const result = await parseRecipe(imp.url);
    console.log(imp.url);

    if (result.status === "error") {
      console.error(".. Failed: no data found");
      continue;
    }

    if (!result.recipe.title) {
      console.error(".. Failed: no title found");
      continue;
    }

    await prisma.recipeImport.update({
      where: { id: imp.id },
      data: { title: result.recipe.title },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
