import express from "express";
import connectDB from "./DB/db.connection.js";
import { authRouter, userRouter } from "./modules/index.js";
import { env } from "../config/config.service.js";
import cors from "cors";

const bootstrap = (app) => {
	app.use(cors())
	app.use(express.json());
	app.use('/uploads',express.static('uploads'))
	app.get("/", (req, res, next) => {
		return res.json({
			messsage: "done",
		});
	});
	app.use("/auth", authRouter);
	app.use("/users", userRouter);
	connectDB();

	app.use((err, req, res, next) => {
		const statusCode = err.cause?.status || 500;
		return res.status(statusCode).json({
			message: err.message,
		});
	});
	app.listen(env.port, () => {
		console.log(`app is running on port ${env.port}`);
	});
};

export default bootstrap;
