import { HttpError } from "../utils/errors";

// Minimal local type for Zod schema to avoid hard dependency on zod typings in build environments
type ZodIssue = { path: Array<string | number>; message: string };
type SafeParseReturn<T> = { success: true; data: T } | { success: false; error: { issues: ZodIssue[] } };
type ZodSchemaAny = { safeParse: (data: any) => SafeParseReturn<any> };

export const validate = (schema: ZodSchemaAny, where: "body" | "params" | "query" = "body") =>
    (req: Record<string, any>, _res: any, next: (err?: any) => void) => {
        const parsed = schema.safeParse(req[where]);
        if (!parsed.success) {
            const issues = parsed.error.issues;
            const paths = issues.map((i) => i.path.join('.'));
            const messages = issues.map((i) => i.message);
            return next(new HttpError(400, `${paths.join(', ')}: ${messages.join(', ')}`));
        }
        req[where] = parsed.data;
        next();
    };