/**
 * Parses URLs like:
 * https://www.fodmapeveryday.com/recipes/low-fodmap-leftover-turkey-pot-pie-with-biscuit-topping/
 **/
import { Parser } from "./types";

export const fodmapEveryday: Parser = {
  canParse: ({ document, url }) =>
    url.includes("fodmapeveryday.com") &&
    Boolean(document.querySelector(".wprm-recipe")),

  parse({ document, url }) {
    const title =
      document.querySelector(".wprm-recipe-name")?.textContent || url;

    const servings = parseInt(
      document.querySelector(".wprm-recipe-servings")?.textContent || "0"
    );

    const time =
      document
        .querySelector(".wprm-recipe-total-time-container")
        ?.textContent?.replace("Total Time:", "")
        ?.trim() || "";

    const ingredients = Array.from(
      document.querySelectorAll(".wprm-recipe-ingredient")
    ).map(
      (ingredientEl) =>
        ingredientEl.textContent
          ?.replaceAll("\t", "")
          ?.replaceAll("\n", " ")
          ?.trim() || ""
    );

    const instructions = Array.from(
      document.querySelectorAll(".wprm-recipe-instruction")
    ).map((el) => el.textContent?.trim() || "");

    const notes = Array.from(
      document.querySelectorAll(".wprm-recipe-notes-container ul li")
    ).map((el) => el.textContent || "");

    const postedAtText = document
      .querySelector(".wprm-recipe-time-container time")
      ?.textContent?.replace("Published", "")
      ?.trim();
    const postedAt = postedAtText ? new Date(postedAtText) : null;

    const imageUrl =
      document
        .querySelector("meta[property='og:image']")
        ?.getAttribute("content") || "";

    return {
      title,
      time,
      servings,
      ingreds: ingredients,
      instructions,
      notes,
      postedAt,
      // TODO: keywords here are too generic, maybe use AI?
      keywords: [],
      // TODO: map the category names to courses
      courses: [],
      source: "fodmap-everyday",
      sourceUrl: url,
      original: document.body.innerHTML,
      imageUrl,
    };
  },
};
