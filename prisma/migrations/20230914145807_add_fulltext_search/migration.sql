CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX recipe_search_on_title_idx ON "Recipe" USING GIST (title gist_trgm_ops);