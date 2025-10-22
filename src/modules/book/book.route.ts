import { Router } from "express";
import { validate } from "../../middleware/validate";
import { getAllBooks, getBookById } from "./book.controller";
import { getBookByIdSchema } from "./book.schema";

const router = Router();

// Public routes
router.get("/", getAllBooks);
router.get("/:id", validate(getBookByIdSchema), getBookById);

export default router;
