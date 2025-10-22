import { PrismaClient } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import { HttpError } from "../../utils/errors";

const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

// GET ALL TRANSACTIONS (untuk user yang login)
export const getAllTransactions = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new HttpError(401, "Unauthorized");
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: req.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        items: {
          include: {
            book: {
              select: {
                id: true,
                title: true,
                author: true,
              },
            },
          },
        },
      },
    });

    res.json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
};

// GET TRANSACTION BY ID
export const getTransactionById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new HttpError(401, "Unauthorized");
    }

    const { id } = req.params;

    const transaction = await prisma.transaction.findFirst({
      where: {
        id,
        userId: req.user.id, // User hanya bisa melihat transaksi miliknya sendiri
      },
      include: {
        items: {
          include: {
            book: {
              select: {
                id: true,
                title: true,
                author: true,
                genre: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    if (!transaction) {
      throw new HttpError(404, "Transaction not found");
    }

    res.json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

// CREATE TRANSACTION (Pembelian buku)
export const createTransaction = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new HttpError(401, "Unauthorized");
    }

    const { items } = req.body;

    // Validasi: Pastikan semua buku ada dan stok cukup
    const bookIds = items.map((item: any) => item.book_id);
    const books = await prisma.book.findMany({
      where: {
        id: { in: bookIds },
        deletedAt: null,
      },
    });

    if (books.length !== bookIds.length) {
      throw new HttpError(404, "Some books not found");
    }

    // Cek stok dan hitung total
    let total = 0;
    const transactionItems: any[] = [];

    for (const item of items) {
      const book = books.find((b: any) => b.id === item.book_id);
      if (!book) {
        throw new HttpError(404, `Book with ID ${item.book_id} not found`);
      }

      if (book.stock < item.quantity) {
        throw new HttpError(400, `Insufficient stock for book "${book.title}". Available: ${book.stock}`);
      }

      const itemTotal = Number(book.price) * item.quantity;
      total += itemTotal;

      transactionItems.push({
        bookId: book.id,
        quantity: item.quantity,
        price: book.price, // Snapshot harga saat beli
      });
    }

    // Buat transaksi dengan transaction (untuk atomic operation)
    const transaction = await prisma.$transaction(async (tx: any) => {
      // Create transaction
      const newTransaction = await tx.transaction.create({
        data: {
          userId: req.user!.id,
          total,
          items: {
            create: transactionItems,
          },
        },
        include: {
          items: {
            include: {
              book: {
                select: {
                  id: true,
                  title: true,
                  author: true,
                },
              },
            },
          },
        },
      });

      // Update stok buku
      for (const item of items) {
        await tx.book.update({
          where: { id: item.book_id },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      return newTransaction;
    });

    res.status(201).json({
      success: true,
      message: "Transaction created successfully",
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

// GET TRANSACTION STATISTICS
export const getTransactionStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new HttpError(401, "Unauthorized");
    }

    const userId = req.user.id;

    // Total transaksi
    const totalTransactions = await prisma.transaction.count({
      where: { userId },
    });

    // Total pembelian
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      select: { total: true },
    });

    const totalSpent = transactions.reduce((sum: number, t: any) => sum + Number(t.total), 0);

    // Rata-rata nominal per transaksi
    const averagePerTransaction = totalTransactions > 0 ? totalSpent / totalTransactions : 0;

    // Genre dengan transaksi terbanyak
    const genreStats: any = await prisma.$queryRaw`
      SELECT 
        g.id,
        g.name,
        COUNT(DISTINCT ti."transactionId") as transaction_count,
        SUM(ti.quantity) as total_books_sold
      FROM "Genre" g
      JOIN "Book" b ON b."genreId" = g.id
      JOIN "TransactionItem" ti ON ti."bookId" = b.id
      JOIN "Transaction" t ON t.id = ti."transactionId"
      WHERE t."userId" = ${userId}
      GROUP BY g.id, g.name
      ORDER BY transaction_count DESC
      LIMIT 5
    `;

    // Genre dengan transaksi paling sedikit
    const leastPopularGenre: any = await prisma.$queryRaw`
      SELECT 
        g.id,
        g.name,
        COUNT(DISTINCT ti."transactionId") as transaction_count
      FROM "Genre" g
      LEFT JOIN "Book" b ON b."genreId" = g.id
      LEFT JOIN "TransactionItem" ti ON ti."bookId" = b.id
      LEFT JOIN "Transaction" t ON t.id = ti."transactionId" AND t."userId" = ${userId}
      GROUP BY g.id, g.name
      ORDER BY transaction_count ASC
      LIMIT 5
    `;

    // Convert BigInt to Number
    const convertedGenreStats = genreStats.map((genre: any) => ({
      id: genre.id,
      name: genre.name,
      transaction_count: Number(genre.transaction_count),
      total_books_sold: Number(genre.total_books_sold || 0),
    }));

    const convertedLeastPopular = leastPopularGenre.map((genre: any) => ({
      id: genre.id,
      name: genre.name,
      transaction_count: Number(genre.transaction_count || 0),
    }));

    res.json({
      success: true,
      data: {
        totalTransactions,
        totalSpent: Number(totalSpent.toFixed(2)),
        averagePerTransaction: Number(averagePerTransaction.toFixed(2)),
        mostPopularGenres: convertedGenreStats,
        leastPopularGenres: convertedLeastPopular,
      },
    });
  } catch (error) {
    next(error);
  }
};
