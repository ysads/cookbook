/**
 * Parses URLs like:
 * https://www.fodmapformula.com/london-fog/
 **/
import { Parser } from "../types";
import { last } from "../../utils";
import { Course } from "@prisma/client";

function mapCourseToEnum(el: Element | null) {
  if (!el) return [];
  const courses = el.textContent?.split(",") ?? [];
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

function getServings(document: Document) {
  if (document.querySelector(".yield [data-amount]")?.textContent) {
    return parseInt(
      document.querySelector(".yield [data-amount]")?.textContent || "0"
    );
  }
  if (document.querySelector(".wprm-recipe-servings")?.textContent) {
    return parseInt(
      document
        .querySelector(".wprm-recipe-servings")
        ?.textContent?.replace(/\D*/, "") || "0"
    );
  }
  return 0;
}

export const fodmapFormulaOld: Parser = {
  name: "fodmap-formula-old",

  canList: ({ document, url }) =>
    url.includes("fodmapformula.com") &&
    document.querySelector(".entry") !== null,

  canParse: ({ document, url }) =>
    url.includes("fodmapformula.com") &&
    Boolean(document.querySelector(".wprm-recipe")),

  list: ({ document }) => {
    return Array.from(document.querySelectorAll(".entry")).map((el) => {
      return {
        imageUrl: el.querySelector(".entry-image")?.getAttribute("src"),
        url: el.querySelector(".entry-image-link")?.getAttribute("href"),
        title: el.querySelector(".entry-content-link")?.textContent,
      };
    });
  },

  parse({ document, url }) {
    const title = document.querySelector("h1.entry-title")?.textContent || url;

    const time = last(
      Array.from(document.querySelectorAll(".wprm-recipe-time")).map(
        (c) => c.textContent || ""
      )
    );

    const instructions = Array.from(
      document.querySelectorAll(".wprm-recipe-instruction")
    ).map((instruction) => instruction.textContent?.trim() || "");

    const ingredients = Array.from(
      document.querySelectorAll(".wprm-recipe-ingredient")
    ).map(
      (ingredientEl) =>
        ingredientEl.textContent
          ?.replaceAll("\t", "")
          ?.replaceAll("\n", " ")
          ?.trim() || ""
    );

    const notes = Array.from(
      document.querySelectorAll(".wprm-recipe-instruction-text")
    ).map((noteEl) => noteEl.textContent || "");

    const imageUrl = Array.from(document.querySelectorAll("img")).find(
      (img: HTMLImageElement) => {
        const src = (img.getAttribute("src") || "").toLowerCase();
        return (
          // FIXME: For some reason SVGs are still included
          !src.includes("svg") &&
          !src.includes("pinterest.") &&
          !src.includes("facebook.") &&
          !src.includes("fb.") &&
          !src.includes("logo") &&
          img.width >= img.height
        );
      }
    );

    const courses = mapCourseToEnum(
      document.querySelector(".wprm-recipe-course")
    );

    return {
      title,
      courses,
      ingredientSets: [{ name: "", ingreds: ingredients }],
      instructionSets: [{ name: "", instructions: instructions }],
      servings: getServings(document),
      time,
      imageUrl: imageUrl?.getAttribute("src") || "",
      notes,
      sourceUrl: url,
      source: "fodmap-formula",
      // TODO: use AI to summarize the keywords
      keywords: [],
      original: document.body.innerHTML,
      postedAt: null,
    };
  },
};
