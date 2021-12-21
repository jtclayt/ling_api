import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), 'env/.env')});
const app: Application = express();
const port: number = Number(process.env.PORT) || 5000;

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ data: "hello" });
});

app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
})
