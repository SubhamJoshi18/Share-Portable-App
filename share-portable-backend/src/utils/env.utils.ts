import dotenv from "dotenv";
dotenv.config();

const checkEnvExists = (envKey: string): boolean => {
  return process.env.hasOwnProperty(envKey);
};

const getEnvValue = (envKey: string) => {
  return checkEnvExists(envKey) ? process.env[envKey] : null;
};

export { getEnvValue };
