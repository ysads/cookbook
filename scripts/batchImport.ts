import { listRecipes, parseRecipe } from "../lib/sources";
import { prisma } from "../lib/prisma";
import { SOURCES } from "../lib/sources/types";
import dotenv from "dotenv";

function* fodmapFormulaUrls() {
  const cats = [
    "breakfast",
    "lunch",
    "dinner",
    "dessert",
    "soupsalad",
    "side-dishes",
    "appetizers",
    "snacks",
    "drinks",
  ];

  for (const cat of cats) {
    for (let i = 1; i <= 8; i++) {
      yield `https://www.fodmapformula.com/category/recipe/${cat}/page/${i}`;
    }
  }
}

function* fodmapEverydayUrls() {
  for (let i = 27; i <= 45; i++) {
    yield `https://www.fodmapeveryday.com/recipes/page/${i}`;
  }
}

function* karlijnsKitchenUrls() {
  for (let i = 1; i <= 32; i++) {
    yield `https://www.karlijnskitchen.com/en/recipes/page/${i}`;
  }
}

async function importFromUrl(recipesUrl: string, dryRun: boolean) {
  if (dryRun) console.log("> Running in dry mode");
  if (!recipesUrl) throw "URL not provided";

  console.log("> Listing recipes from URL: ", recipesUrl);

  const leads = await listRecipes(recipesUrl);
  if (leads.status === "error") {
    throw "Failed to list recipes";
  } else if (leads.status === "partial") {
    console.log("Listing failed with errors:");
    leads.errors.map((error) => {
      console.error(`   ${error.path}: ${error.message}`);
    });
  }

  console.log("> Found ", leads.list.length, " recipe leads");
  for (const lead of leads.list) {
    console.log(`\nImporting: ${lead.title}`);
    if (await prisma.recipe.findFirst({ where: { sourceUrl: lead.url } })) {
      console.log(".. Skipped: already imported");
      continue;
    }

    const result = await parseRecipe(lead.url);

    if (result.status === "partial") {
      console.error(".. Failed to import");
      result.errors.map((error) => {
        console.error(`    Error ${error.path}: ${error.message}`);
      });

      const existingImport = await prisma.recipeImport.findFirst({
        where: { url: lead.url },
      });

      if (existingImport) {
        await prisma.recipeImport.update({
          where: { id: existingImport.id },
          data: {
            errors: result.errors,
          },
        });
      } else {
        await prisma.recipeImport.create({
          data: {
            url: lead.url,
            title: lead.title,
            status: result.status,
            errors: result.errors,
          },
        });
      }
    } else if (result.status === "error") {
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
                title: lead.title,
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

const urls = {
  "fodmap-formula": fodmapFormulaUrls,
  "fodmap-everyday": fodmapEverydayUrls,
  karlijns: karlijnsKitchenUrls,
} as const;

function* vax() {
  yield 1;
  yield 2;
  yield 3;
}

async function main() {
  dotenv.config({ path: ".env.local" });

  const source = process.argv[2];
  const dryRun = ["-d", "--dry"].includes(process.argv[3]);

  if (!SOURCES.includes(source)) {
    throw "Invalid source";
  }
  const urlFactory = urls[source];

  console.log("> Importing from source: ", source);

  for (const url of urlFactory()) {
    try {
      await importFromUrl(url, dryRun);
    } catch (err) {
      console.error(err);
    }
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
