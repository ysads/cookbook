-- CreateEnum
CREATE TYPE "Course" AS ENUM ('BREAKFAST', 'MAIN', 'DRINK', 'SALAD', 'SIDE', 'SNACK', 'SOUP', 'DESSERT', 'OTHER');

-- CreateTable
CREATE TABLE "Recipe" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "servings" DOUBLE PRECISION NOT NULL,
    "time" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "courses" "Course"[],
    "keywords" TEXT[],
    "notes" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "postedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Recipe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fodmap" (
    "id" SERIAL NOT NULL,
    "fructans" DOUBLE PRECISION NOT NULL,
    "galactans" DOUBLE PRECISION NOT NULL,
    "lactose" DOUBLE PRECISION NOT NULL,
    "polyols" DOUBLE PRECISION NOT NULL,
    "fructose" DOUBLE PRECISION NOT NULL,
    "recipeId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Fodmap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IngredientSet" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "ingreds" TEXT[],
    "recipeId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IngredientSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstructionSet" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "instructions" TEXT[],
    "recipeId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InstructionSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecipeImport" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "errors" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecipeImport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Fodmap_recipeId_key" ON "Fodmap"("recipeId");

-- AddForeignKey
ALTER TABLE "Fodmap" ADD CONSTRAINT "Fodmap_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IngredientSet" ADD CONSTRAINT "IngredientSet_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstructionSet" ADD CONSTRAINT "InstructionSet_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

