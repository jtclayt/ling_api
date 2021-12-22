import * as appInsights from "applicationinsights";

import { AZURE_DB_LOGIN_URL, KEY_VAULT_KEYS } from "../config/constants";
import { getAADTokenAsync } from "./get-aad-credentials";
import { KeyVaultClient } from "../clients/keyvault-client";
import { MSSqlClient } from "../clients/mssql-client";

/** Setup resources for API. */
export const setup = () => {
  // App insights resource
  appInsights.setup()
    .setAutoDependencyCorrelation(true)
    .setAutoCollectRequests(true)
    .setAutoCollectPerformance(true, true)
    .setAutoCollectExceptions(true)
    .setAutoCollectDependencies(true)
    .setAutoCollectConsole(true)
    .setUseDiskRetryCaching(true)
    .setSendLiveMetrics(false)
    .setDistributedTracingMode(appInsights.DistributedTracingModes.AI)
    .start();

  // Setup for SQL server
  const tenantId = process.env.AZURE_TENANT_ID || "";
  Promise.all([
    KeyVaultClient.instance.getSecretAsync(KEY_VAULT_KEYS.DatabaseClientId),
    KeyVaultClient.instance.getSecretAsync(KEY_VAULT_KEYS.DatabaseClientSecret)
  ]).then(([clientId, clientSecret]) => {
    getAADTokenAsync(clientId, clientSecret, tenantId, AZURE_DB_LOGIN_URL).then(token => {
      new MSSqlClient(token);
      MSSqlClient.instance.db.authenticate().then(() => {
        console.log("DB connection established!");
      }).catch(err => {
        console.log(`DB connection error: ${err}`);
      });
    });
  });
}