import { DatabaseSync, StatementSync } from "node:sqlite";
import { Injector } from "../util/Injector";

export class MigrationsRepo {
  private migrations: string[];
  
  private db: DatabaseSync;
  private queryMigrations: StatementSync;
  private insertMigration: StatementSync;

  constructor(injector: Injector) {
    this.db = injector.get(DatabaseSync);

    this.queryMigrations = this.db.prepare("SELECT sql FROM migrations");
    this.migrations = this.queryMigrations.all().map((row: any) => (row as { sql: string }).sql);
    this.insertMigration = this.db.prepare("INSERT INTO migrations (sql) VALUES (?)");
  }

  public ensureMigrationSqlMany(sqls: string[]) {
    for (const sql of sqls)
      this.ensureMigrationSql(sql);
  }

  public ensureMigrationSql(sql: string) {
    if (this.migrations.includes(sql)) return;

    this.db.exec("BEGIN TRANSACTION");
    this.db.exec(sql);
    this.insertMigration.run(sql);
    this.db.exec("COMMIT");
    
    this.migrations.push(sql);
  }
}
