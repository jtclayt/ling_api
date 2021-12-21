import appInsights from "applicationinsights";
import dotenv from "dotenv";
import express, { Application, Request, Response } from "express";
import path from "path";

import { KeyVaultClient } from "./clients/keyvault-client";

appInsights.setup().start();
dotenv.config({ path: path.resolve(process.cwd(), 'env/.env')});
const app: Application = express();
const port: number = Number(process.env.PORT) || 5000;

app.get("/", async (req: Request, res: Response) => {
  const secret = await KeyVaultClient.instance.getSecretAsync("Test");
  res.status(200).json({ data: secret });
});

app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
})
