"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prisma_1 = __importDefault(require("./config/prisma"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.port || 3000;
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.get("/", (req, res) => {
    res.json({ message: 'Express + Prisma + PostgreSQL' });
});
app.listen(PORT, () => {
    console.log(`Express is running on port http://localhost:${PORT}`);
});
process.on('SIGINT', async () => {
    await prisma_1.default.$disconnect();
    console.log('Database disconnected');
    process.exit(0);
});
//# sourceMappingURL=index.js.map