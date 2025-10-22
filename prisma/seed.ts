import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // Create Genres
  console.log("📚 Creating genres...");
  const fiction = await prisma.genre.upsert({
    where: { name: "Fiction" },
    update: {},
    create: {
      name: "Fiction",
      description: "Fictional stories and novels",
    },
  });

  const scienceFiction = await prisma.genre.upsert({
    where: { name: "Science Fiction" },
    update: {},
    create: {
      name: "Science Fiction",
      description: "Stories about science and future technology",
    },
  });

  const fantasy = await prisma.genre.upsert({
    where: { name: "Fantasy" },
    update: {},
    create: {
      name: "Fantasy",
      description: "Stories with magical and supernatural elements",
    },
  });

  const mystery = await prisma.genre.upsert({
    where: { name: "Mystery" },
    update: {},
    create: {
      name: "Mystery",
      description: "Detective and mystery stories",
    },
  });

  const romance = await prisma.genre.upsert({
    where: { name: "Romance" },
    update: {},
    create: {
      name: "Romance",
      description: "Love stories and romantic novels",
    },
  });

  console.log("✅ Genres created successfully!");

  // Create Books
  console.log("📖 Creating books...");
  
  const books = [
    {
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      description: "A classic American novel set in the Jazz Age",
      price: 150000,
      stock: 15,
      genreId: fiction.id,
    },
    {
      title: "1984",
      author: "George Orwell",
      description: "A dystopian social science fiction novel",
      price: 175000,
      stock: 20,
      genreId: scienceFiction.id,
    },
    {
      title: "To Kill a Mockingbird",
      author: "Harper Lee",
      description: "A novel about racial injustice in the American South",
      price: 160000,
      stock: 12,
      genreId: fiction.id,
    },
    {
      title: "The Hobbit",
      author: "J.R.R. Tolkien",
      description: "A fantasy novel about Bilbo Baggins' adventure",
      price: 200000,
      stock: 18,
      genreId: fantasy.id,
    },
    {
      title: "Harry Potter and the Philosopher's Stone",
      author: "J.K. Rowling",
      description: "The first book in the Harry Potter series",
      price: 250000,
      stock: 25,
      genreId: fantasy.id,
    },
    {
      title: "The Da Vinci Code",
      author: "Dan Brown",
      description: "A mystery thriller novel",
      price: 180000,
      stock: 14,
      genreId: mystery.id,
    },
    {
      title: "Sherlock Holmes: A Study in Scarlet",
      author: "Arthur Conan Doyle",
      description: "The first Sherlock Holmes novel",
      price: 145000,
      stock: 10,
      genreId: mystery.id,
    },
    {
      title: "Pride and Prejudice",
      author: "Jane Austen",
      description: "A romantic novel of manners",
      price: 165000,
      stock: 16,
      genreId: romance.id,
    },
    {
      title: "Dune",
      author: "Frank Herbert",
      description: "A science fiction novel set in the distant future",
      price: 220000,
      stock: 8,
      genreId: scienceFiction.id,
    },
    {
      title: "The Lord of the Rings",
      author: "J.R.R. Tolkien",
      description: "An epic high fantasy novel",
      price: 350000,
      stock: 10,
      genreId: fantasy.id,
    },
  ];

  for (const book of books) {
    await prisma.book.upsert({
      where: { title: book.title },
      update: {},
      create: book,
    });
  }

  console.log("✅ Books created successfully!");

  // Summary
  const genreCount = await prisma.genre.count();
  const bookCount = await prisma.book.count();

  console.log("\n🎉 Seeding completed!");
  console.log(`📊 Summary:`);
  console.log(`   - Genres: ${genreCount}`);
  console.log(`   - Books: ${bookCount}`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
