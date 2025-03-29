import { Application } from "express";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { corsConfig } from "../config/cors.config";

async function startMiddlewareServer(app: Application) {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cors(corsConfig));
  app.use(morgan("dev"));
}

export { startMiddlewareServer };
