/**
 * Parses URLs like:
 * https://www.fodmapformula.com/london-fog/
 **/

import { last } from "../utils";
import { Parser } from "./types";

export const fodmapFormulaOld: Parser = {
  canParse: ({ document, url }) =>
    url.includes("fodmapformula.com") &&
    Boolean(document.querySelector(".wprm-recipe")),

  parse({ document, url }) {
    const title = document.querySelector("h1.entry-title")?.textContent || url;

    const servings = parseInt(
      document.querySelector(".yield [data-amount]")?.textContent || "0"
    );

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

    return {
      title,
      courses: [],
      ingreds: ingredients,
      instructions,
      servings,
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
