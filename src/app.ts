import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), 'env/.env')});

import express, { Application, Request, Response } from "express";

import { setup } from "./config/setup";
import { User } from "./models/user.model";


const app: Application = express();
const port: number = Number(process.env.PORT) || 5000;
setup();

app.get("/", async (req: Request, res: Response) => {
  // Testing some user stuff
  const me = await User.findByPk(1);

  const data = me ? me.toJSON() : {error: "User not found"};

  res.status(200).json({ data: data });
});

app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
})
