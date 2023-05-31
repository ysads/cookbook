/**
 * Parses URLs like:
 * https://www.fodmapeveryday.com/recipes/low-fodmap-leftover-turkey-pot-pie-with-biscuit-topping/
 * https://www.fodmapeveryday.com/recipes/rhubarb-upside-down-cake/
 **/
import { Course } from "@prisma/client";
import { Parser } from "./types";

const NOTES_REGEX =
  /•[\s]*<strong>[A-Za-z ]+[ ]*<\/strong>:[A-z<>\(\)\-,.0-9“”’"':;½¼¾⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞\s]+/gm;

function trimAndSanitize(str: string | null | undefined) {
  if (!str) return "";
  return str.replaceAll(":", "").replaceAll(/\s+/g, " ").trim();
}

function getDate(el: Element | undefined | null) {
  const postedAtText = el?.textContent
    ?.replace("Published", "")
    ?.replace("Updated", "")
    ?.replace("Modified", "")
    ?.trim();
  return postedAtText ? new Date(postedAtText) : null;
}

function mapCourseToEnum(courses: string[]) {
  const set = new Set<Course>();

  for (const course of courses) {
    const lCourse = course.toLowerCase();
    if (["main", "dinner", "lunch", "brunch"].some((k) => lCourse.match(k))) {
      set.add(Course.MAIN);
    }
    if (["breakfast", "brunch", "bread"].some((k) => lCourse.match(k))) {
      set.add(Course.BREAKFAST);
    }
    if (["appetizer", "side", "bread"].some((k) => lCourse.match(k))) {
      set.add(Course.SIDE);
    }
    if (["snack", "treat", "candy"].some((k) => lCourse.match(k))) {
      set.add(Course.SNACK);
    }
    if (["dessert", "candy"].some((k) => lCourse.match(k))) {
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
  return Array.from(set);
}

export const fodmapEveryday: Parser = {
  canList: ({ url }) => Boolean(url.match(/fodmapeveryday.com\/recipes/)),

  canParse: ({ document, url }) =>
    url.includes("fodmapeveryday.com") &&
    Boolean(document.querySelector(".wprm-recipe")),

  list({ document }) {
    return Array.from(document.querySelectorAll(".entry")).map((el) => {
      return {
        imageUrl: el
          .querySelector(".entry-image-link img")
          ?.getAttribute("src"),
        url: el.querySelector(".entry-image-link")?.getAttribute("href"),
        title: el.querySelector(".entry-content h6")?.textContent,
      };
    });
  },

  parse({ document, url }) {
    const title = document.querySelector(".wprm-recipe-name")?.textContent;

    const servings = parseInt(
      document.querySelector(".wprm-recipe-servings")?.textContent || "0"
    );

    const time = document
      .querySelector(".wprm-recipe-total-time-container")
      ?.textContent?.replace("Total Time:", "")
      ?.trim();

    const ingredientSets: { name: string; ingreds: string[] }[] = Array.from(
      document.querySelectorAll(".wprm-recipe-ingredient-group")
    ).map((setEl) => {
      const title = trimAndSanitize(
        setEl.querySelector(".wprm-recipe-ingredient-group-name")?.textContent
      );
      const ingredients = Array.from(
        setEl.querySelectorAll(".wprm-recipe-ingredient")
      ).map((el) => trimAndSanitize(el.textContent));

      return {
        name: title || "",
        ingreds: ingredients,
      };
    });

    const instructions = Array.from(
      document.querySelectorAll(".wprm-recipe-instruction")
    ).map((el) => trimAndSanitize(el.textContent));

    // FIXME: notes don't seem to be parsed correctly.
    // eg: https://www.fodmapeveryday.com/recipes/low-fodmap-chocolate-peanut-butter-pie/
    const notes = Array.from(
      document
        .querySelector(".wprm-recipe-notes-container")
        ?.innerHTML?.matchAll(NOTES_REGEX) || []
    );

    const postedAt =
      getDate(document.querySelector(".entry-modified-date")) ||
      getDate(document.querySelector(".entry-date"));

    const imageUrl = document
      .querySelector("meta[property='og:image']")
      ?.getAttribute("content");

    const courses = document
      .querySelector(".wprm-recipe-course")
      ?.textContent?.split(",")
      .map((c) => c.trim());

    return {
      title,
      time,
      servings,
      ingredientSets: ingredientSets,
      // INFO: there does not seem to be any grouping of instructions
      instructionSets: [
        {
          name: "",
          instructions,
        },
      ],
      notes: [],
      postedAt,
      // TODO: keywords here are too generic, maybe use AI?
      keywords: [],
      courses: mapCourseToEnum(courses || []),
      source: "fodmap-everyday",
      sourceUrl: url,
      imageUrl,
    };
  },
};
