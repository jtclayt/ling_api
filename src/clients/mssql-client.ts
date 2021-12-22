import { Sequelize } from "sequelize";
import { ApplicationTokenCredentials } from "ms-rest-azure";

import { DATABASE_NAME } from "../config/constants";

/**
 * Singleton class for handling DB connection.
 */
export class MSSqlClient {
  public static instance : MSSqlClient;
  public db : Sequelize;

  /**
   * Ctor
   * @param aadToken Access token for the DB connection.
   */
  constructor(aadToken: string) {
    if (MSSqlClient.instance) {
      throw new Error("MSSqlClient already instantiated");
    }

    MSSqlClient.instance = this;
    const serverName = `${process.env.DB_SERVER_NAME}.database.windows.net`;

    this.db = new Sequelize(DATABASE_NAME, "", "", {
      dialect: "mssql",
      host: serverName,
      dialectOptions: {
        authentication: {
          type: "azure-active-directory-access-token",
          options: {
            token: aadToken
          }
        }
      }
    });
  }
}