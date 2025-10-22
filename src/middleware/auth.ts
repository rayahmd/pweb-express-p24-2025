import jwt from "jsonwebtoken";
import { HttpError } from "../utils/errors";


export interface JwtPayload { id: number; email: string; }

export const requireAuth = (req: any, _res: any, next: any) => {
    const header = req.headers.authorization as string | undefined;
    if (!header?.startsWith("Bearer ")) throw new HttpError(401, "Missing token");
    try {
        const token = header.split(" ")[1];
        const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
        req.user = payload;
        next();
    } catch {
        next(new HttpError(401, "Invalid or expired token"));
    }
};

// Alias untuk requireAuth
export const authenticate = requireAuth;

