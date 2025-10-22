import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import prisma from '../../config/prisma';

// Helper: Build where clause (soft delete only)
const buildBookWhereClause = (
  search?: string,
  genreId?: string
): Prisma.BookWhereInput => {
  const where: Prisma.BookWhereInput = { deletedAt: null };
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { author: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (genreId) where.genreId = genreId;
  return where;
};

// Helper: Build orderBy clause
const buildOrderByClause = (
  orderByTitle?: string
): Prisma.BookOrderByWithRelationInput[] => {
  const orderBy: Prisma.BookOrderByWithRelationInput[] = [];
  if (orderByTitle && ['asc', 'desc'].includes(orderByTitle.toLowerCase())) {
    orderBy.push({ title: orderByTitle.toUpperCase() as Prisma.SortOrder });
  }
  if (orderBy.length === 0) orderBy.push({ createdAt: 'desc' });
  return orderBy;
};

// POST /books
export const createBook = async (req: Request, res: Response) => {
  try {
    const {
      title,
      author,
      description,
      price,
      stock,
      genre_id,
    } = req.body;

    if (!title || !author || price === undefined || stock === undefined || !genre_id) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    const existing = await prisma.book.findUnique({ where: { title } });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Book title already exists",
      });
    }

    const genre = await prisma.genre.findUnique({ where: { id: genre_id, deletedAt: null } });
    if (!genre) {
      return res.status(404).json({
        success: false,
        message: "Genre not found",
      });
    }

    const book = await prisma.book.create({
      data: {
        title,
        author,
        description,
        price,
        stock,
        genreId: genre_id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      select: { id: true, title: true, createdAt: true },
    });

    return res.status(201).json({
      success: true,
      message: "Book added successfully",
      data: book,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// GET /books
export const getAllBooks = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string | undefined;
    const orderByTitle = req.query.orderByTitle as string | undefined;

    const skip = (page - 1) * limit;
    const where = buildBookWhereClause(search);
    const orderBy = buildOrderByClause(orderByTitle);

    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: { genre: { select: { name: true } } },
      }),
      prisma.book.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);
    const formatted = books.map((book:any) => ({
      id: book.id,
      title: book.title,
      writer: book.author,        // ← author → writer
      publisher: "",              // ← tidak ada di skema
      description: book.description,
      publication_year: null,     // ← tidak ada di skema
      price: parseFloat(book.price.toString()),
      stock_quantity: book.stock, // ← stock → stock_quantity
      genre: book.genre.name,
    }));

    return res.json({
      success: true,
      message: "Get all book successfully",
      data: formatted,
      meta: {
        page,
        limit,
        prev_page: page > 1 ? page - 1 : null,
        next_page: page < totalPages ? page + 1 : null,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// GET /books/genre/:genreId
export const getBooksByGenre = async (req: Request, res: Response) => {
  try {
    const { genreId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string | undefined;
    const orderByTitle = req.query.orderByTitle as string | undefined;

    const genre = await prisma.genre.findUnique({ where: { id: genreId, deletedAt: null } });
    if (!genre) return res.status(404).json({ success: false, message: "Genre not found" });

    const skip = (page - 1) * limit;
    const where = buildBookWhereClause(search, genreId);
    const orderBy = buildOrderByClause(orderByTitle);

    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: { genre: { select: { name: true } } },
      }),
      prisma.book.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);
    const formatted = books.map((book:any) => ({
      id: book.id,
      title: book.title,
      writer: book.author,
      publisher: "",
      description: book.description,
      publication_year: null,
      price: parseFloat(book.price.toString()),
      stock_quantity: book.stock,
      genre: book.genre.name,
    }));

    return res.json({
      success: true,
      message: "Get all book by genre successfully",
      data: formatted,
      meta: {
        page,
        limit,
        prev_page: page > 1 ? page - 1 : null,
        next_page: page < totalPages ? page + 1 : null,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// GET /books/:id
export const getBookById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const book = await prisma.book.findUnique({
      where: { id, deletedAt: null },
      include: { genre: { select: { name: true } } },
    });
    if (!book) return res.status(404).json({ success: false, message: "Book not found" });

    return res.json({
      success: true,
      message: "Get book detail successfully",
      data: {
        id: book.id,
        title: book.title,
        writer: book.author,
        publisher: "",
        description: book.description,
        publication_year: null,
        price: parseFloat(book.price.toString()),
        stock_quantity: book.stock,
        genre: book.genre.name,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// PATCH /books/:id
export const updateBook = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { description, price, stock } = req.body;

    if (description === undefined && price === undefined && stock === undefined) {
      return res.status(400).json({
        success: false,
        message: "At least one field (description, price, stock) must be provided",
      });
    }

    const book = await prisma.book.findUnique({ where: { id, deletedAt: null } });
    if (!book) return res.status(404).json({ success: false, message: "Book not found" });

    const updateData: Prisma.BookUpdateInput = { updatedAt: new Date() };
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = price;
    if (stock !== undefined) updateData.stock = stock;

    const updated = await prisma.book.update({
      where: { id },
      data: updateData,
      select: { id: true, title: true, updatedAt: true },
    });

    return res.json({
      success: true,
      message: "Book updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// DELETE /books/:id
export const deleteBook = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const book = await prisma.book.findUnique({ where: { id, deletedAt: null } });
    if (!book) return res.status(404).json({ success: false, message: "Book not found" });

    await prisma.book.update({ where: { id }, data: { deletedAt: new Date() } });
    return res.json({ success: true, message: "Book removed successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};