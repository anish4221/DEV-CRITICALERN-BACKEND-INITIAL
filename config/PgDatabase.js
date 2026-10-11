import { Sequelize } from "sequelize";
import dotenv from "dotenv";

// Load .env here directly — database.js is imported before server.js
// calls dotenv.config(), so env vars must be loaded at this point
// or process.env.DB_PASSWORD will be undefined when Sequelize initialises.
dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT) || 5432,
    dialect: "postgres",

    define: {
      schema: process.env.DB_SCHEMA || "Form",
    },

    // Show SQL queries in development, silence them in production.
    logging: process.env.NODE_ENV === "development" ? console.log : false,

    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

export default sequelize;
