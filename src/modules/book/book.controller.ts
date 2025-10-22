import { PrismaClient } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import { HttpError } from "../../utils/errors";

const prisma = new PrismaClient();

// GET ALL BOOKS
export const getAllBooks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const books = await prisma.book.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        genre: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({
      success: true,
      data: books,
    });
  } catch (error) {
    next(error);
  }
};

// GET BOOK BY ID
export const getBookById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const book = await prisma.book.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        genre: true,
      },
    });

    if (!book) {
      throw new HttpError(404, "Book not found");
    }

    res.json({
      success: true,
      data: book,
    });
  } catch (error) {
    next(error);
  }
};
