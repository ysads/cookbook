import prisma from "../lib/prisma";

async function main() {
  const response = await Promise.all([
    // TODO: is this necessary?
  ]);
  console.log(response);
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
