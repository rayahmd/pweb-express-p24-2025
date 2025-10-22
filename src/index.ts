import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { errorHandler } from "./utils/errors";
import authRoutes from "./modules/auth.route";
// import bookRoutes from "./modules/book/book.route";
// import genreRoutes from "./modules/genre/genre.route";
// import trxRoutes from "./modules/transaction/transaction.route";


const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));


app.get("/health", (_req, res) => res.json({ ok: true }));


app.use("/auth", authRoutes);
// app.use("/books", bookRoutes);
// app.use("/genre", genreRoutes);
// app.use("/transactions", trxRoutes);


app.use(errorHandler);


const port = Number(process.env.PORT || 8080);
app.listen(port)
	.on('listening', () => {
		console.log(`Server listening on http://localhost:${port}`);
	})
	.on('error', (err) => {
		console.error('Failed to start server:', err);
		process.exit(1);
	});