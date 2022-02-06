import { Sequelize } from "sequelize";

import { AZURE_DB_LOGIN_URL, KEY_VAULT_KEYS } from "../config/constants";
import { DATABASE_NAME } from "../config/constants";
import { getAADTokenAsync } from "../config/get-aad-credentials";
import { KeyVaultClient } from "./keyvault.client";

/**
 * Singleton class for handling DB connection.
 */
export class MSSqlClient {
  public static instance = new MSSqlClient();
  public db : Sequelize;

  /** Ctor@param aadToken Access token for the DB connection. */
  constructor() {
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
            token: ""
          }
        },
        options: {
          encrypt: true
        },
        connectTimeout: 30000
      },
      pool: {
        max: 2,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    });
    // beforeConnect hook not playing nicely with typescript, make config any as workaround
    this.db.addHook("beforeConnect", async (config: any) => {
      const token = await this.getAADToken();
      config.dialectOptions.authentication.options.token = token;
    });
  }

  /**
   * Helper method for retrieving service principal token for DB.
   * @returns The token for connecting.
   */
  private async getAADToken(): Promise<string> {
    return await getAADTokenAsync(
      await KeyVaultClient.instance.getSecretAsync(KEY_VAULT_KEYS.DatabaseClientId),
      await KeyVaultClient.instance.getSecretAsync(KEY_VAULT_KEYS.DatabaseClientSecret),
      process.env.AZURE_TENANT_ID || "",
      AZURE_DB_LOGIN_URL
    );
  }
}