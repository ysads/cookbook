import { Course } from "@prisma/client";
import { Parser } from "../types";

function mapCourseToEnum(document: Document) {
  const categories =
    document.querySelector(".tasty-recipes-category")?.textContent || "";
  const breadcrumbs =
    document.querySelector("#breadcrumbs span")?.textContent || "";
  if (!categories && !breadcrumbs) return [];

  const courses = [
    ...(categories.split(",").map((s) => s.trim()) || []),
    breadcrumbs,
  ];

  console.log("::: courses", courses);

  const set = new Set<Course>();

  for (const course of courses) {
    const lCourse = course.toLowerCase();
    console.log("::: lcourse", lCourse);

    if (
      ["main", "dinner", "diner", "lunch", "brunch"].some((k) =>
        lCourse.match(k)
      )
    ) {
      set.add(Course.MAIN);
    }
    if (
      ["breakfast", "brunch", "bread", "cake"].some((k) => lCourse.match(k))
    ) {
      set.add(Course.BREAKFAST);
    }
    if (["appetizer", "side", "bread"].some((k) => lCourse.match(k))) {
      set.add(Course.SIDE);
    }
    if (["snack", "treat", "candy"].some((k) => lCourse.match(k))) {
      set.add(Course.SNACK);
    }
    if (["dessert", "candy", "cake", "sweet"].some((k) => lCourse.match(k))) {
      set.add(Course.DESSERT);
    }
    if (["beverage", "drink"].some((k) => lCourse.match(k))) {
      set.add(Course.DRINK);
    }
    if (["condiment", "basic", "sauce"].some((k) => lCourse.match(k))) {
      set.add(Course.OTHER);
    }
    if (["soup"].some((k) => lCourse.match(k))) {
      set.add(Course.SOUP);
    }
    if (["salad"].some((k) => lCourse.match(k))) {
      set.add(Course.SALAD);
    }
  }
  console.log("::: arr", Array.from(set));
  return Array.from(set);
}

export const karlijns: Parser = {
  name: "karlijns",

  canList: ({ url }) =>
    Boolean(url.match(/karlijnskitchen.com\/en\/(recipes|tag)/)),

  list({ document }) {
    return Array.from(document.querySelectorAll(".entry-summary")).map((el) => {
      return {
        imageUrl: el.querySelector(".entry-summary img")?.getAttribute("src"),
        url: el.querySelector(".entry-summary a")?.getAttribute("href"),
        title: el.querySelector(".title")?.textContent,
      };
    });
  },

  canParse({ document, url }) {
    return Boolean(
      url.includes("karlijnskitchen.com") &&
        document.querySelector(".tasty-recipes")
    );
  },

  parse({ document, url }) {
    const title =
      document.querySelector(".tasty-recipes-title")?.textContent || "";
    const servings = parseInt(
      document.querySelector(".tasty-recipes-yield [data-amount]")
        ?.textContent || "0"
    );
    const time =
      document
        .querySelector(".tasty-recipes-total-time")
        ?.textContent?.replace("Total Time:", "")
        .trim() || "";

    const ingredientHeaders = Array.from(
      document.querySelectorAll(
        ".tasty-recipes-ingredients [data-tasty-recipes-customization] > h4, .tasty-recipes-ingredients [data-tasty-recipes-customization] > p"
      )
    );
    const ingredientGroups = Array.from(
      document.querySelectorAll(
        ".tasty-recipes-ingredients ul, .tasty-recipes-ingredients ol"
      )
    );
    const ingredientSets = ingredientGroups.map((ingredientGroup, index) => {
      const header = ingredientHeaders[index];

      return {
        name: header?.textContent || "",
        ingreds: Array.from(ingredientGroup.querySelectorAll("li")).map(
          (el) => el.textContent || ""
        ),
      };
    });

    const instructionHeaders = Array.from(
      document.querySelectorAll(
        ".tasty-recipes-instructions [data-tasty-recipes-customization] > h4, .tasty-recipes-instructions [data-tasty-recipes-customization] > p"
      )
    );
    const instructionGroups = Array.from(
      document.querySelectorAll(
        ".tasty-recipes-instructions ul, .tasty-recipes-instructions ol"
      )
    );
    const instructionSets = instructionGroups.map((instructionGroup, index) => {
      const header = instructionHeaders[index];

      return {
        name: header?.textContent || "",
        instructions: Array.from(instructionGroup.querySelectorAll("li")).map(
          (el) => el.textContent || ""
        ),
      };
    });

    const postedAt = new Date(
      document.querySelector(".entry-date")?.textContent || ""
    );

    const notes = Array.from(
      document.querySelectorAll(".tasty-recipes-notes-body p")
    ).map((el) => el.innerHTML);

    return {
      title,
      time,
      postedAt,
      notes,
      courses: mapCourseToEnum(document),
      keywords: [],
      imageUrl:
        document.querySelector(".entry-content img")?.getAttribute("src") || "",
      source: "karlijns",
      sourceUrl: url,
      servings,
      ingredientSets,
      instructionSets,
    };
  },
};
