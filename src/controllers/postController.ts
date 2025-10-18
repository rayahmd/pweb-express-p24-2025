import { Request, Response } from 'express';
import prisma from '../config/prisma';

export const createPost = async (req: Request, res: Response) => {
  try {
    const { title, content, authorId } = req.body;

    // Validasi input
    if (!title || !authorId) {
      return res.status(400).json({ 
        error: 'Title dan authorId wajib diisi' 
      });
    }

    // Cek apakah user ada
    const user = await prisma.user.findUnique({
      where: { id: Number(authorId) }
    });

    if (!user) {
      return res.status(404).json({ 
        error: 'User tidak ditemukan' 
      });
    }

    // Buat post baru
    const post = await prisma.post.create({
      data: {
        title,
        content,
        authorId: Number(authorId)
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Post berhasil dibuat',
      data: post
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      error: 'Terjadi kesalahan saat membuat post' 
    });
  }
};

export const getAllPosts = async (req: Request, res: Response) => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      message: 'Berhasil mengambil data posts',
      data: posts
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      error: 'Terjadi kesalahan saat mengambil data posts' 
    });
  }
};

export const getPostById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const post = await prisma.post.findUnique({
      where: { id: Number(id) },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!post) {
      return res.status(404).json({ 
        error: 'Post tidak ditemukan' 
      });
    }

    res.json({
      message: 'Berhasil mengambil data post',
      data: post
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      error: 'Terjadi kesalahan saat mengambil data post' 
    });
  }
};

export const updatePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content, published } = req.body;

    // Cek apakah post ada
    const existingPost = await prisma.post.findUnique({
      where: { id: Number(id) }
    });

    if (!existingPost) {
      return res.status(404).json({ 
        error: 'Post tidak ditemukan' 
      });
    }

    // Update post
    const post = await prisma.post.update({
      where: { id: Number(id) },
      data: {
        ...(title && { title }),
        ...(content !== undefined && { content }),
        ...(published !== undefined && { published })
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.json({
      message: 'Post berhasil diupdate',
      data: post
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      error: 'Terjadi kesalahan saat update post' 
    });
  }
};

export const deletePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Cek apakah post ada
    const existingPost = await prisma.post.findUnique({
      where: { id: Number(id) }
    });

    if (!existingPost) {
      return res.status(404).json({ 
        error: 'Post tidak ditemukan' 
      });
    }

    // Hapus post
    await prisma.post.delete({
      where: { id: Number(id) }
    });

    res.json({
      message: 'Post berhasil dihapus'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      error: 'Terjadi kesalahan saat menghapus post' 
    });
  }
};