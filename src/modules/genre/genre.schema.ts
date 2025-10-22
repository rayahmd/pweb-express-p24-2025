import { z } from "zod";

// Schema untuk create genre
export const createGenreSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
  }),
});

// Schema untuk update genre
export const updateGenreSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Genre ID is required"),
  }),
  body: z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
  }),
});

// Schema untuk get genre by ID
export const getGenreByIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Genre ID is required"),
  }),
});

// Schema untuk delete genre
export const deleteGenreSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Genre ID is required"),
  }),
});

export type CreateGenreInput = z.infer<typeof createGenreSchema>;
export type UpdateGenreInput = z.infer<typeof updateGenreSchema>;
export type GetGenreByIdInput = z.infer<typeof getGenreByIdSchema>;
export type DeleteGenreInput = z.infer<typeof deleteGenreSchema>;
