import { Injectable } from '@nestjs/common';
import initSqlJs, { Database, SqlJsStatic } from 'sql.js';
import { performance } from 'perf_hooks';

@Injectable()
export class SqlService {
  private SQL: SqlJsStatic;
  private db: Database;

  constructor() {
    this.initialize();
  }

  async initialize() {
    this.SQL = await initSqlJs();
  }

  async run(sqlSchema: string, fillData: string, query: string) {
    const db = new this.SQL.Database();

    db.run(sqlSchema);
    db.run(fillData);

    const beforeSnapshot = this.getAllTablesData(db);
    let executionTimeMs: number;
    let formattedResult: {
      columns: string[];
      values: initSqlJs.SqlValue[][];
    }[];

    try {
      db.exec('SELECT 1;');

      const start = performance.now();
      let result = db.exec(query);
      const end = performance.now();
      executionTimeMs = end - start;

      if (result.length === 0) {
        result = db.exec('');
      }
      formattedResult = result.map((r) => ({
        columns: r.columns,
        values: r.values,
      }));
    } catch (e) {
      const friendlyError = this.parseSqlError(e.message);
      return { success: false, error: friendlyError };
    }

    const afterSnapshot = this.getAllTablesData(db);
    return {
      success: true,
      executionTimeMs,
      data: formattedResult,
      beforeSnapshot,
      afterSnapshot,
    };
  }

  private getAllTablesData(db: any): Record<string, any[]> {
    const result = {};
    const tables = db.exec(
      `SELECT name FROM sqlite_master WHERE type='table';`,
    );

    if (tables.length > 0) {
      const tableNames = tables[0].values.flat();

      for (const table of tableNames) {
        const rows = db.exec(`SELECT * FROM ${table};`);
        result[table] = rows.length > 0 ? rows[0].values : [];
      }
    }

    return result;
  }

  parseSqlError(message: string) {
    const tables = this.getAllTableNames();

    if (message.includes('no such table')) {
      const tableMatch = message.match(/no such table: (\w+)/);
      const wrongTableName = tableMatch ? tableMatch[1] : null;

      if (wrongTableName) {
        // Поиск похожих таблиц
        const suggestions = tables.filter((t) =>
          this.isSimilar(t, wrongTableName),
        );

        if (suggestions.length > 0) {
          return `Таблицы "${wrongTableName}" не существует. Возможно, вы имели в виду: ${suggestions.join(', ')}.`;
        } else {
          return `Таблицы "${wrongTableName}" не существует. Доступные таблицы: ${tables.join(', ')}.`;
        }
      }

      return 'Ошибка: Таблица не найдена.';
    }

    if (message.includes('no such column')) {
      const columnMatch = message.match(/no such column: (\w+)/);
      const wrongColumnName = columnMatch ? columnMatch[1] : null;

      if (wrongColumnName) {
        return `Столбца "${wrongColumnName}" не существует. Проверьте названия столбцов.`;
      }

      return 'Ошибка: Столбец не найден.';
    }

    const nearMatch = message.match(/near "(.+?)":/);
    const nearWord = nearMatch ? nearMatch[1] : null;

    if (message.includes('syntax error')) {
      return nearWord
        ? `Ошибка синтаксиса возле "${nearWord}". Проверьте правильность команды.`
        : 'Ошибка синтаксиса. Проверьте правильность написания команды.';
    }

    return 'Неизвестная ошибка выполнения запроса.';
  }

  getAllTableNames(): string[] {
    try {
      const res = this.db.exec(
        "SELECT name FROM sqlite_master WHERE type='table';",
      );
      if (res.length > 0) {
        return res[0].values.flat() as string[];
      }
    } catch {
      return [];
    }
    return [];
  }

  isSimilar(a: string, b: string): boolean {
    a = a.toLowerCase();
    b = b.toLowerCase();
    return (
      a.includes(b) || b.includes(a) || this.levenshteinDistance(a, b) <= 2
    );
  }

  levenshteinDistance(a: string, b: string): number {
    const matrix = [];

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // замена
            matrix[i][j - 1] + 1, // вставка
            matrix[i - 1][j] + 1, // удаление
          );
        }
      }
    }

    return matrix[b.length][a.length];
  }
}
