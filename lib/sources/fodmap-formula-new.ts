// https://www.fodmapformula.com/low-fodmap-warm-potato-salad/

import { Parser } from "./types";

export const fodmapFormulaNew: Parser = {
  canList: () => false,

  canParse: ({ document, url }) =>
    url.includes("fodmapformula.com") &&
    Boolean(document.querySelector(".tasty-recipes-entry-header")),

  list: () => [],

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
      keywords,
      original: document.body.innerHTML,
      postedAt: null,
    };
  },
};
