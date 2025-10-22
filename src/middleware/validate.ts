import { ZodTypeAny, ZodError } from "zod";
import { HttpError } from "../utils/errors";

export const validate = (schema: ZodTypeAny) => {
  return (req: any, _res: any, next: any) => {
    const parsed = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });
    
    if (!parsed.success) {
      const message = parsed.error.issues.map((e: any) => `${e.path.join(".")}: ${e.message}`).join(", ");
      throw new HttpError(400, message);
    }
    
    // Update req dengan data yang sudah divalidasi
    const data = parsed.data as any;
    if (data.body) req.body = data.body;
    if (data.params) req.params = data.params;
    if (data.query) req.query = data.query;
    
    next();
  };
};
