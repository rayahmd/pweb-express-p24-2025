import { Router } from "express";
import { validate } from "../../middleware/validate";
import { authenticate } from "../../middleware/auth";
import {
  getAllGenres,
  getGenreById,
  createGenre,
  updateGenre,
  deleteGenre,
} from "./genre.controller";
import {
  createGenreSchema,
  updateGenreSchema,
  getGenreByIdSchema,
  deleteGenreSchema,
} from "./genre.schema";

const router = Router();

// Public routes
router.get("/", getAllGenres);
router.get("/:id", validate(getGenreByIdSchema), getGenreById);

// Protected routes (require authentication)
router.post("/", authenticate, validate(createGenreSchema), createGenre);
router.patch("/:id", authenticate, validate(updateGenreSchema), updateGenre);
router.delete("/:id", authenticate, validate(deleteGenreSchema), deleteGenre);

export default router;
