import * as appInsights from "applicationinsights";
import { MSSqlClient } from "../clients/mssql.client";

import { dbInit } from "./db-init";

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

  // Database connection setup and sync
  MSSqlClient.instance.db
    .authenticate()
    .then(() => {
      console.log("DB connection established.")
      dbInit();
    }).catch(error => {
      console.log(`DB setup error: ${error}`)
    });
}