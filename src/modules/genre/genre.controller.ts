import { PrismaClient } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import { HttpError } from "../../utils/errors";

const prisma = new PrismaClient();

// GET ALL GENRES
export const getAllGenres = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const genres = await prisma.genre.findMany({
      where: {
        deletedAt: null, // Hanya ambil genre yang belum dihapus
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            books: true, // Hitung jumlah buku per genre
          },
        },
      },
    });

    res.json({
      success: true,
      data: genres,
    });
  } catch (error) {
    next(error);
  }
};

// GET GENRE BY ID
export const getGenreById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const genre = await prisma.genre.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        books: {
          where: {
            deletedAt: null,
          },
          select: {
            id: true,
            title: true,
            author: true,
            price: true,
            stock: true,
          },
        },
      },
    });

    if (!genre) {
      throw new HttpError(404, "Genre not found");
    }

    res.json({
      success: true,
      data: genre,
    });
  } catch (error) {
    next(error);
  }
};

// CREATE GENRE
export const createGenre = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description } = req.body;

    // Cek apakah genre dengan nama yang sama sudah ada
    const exists = await prisma.genre.findFirst({
      where: {
        name,
        deletedAt: null,
      },
    });

    if (exists) {
      throw new HttpError(409, "Genre with this name already exists");
    }

    const genre = await prisma.genre.create({
      data: {
        name,
        description,
      },
    });

    res.status(201).json({
      success: true,
      message: "Genre created successfully",
      data: genre,
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE GENRE
export const updateGenre = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    // Cek apakah genre exists
    const genre = await prisma.genre.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!genre) {
      throw new HttpError(404, "Genre not found");
    }

    // Jika name diubah, cek apakah sudah ada genre lain dengan nama yang sama
    if (name && name !== genre.name) {
      const exists = await prisma.genre.findFirst({
        where: {
          name,
          deletedAt: null,
          id: { not: id },
        },
      });

      if (exists) {
        throw new HttpError(409, "Genre with this name already exists");
      }
    }

    const updatedGenre = await prisma.genre.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
      },
    });

    res.json({
      success: true,
      message: "Genre updated successfully",
      data: updatedGenre,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE GENRE (Soft Delete)
export const deleteGenre = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Cek apakah genre exists
    const genre = await prisma.genre.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        _count: {
          select: {
            books: true,
          },
        },
      },
    });

    if (!genre) {
      throw new HttpError(404, "Genre not found");
    }

    // Cek apakah genre masih memiliki buku
    if (genre._count.books > 0) {
      throw new HttpError(400, "Cannot delete genre that has books. Please delete or reassign the books first.");
    }

    // Soft delete
    await prisma.genre.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    res.json({
      success: true,
      message: "Genre deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
