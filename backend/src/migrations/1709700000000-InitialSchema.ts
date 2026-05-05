import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from "typeorm";

export class InitialSchema1709700000000 implements MigrationInterface {
  name = "InitialSchema1709700000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "users",
        columns: [
          {
            name: "id",
            type: "integer",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          { name: "username", type: "varchar", isUnique: true },
          { name: "email", type: "varchar", isUnique: true },
          { name: "password", type: "varchar" },
          { name: "role", type: "varchar", default: "'user'" },
          { name: "isActive", type: "boolean", default: true },
          { name: "nickname", type: "varchar", isNullable: true },
          { name: "avatar", type: "varchar", isNullable: true },
          { name: "storageUsed", type: "bigint", default: 0 },
          { name: "storageQuota", type: "bigint", default: 1073741824 },
          { name: "themeColor", type: "varchar", isNullable: true },
          { name: "darkMode", type: "boolean", default: false },
          { name: "createdAt", type: "datetime", default: "CURRENT_TIMESTAMP" },
          { name: "updatedAt", type: "datetime", default: "CURRENT_TIMESTAMP" },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: "assets",
        columns: [
          {
            name: "id",
            type: "integer",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          { name: "name", type: "varchar" },
          { name: "originalName", type: "varchar" },
          { name: "filePath", type: "varchar" },
          { name: "mimeType", type: "varchar" },
          { name: "size", type: "bigint" },
          { name: "description", type: "varchar", isNullable: true },
          { name: "tags", type: "simple-array", isNullable: true },
          { name: "category", type: "varchar", isNullable: true },
          { name: "aiTags", type: "simple-array", isNullable: true },
          { name: "folder", type: "varchar", isNullable: true },
          { name: "ownerId", type: "integer" },
          { name: "createdAt", type: "datetime", default: "CURRENT_TIMESTAMP" },
          { name: "updatedAt", type: "datetime", default: "CURRENT_TIMESTAMP" },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: "audit_logs",
        columns: [
          {
            name: "id",
            type: "integer",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          { name: "userId", type: "integer" },
          { name: "action", type: "varchar" },
          { name: "targetType", type: "varchar", isNullable: true },
          { name: "targetId", type: "integer", isNullable: true },
          { name: "details", type: "varchar", isNullable: true },
          { name: "ipAddress", type: "varchar", isNullable: true },
          { name: "userAgent", type: "varchar", isNullable: true },
          { name: "timestamp", type: "datetime", default: "CURRENT_TIMESTAMP" },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      "assets",
      new TableForeignKey({
        columnNames: ["ownerId"],
        referencedTableName: "users",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      }),
    );

    await queryRunner.createForeignKey(
      "audit_logs",
      new TableForeignKey({
        columnNames: ["userId"],
        referencedTableName: "users",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      }),
    );

    await queryRunner.createIndex(
      "idx_assets_ownerId",
      new TableIndex({
        name: "idx_assets_ownerId",
        columnNames: ["ownerId"],
      }),
    );

    await queryRunner.createIndex(
      "idx_audit_logs_userId",
      new TableIndex({
        name: "idx_audit_logs_userId",
        columnNames: ["userId"],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const auditTable = await queryRunner.getTable("audit_logs");
    if (auditTable) {
      const userFk = auditTable.foreignKeys.find((fk) =>
        fk.columnNames.includes("userId"),
      );
      if (userFk) await queryRunner.dropForeignKey("audit_logs", userFk);
    }

    const assetsTable = await queryRunner.getTable("assets");
    if (assetsTable) {
      const ownerFk = assetsTable.foreignKeys.find((fk) =>
        fk.columnNames.includes("ownerId"),
      );
      if (ownerFk) await queryRunner.dropForeignKey("assets", ownerFk);
      const idxOwnerId = assetsTable.indices.find(
        (idx) => idx.name === "idx_assets_ownerId",
      );
      if (idxOwnerId)
        await queryRunner.dropIndex("assets", "idx_assets_ownerId");
    }

    const idxAuditUserId = auditTable?.indices.find(
      (idx) => idx.name === "idx_audit_logs_userId",
    );
    if (idxAuditUserId)
      await queryRunner.dropIndex("audit_logs", "idx_audit_logs_userId");

    await queryRunner.dropTable("audit_logs", true);
    await queryRunner.dropTable("assets", true);
    await queryRunner.dropTable("users", true);
  }
}
