// https://www.fodmapformula.com/low-fodmap-warm-potato-salad/

import { Course } from "@prisma/client";
import { Parser } from "../types";

function mapCourseToEnum(el: Element | null) {
  if (!el) return [];
  const courses = el.textContent?.split(",") || [];
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

export const fodmapFormulaNew: Parser = {
  name: "fodmap-formula-new",

  canList: ({ document, url }) =>
    url.includes("fodmapformula.com") &&
    document.querySelector(".entry") !== null,

  canParse: ({ document, url }) =>
    url.includes("fodmapformula.com") &&
    Boolean(document.querySelector(".tasty-recipes-entry-header")),

  list: ({ document }) => {
    return Array.from(document.querySelectorAll(".entry")).map((el) => {
      return {
        imageUrl: el.querySelector(".entry-image")?.getAttribute("src"),
        url: el.querySelector(".entry-image-link")?.getAttribute("href"),
        title: el.querySelector(".entry-title-link")?.textContent,
      };
    });
  },

  parse({ document, url }) {
    const title = document.querySelector("h1.entry-title")?.textContent || url;

    const servings = parseInt(
      document.querySelector(".yield [data-amount]")?.textContent || "0"
    );

    const time =
      document
        .querySelector(".tasty-recipes-total-time")
        ?.textContent?.replace("Total Time:", "")
        .trim() || "";

    const instructions = Array.from(
      document.querySelectorAll(".tasty-recipes-instructions li")
    ).map((instruction) => instruction.textContent || "");

    const ingredients = Array.from(
      document.querySelectorAll(".tasty-recipes-ingredients li")
    ).map((ingredientEl) => ingredientEl.textContent || "");

    const notes = Array.from(
      document.querySelectorAll(".tasty-recipes-notes-body p")
    ).map((noteEl) => noteEl.textContent || "");

    const keywords = (
      document.querySelector(".tasty-recipes-keywords")?.textContent || ""
    )
      .replace("Keywords:", "")
      .split(",")
      .map((k) => k.trim().toLowerCase());

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
      document.querySelector(".tasty-recipes-category")
    );

    return {
      title,
      courses,
      ingredientSets: [{ name: "", ingreds: ingredients }],
      instructionSets: [{ name: "", instructions }],
      servings,
      time,
      imageUrl: imageUrl?.getAttribute("src") || "",
      notes,
      sourceUrl: url,
      source: "fodmap-formula",
      keywords,
      original: document.body.innerHTML,
      postedAt: null,
    };
  },
};
