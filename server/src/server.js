import cors from "cors";
import express from "express";
import { router as todosRouter } from "./routes/todos.js";

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors());
app.use(express.json());

app.use("/api/todos", todosRouter);

app.listen(PORT, () => {
  console.log(`Todo API server listening on http://localhost:${PORT}`);
});
