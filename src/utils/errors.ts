export class HttpError extends Error {
    status: number;
    constructor(status: number, message: string) {
        super(message);
        this.status = status;
        Object.setPrototypeOf(this, HttpError.prototype);
    }
}

export const errorHandler = (err: any, _req: any, res: any, _next: any) => {
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';
    res.status(status).json({ success: false, message });
};
