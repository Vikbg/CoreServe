import mysql from "mysql2";
import dotenv from "dotenv";
import { log } from "./utils/logger.js";

dotenv.config();

const isTest = process.env.NODE_ENV === "test";

const databaseName = isTest ? process.env.DB_NAME_TEST : process.env.DB_NAME;

const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: databaseName,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: "utf8mb4",
});

db.getConnection((err, connection) => {
  if (err) {
    log.error(`MariaDB connection failed: ${err.message}`);
  } else {
    connection.release();
    log.success(`Connected to MariaDB database "${databaseName}".`);
  }
});

export default db;
