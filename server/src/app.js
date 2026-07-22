import cors from "cors";
import express from "express";
import { router as todosRouter } from "./routes/todos.js";

export const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/todos", todosRouter);
