import { Request, Response } from "express";
import prisma from "../config/prisma";
import { error } from "console";

export const createUser = async (req: Request, res: Response) => {
    try{
        const { email, name, password} = req.body;

    if(!email || !password){
        return res.status(400).json({
            error: "Email dan password wajib diisi"
        });
    }

    const existingUser = await prisma.user.findUnique({
        where: { email }
    });

    if(existingUser){
        return res.status(400).json({
            error: "Email sudah terdaftar"
        });
    }

    const user = await prisma.user.create({
        data: {
            email,
            name,
            password
        },
        select: {
            id: true,
            email: true,
            name: true,
            createdAt: true
        }
    });

    res.status(201).json({ message: "User created successfully", user });   


    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        _count: {
          select: { posts: true }
        }
      }
    });

    res.json({
      message: 'Berhasil mengambil data users',
      data: users
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      error: 'Terjadi kesalahan saat mengambil data users' 
    });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        posts: {
          select: {
            id: true,
            title: true,
            published: true,
            createdAt: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ 
        error: 'User tidak ditemukan' 
      });
    }

    res.json({
      message: 'Berhasil mengambil data user',
      data: user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      error: 'Terjadi kesalahan saat mengambil data user' 
    });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { email, name } = req.body;

    // Cek apakah user ada
    const existingUser = await prisma.user.findUnique({
      where: { id: Number(id) }
    });

    if (!existingUser) {
      return res.status(404).json({ 
        error: 'User tidak ditemukan' 
      });
    }

    // Update user
    const user = await prisma.user.update({
      where: { id: Number(id) },
      data: {
        ...(email && { email }),
        ...(name && { name })
      },
      select: {
        id: true,
        email: true,
        name: true,
        updatedAt: true
      }
    });

    res.json({
      message: 'User berhasil diupdate',
      data: user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      error: 'Terjadi kesalahan saat update user' 
    });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Cek apakah user ada
    const existingUser = await prisma.user.findUnique({
      where: { id: Number(id) },
      include: {
        _count: {
          select: { posts: true }
        }
      }
    });

    if (!existingUser) {
      return res.status(404).json({ 
        error: 'User tidak ditemukan' 
      });
    }

    // Hapus semua post user terlebih dahulu (cascade delete)
    await prisma.post.deleteMany({
      where: { authorId: Number(id) }
    });

    // Hapus user
    await prisma.user.delete({
      where: { id: Number(id) }
    });

    res.json({
      message: 'User berhasil dihapus'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      error: 'Terjadi kesalahan saat menghapus user' 
    });
  }
};