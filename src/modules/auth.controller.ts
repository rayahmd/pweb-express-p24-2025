import { PrismaClient, User } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import { HttpError } from "../utils/errors";
import bcrypt from "bcryptjs";
import jwt, { Secret, SignOptions } from "jsonwebtoken";

const prisma = new PrismaClient();

interface RegisterBody {
    email: string;
    password: string;
    username: string;
}

interface LoginBody {
    email: string;
    password: string;
}

interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
    };
}

type SafeUser = Omit<User, "password">;

// REGISTER
export const register = async (req: Request<{}, {}, RegisterBody>, res: Response, next: NextFunction) => {
  try {
    const { email, password, username } = req.body;

    // Cek apakah email sudah terdaftar
  const exists = await (prisma as any).user.findUnique({ where: { email } });
    if (exists) throw new HttpError(409, "Email already registered");

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Create new user
    const user = await (prisma as any).user.create({
      data: {
        email,
        password: hashed,
        username,
      },
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    res.status(201).json({ success: true, data: user });
  } catch (e) {
    next(e);
  }
};

// LOGIN
export const login = async (req: Request<{}, {}, LoginBody>, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const user = await (prisma as any).user.findUnique({ 
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
      }
    });
    
    if (!user) throw new HttpError(401, "Invalid credentials");

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new HttpError(401, "Invalid credentials");

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) throw new HttpError(500, "JWT secret not configured");

    const payload = { id: user.id, email: user.email };
    const token = jwt.sign(payload, jwtSecret as Secret, {
      expiresIn: process.env.JWT_EXPIRES_IN || "1d"
    } as SignOptions);

    res.json({ success: true, data: { token } });
  } catch (e) {
    next(e);
  }
};

// GET ME (PROFILE)
export const me = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) throw new HttpError(401, "Unauthorized");
    
    const user = await (prisma as any).user.findUnique({
      where: { id: (req.user as any).id },
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
        updatedAt: true,
      }
    });
    
    if (!user) throw new HttpError(404, "User not found");
    res.json({ success: true, data: user });
  } catch (e) {
    next(e);
  }
};
