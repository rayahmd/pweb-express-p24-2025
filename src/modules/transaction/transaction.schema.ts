import { z } from "zod";

// Schema untuk create transaction
export const createTransactionSchema = z.object({
  body: z.object({
    user_id: z.string().optional(), // Optional karena bisa dari token
    items: z.array(
      z.object({
        book_id: z.string().min(1, "Book ID is required"),
        quantity: z.number().int().positive("Quantity must be positive"),
      })
    ).min(1, "At least one item is required"),
  }),
});

// Schema untuk get transaction by ID
export const getTransactionByIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Transaction ID is required"),
  }),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type GetTransactionByIdInput = z.infer<typeof getTransactionByIdSchema>;
