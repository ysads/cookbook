import { listRecipes, parseRecipe } from "../lib/sources";
import { prisma } from "@/lib/prisma";
import dotenv from "dotenv";

// type ImportResult = {
//   status: "skipped" | "updated" | "error" | "success";
// };

const cats = [
  // "breakfast",
  "lunch",
  "dinner",
  "dessert",
  "soupsalad",
  "side-dishes",
  "appetizers",
  "snacks",
  "drinks",
];

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
      await prisma.recipeImport.create({
        data: {
          url: lead.url,
          status: result.status,
          errors: result.errors,
        },
      });
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

  for (const cat of cats) {
    for (let i = 1; i <= 8; i++) {
      try {
        await importFromUrl(
          `https://www.fodmapformula.com/category/recipe/drinks/${cat}/page/${i}`,
          dryRun
        );
      } catch (err) {
        console.error(err);
      }
    }
  }

  // await importFromUrl(recipesUrl, dryRun);
  // for (let i = 32; i <= 45; i++) {
  //   await importFromUrl(
  //     `https://www.fodmapeveryday.com/recipes/page/${i}`,
  //     dryRun
  //   );
  // }
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
