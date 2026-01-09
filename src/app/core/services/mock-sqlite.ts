
export class MockSQLiteObject {
    private tables: any = {
        bookmarks: [],
        notes: [],
        reading_progress: [],
        user_stats: [],
        users: [],
        activity_logs: [],
        chapter_views: []
    };

    constructor() {
        const stored = localStorage.getItem('mock_sqlite_tables');
        if (stored) {
            const parsed = JSON.parse(stored);
            this.tables = { ...this.tables, ...parsed }; // Merge to ensure new tables exist
        }
    }

    executeSql(statement: string, params: any[] = []): Promise<any> {
        return new Promise((resolve) => {
            const sql = statement.trim();
            console.log('[MockDB] Executing:', sql, params);

            // 1. SELECT
            if (sql.toUpperCase().startsWith('SELECT')) {
                const tableNameMatch = sql.match(/FROM\s+(\w+)/i);
                const tableName = tableNameMatch ? tableNameMatch[1] : null;

                if (tableName && this.tables[tableName]) {
                    let rows = [...this.tables[tableName]];

                    // Basic WHERE handling (id = ?)
                    // Note: This is fragile but works for our simple queries
                    if (sql.includes('WHERE deleted_at IS NULL')) {
                        rows = rows.filter(r => !r.deleted_at);
                    }
                    if (sql.includes('is_synced = 0')) {
                        rows = rows.filter(r => r.is_synced === 0);
                    }
                    if (sql.includes('book_id = ? AND chapter = ? AND verse = ?')) {
                        rows = rows.filter(r => r.book_id == params[0] && r.chapter == params[1] && r.verse == params[2]);
                    }
                    if (sql.includes('plan_id = ?')) {
                        rows = rows.filter(r => r.plan_id == params[0]);
                    }

                    resolve({
                        rows: {
                            length: rows.length,
                            item: (i: number) => rows[i]
                        }
                    });
                    return;
                }
            }

            // 2. INSERT OR REPLACE
            if (sql.toUpperCase().includes('INSERT OR REPLACE INTO')) {
                const tableNameMatch = sql.match(/INTO\s+(\w+)/i);
                const tableName = tableNameMatch ? tableNameMatch[1] : null;

                if (tableName && this.tables[tableName]) {
                    // Creating object from params. 
                    // We need to know the column order. 
                    // This is hard without schema knowledge.
                    // BUT our save methods in repo are fixed.
                    // Let's just Map params to object based on Table Name guesses.

                    let newItem: any = {};
                    if (tableName === 'bookmarks') {
                        // id, book_id, chapter, verse, color, created_at, updated_at, deleted_at, is_synced
                        newItem = { id: params[0], book_id: params[1], chapter: params[2], verse: params[3], color: params[4], created_at: params[5], updated_at: params[6], deleted_at: params[7], is_synced: params[8] };
                    } else if (tableName === 'notes') {
                        newItem = { id: params[0], book_id: params[1], chapter: params[2], verse: params[3], content: params[4], created_at: params[5], updated_at: params[6], deleted_at: params[7], is_synced: params[8] };
                    } else if (tableName === 'reading_progress') {
                        // id, plan_id, day_id, status, completed_at, is_synced
                        newItem = { id: params[0], plan_id: params[1], day_id: params[2], status: params[3], completed_at: params[4], is_synced: params[5] };
                    } else if (tableName === 'user_stats') {
                        // id, metric_key, value, updated_at, is_synced
                        newItem = { id: params[0], metric_key: params[1], value: params[2], updated_at: params[3], is_synced: params[4] };
                    } else if (tableName === 'activity_logs') {
                        // id, date, timestamp, type, is_synced
                        newItem = { id: params[0], date: params[1], timestamp: params[2], type: params[3], is_synced: params[4] };
                    } else if (tableName === 'chapter_views') {
                        // id, book_id, chapter, timestamp
                        newItem = { id: params[0], book_id: params[1], chapter: params[2], timestamp: params[3] };
                    }

                    // Remove existing with same ID
                    this.tables[tableName] = this.tables[tableName].filter((i: any) => i.id !== newItem.id);
                    this.tables[tableName].push(newItem);

                    this.save();
                    resolve({ rows: { length: 0 } });
                    return;
                }
            }

            // 3. UDPATE
            if (sql.toUpperCase().startsWith('UPDATE')) {
                const tableNameMatch = sql.match(/UPDATE\s+(\w+)/i);
                const tableName = tableNameMatch ? tableNameMatch[1] : null;
                // Handle "UPDATE reading_progress SET status = ?, ... WHERE id = ?"
                // Mock: Just resolve for now, getting complex.
                resolve({ rows: { length: 0 } });
                return;
            }

            // Fallback
            resolve({ rows: { length: 0, item: () => null } });
        });
    }

    private save() {
        localStorage.setItem('mock_sqlite_tables', JSON.stringify(this.tables));
        console.log('[MockDB] Saved to LocalStorage');
    }
}
