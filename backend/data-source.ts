import { DataSource } from "typeorm";
import { User } from "./src/users/entities/user.entity";
import { Asset } from "./src/assets/entities/asset.entity";
import { AuditLog } from "./src/audit/entities/audit-log.entity";
import * as dotenv from "dotenv";

dotenv.config();

const dbType = process.env.DB_TYPE || "sqlite";

const sqliteOptions = {
  type: "sqlite" as const,
  database: process.env.DB_PATH || "./lite-dam.db",
  entities: [User, Asset, AuditLog],
  migrations: ["src/migrations/*.ts"],
  synchronize: false,
  logging: false,
};

const postgresOptions = {
  type: "postgres" as const,
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432", 10),
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_DATABASE || "lite-dam",
  entities: [User, Asset, AuditLog],
  migrations: ["src/migrations/*.ts"],
  synchronize: false,
  logging: false,
};

const dataSource = new DataSource(
  dbType === "postgres" ? postgresOptions : sqliteOptions,
);

export default dataSource;
