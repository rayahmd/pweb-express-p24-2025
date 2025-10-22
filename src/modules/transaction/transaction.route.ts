import { Router } from "express";
import { validate } from "../../middleware/validate";
import { authenticate } from "../../middleware/auth";
import {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  getTransactionStats,
} from "./transaction.controller";
import {
  createTransactionSchema,
  getTransactionByIdSchema,
} from "./transaction.schema";

const router = Router();

// Semua route transaction memerlukan authentication
router.use(authenticate);

router.get("/", getAllTransactions);
router.get("/statistics", getTransactionStats);
router.get("/:id", validate(getTransactionByIdSchema), getTransactionById);
router.post("/", validate(createTransactionSchema), createTransaction);

export default router;
