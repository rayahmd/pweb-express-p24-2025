import { ZodTypeAny, ZodError } from "zod";
import { HttpError } from "../utils/errors";

export const validate = (schema: ZodTypeAny, where: "body" | "params" | "query" = "body") => {
  return (req: any, _res: any, next: any) => {
    const parsed = schema.safeParse(req[where]);
    if (!parsed.success) {
      const message = parsed.error.issues.map(e => `${e.path.join(".")}: ${e.message}`).join(", ");
      throw new HttpError(400, message);
    }
    req[where] = parsed.data;
    next();
  };
};
