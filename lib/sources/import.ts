import { JSDOM } from "jsdom";
import { fodmapFormulaNew } from "./fodmap-formula-new";
import { fodmapFormulaOld } from "./fodmap-formula-old";
import { fodmapEveryday } from "./fodmap-everyday";

const parsers = [fodmapFormulaNew, fodmapFormulaOld, fodmapEveryday];

export async function importRecipe(url: string) {
  const page = await (await fetch(url)).text();
  const dom = new JSDOM(page);
  const input = { document: dom.window.document, url };
  const parser = parsers.find((p) => p.canParse(input));

  if (!parser) {
    throw new Error("No parser found for this URL");
  }
  return parser.parse(input);
}
