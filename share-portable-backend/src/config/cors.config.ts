import { CorsOptions } from "cors";
import { getEnvValue } from "../utils/env.utils";

const corsConfig = Object.seal({
  origin: getEnvValue("FRONTEND_URL"),
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true,
} as CorsOptions);

export { corsConfig };
