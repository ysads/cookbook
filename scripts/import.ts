import { listRecipes, importRecipe } from "../lib/sources";
import prisma from "../lib/prisma";
import dotenv from "dotenv";

async function importFromUrl(recipesUrl: string, dryRun: boolean) {
  if (dryRun) console.log("> Running in dry mode");
  if (!recipesUrl) throw "URL not provided";

  console.log("> Listing recipes from URL: ", recipesUrl);

  const leads = await listRecipes(recipesUrl);
  if (leads.status === "error") {
    throw "Failed to list recipes";
  }

  console.log("> Found ", leads.list.length, " recipe leads");
  for (const lead of leads.list) {
    console.log(`\nImporting: ${lead.title}`);
    if (await prisma.recipe.findFirst({ where: { sourceUrl: lead.url } })) {
      console.log(".. Skipped: already imported");
      continue;
    }

    const result = await importRecipe(lead.url);

    if (result.status === "error") {
      console.error(".. Failed to import");
      result.errors.map((error) => {
        console.error(`    Error ${error.path}: ${error.message}`);
      });
      await prisma.recipeImport.create({
        data: {
          url: lead.url,
          status: result.status,
          errors: result.errors,
        },
      });
    } else if (result.status === "skipped") {
      console.error(".. Skipped: no parser found for recipe");
    } else {
      console.log(".. Recipe data parsed");
      const { ingredientSets, instructionSets, ...recipe } = result.recipe;

      if (!dryRun) {
        await prisma
          .$transaction([
            prisma.recipe.create({
              data: {
                ...recipe,
                ingredientSets: {
                  createMany: {
                    data: ingredientSets,
                  },
                },
                instructionSets: {
                  createMany: {
                    data: instructionSets,
                  },
                },
              },
            }),
            prisma.recipeImport.create({
              data: {
                url: lead.url,
                status: result.status,
                errors: {},
              },
            }),
          ])
          .then(([r, i]) => {
            console.log(".. Saved to database");
          });
      }
    }
  }

  console.log("> Finished");
}

async function main() {
  dotenv.config({ path: ".env.local" });

  const recipesUrl = process.argv[2];
  const dryRun = ["-d", "--dry"].includes(process.argv[3]);

  for (let i = 20; i <= 25; i++) {
    await importFromUrl(
      `https://www.fodmapeveryday.com/recipes/page/${i}`,
      dryRun
    );
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
