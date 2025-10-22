import { z } from "zod";

// Schema untuk get book by ID
export const getBookByIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Book ID is required"),
  }),
});

export type GetBookByIdInput = z.infer<typeof getBookByIdSchema>;
