CREATE INDEX import_search_on_title_idx ON "RecipeImport" USING GIST (title gist_trgm_ops);
CREATE INDEX import_search_on_url_idx ON "RecipeImport" USING GIST (url gist_trgm_ops);