import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), 'env/.env')});

import { App } from "./app";
import { setup } from "./config/setup";

try {
  setup();
  const port: number = Number(process.env.PORT) || 5000;

  App.instance.listen(port, () => {
    console.log(`App is listening on port ${port}`);
  });
} catch (error) {
  console.log(`Startup error: ${error}`);
}
