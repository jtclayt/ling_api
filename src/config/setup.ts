import * as appInsights from "applicationinsights";
import cors from "cors";
import express from "express";

import { App } from "../app";
import { MSSqlClient } from "../clients/mssql.client";
import { dbInit } from "./db-init";
import { userController } from "../controllers/user.controller";

/** Setup resources for API. */
export const setup = () => {
  checkConfiguration();
  setupAppInsights();
  registerExpress();
  setupDBConnection();
}

/** Ensure required configs are available. */
const checkConfiguration = () => {
  const ENV_VARIABLES = [
    "KEY_VAULT_NAME", "DB_SERVER_NAME", "AZURE_TENANT_ID", "AZURE_CLIENT_ID",
    "AZURE_CLIENT_SECRET", "APPINSIGHTS_INSTRUMENTATIONKEY", "TOKEN_KEY"
  ];

  for (const variable of ENV_VARIABLES) {
    if (!process.env[variable]) throw new Error(`Missing environment variable ${variable}`);
  }
};

/** Setup for app insights instance. */
const setupAppInsights = () => {
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
}

/** Register express middleware and controllers. */
const registerExpress = () => {
  // Express endpoints and middleware
  App.instance.use(express.json());
  App.instance.use(express.urlencoded({extended: true}));
  // Setup CORS
  App.instance.use(cors({
    origin: "http://localhost:3000"
  }));
  userController();
}

/** Setup the database connection. */
const setupDBConnection = () => {
  MSSqlClient.instance.db
    .authenticate()
    .then(() => {
      console.log("DB connection established.");
      dbInit();
    }).catch(error => {
      console.log(`DB setup error: ${error}`);
      throw error;
    });
}
