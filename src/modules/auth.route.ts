import { Router } from "express";
import { validate } from "../middleware/validate";
import { loginSchema, registerSchema } from "./auth.schema";
import { login, me, register } from "./auth.controller";
import { requireAuth } from "../middleware/auth";


const r = Router();


r.post("/register", validate(registerSchema), register);
r.post("/login", validate(loginSchema), login);
r.get("/me", requireAuth, me);


export default r;