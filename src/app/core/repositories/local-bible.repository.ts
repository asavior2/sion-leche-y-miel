import { Injectable } from '@angular/core';
import { BibleRepository, Bookmark, Note, ReadingProgress, UserStats } from './bible.repository';
import { DatabaseService } from '../services/database.service';

@Injectable({
    providedIn: 'root'
})
export class LocalBibleRepository implements BibleRepository {

    constructor(private db: DatabaseService) { }

    // --- BOOKMARKS ---
    async getBookmarks(): Promise<Bookmark[]> {
        const res = await this.db.executeSql('SELECT * FROM bookmarks WHERE deleted_at IS NULL', []);
        const items: Bookmark[] = [];
        if (res.rows.length > 0) {
            for (let i = 0; i < res.rows.length; i++) {
                items.push(res.rows.item(i));
            }
        }
        return items;
    }

    async getUnsyncedBookmarks(): Promise<Bookmark[]> {
        const res = await this.db.executeSql('SELECT * FROM bookmarks WHERE is_synced = 0', []);
        const items: Bookmark[] = [];
        if (res.rows.length > 0) {
            for (let i = 0; i < res.rows.length; i++) {
                items.push(res.rows.item(i));
            }
        }
        return items;
    }

    async getBookmark(bookId: number, chapter: number, verse: number): Promise<Bookmark | undefined> {
        const res = await this.db.executeSql(
            'SELECT * FROM bookmarks WHERE book_id = ? AND chapter = ? AND verse = ? AND deleted_at IS NULL',
            [bookId, chapter, verse]
        );
        if (res.rows.length > 0) {
            return res.rows.item(0);
        }
        return undefined;
    }

    async saveBookmark(bookmark: Bookmark, isSynced: boolean = false): Promise<void> {
        const sql = `
      INSERT OR REPLACE INTO bookmarks (id, book_id, chapter, verse, color, created_at, updated_at, deleted_at, is_synced)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
        await this.db.executeSql(sql, [
            bookmark.id, bookmark.book_id, bookmark.chapter, bookmark.verse, bookmark.color,
            bookmark.created_at, bookmark.updated_at, bookmark.deleted_at, isSynced ? 1 : 0
        ]);
    }

    async markBookmarksSynced(ids: string[]): Promise<void> {
        if (ids.length === 0) return;
        // Construct (?,?,?) placeholder string
        const placeholders = ids.map(() => '?').join(',');
        await this.db.executeSql(
            `UPDATE bookmarks SET is_synced = 1 WHERE id IN (${placeholders})`,
            ids
        );
    }

    async deleteBookmark(id: string): Promise<void> {
        // Soft delete
        const now = Date.now();
        await this.db.executeSql(
            'UPDATE bookmarks SET deleted_at = ?, updated_at = ?, is_synced = 0 WHERE id = ?',
            [now, now, id]
        );
    }

    // --- NOTES ---
    async getNotes(): Promise<Note[]> {
        const res = await this.db.executeSql('SELECT * FROM notes WHERE deleted_at IS NULL', []);
        const items: Note[] = [];
        if (res.rows.length > 0) {
            for (let i = 0; i < res.rows.length; i++) {
                items.push(res.rows.item(i));
            }
        }
        return items;
    }

    async getUnsyncedNotes(): Promise<Note[]> {
        const res = await this.db.executeSql('SELECT * FROM notes WHERE is_synced = 0', []);
        const items: Note[] = [];
        if (res.rows.length > 0) {
            for (let i = 0; i < res.rows.length; i++) {
                items.push(res.rows.item(i));
            }
        }
        return items;
    }

    async saveNote(note: Note, isSynced: boolean = false): Promise<void> {
        const sql = `
      INSERT OR REPLACE INTO notes (id, book_id, chapter, verse, content, created_at, updated_at, deleted_at, is_synced)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
        await this.db.executeSql(sql, [
            note.id, note.book_id, note.chapter, note.verse, note.content,
            note.created_at, note.updated_at, note.deleted_at, isSynced ? 1 : 0
        ]);
    }

    async markNotesSynced(ids: string[]): Promise<void> {
        if (ids.length === 0) return;
        const placeholders = ids.map(() => '?').join(',');
        await this.db.executeSql(
            `UPDATE notes SET is_synced = 1 WHERE id IN (${placeholders})`,
            ids
        );
    }

    async deleteNote(id: string): Promise<void> {
        const now = Date.now();
        await this.db.executeSql(
            'UPDATE notes SET deleted_at = ?, updated_at = ?, is_synced = 0 WHERE id = ?',
            [now, now, id]
        );
    }

    // --- PROGRESS ---
    async getReadingProgress(planId: string): Promise<ReadingProgress[]> {
        const res = await this.db.executeSql('SELECT * FROM reading_progress WHERE plan_id = ?', [planId]);
        const items: ReadingProgress[] = [];
        if (res.rows.length > 0) {
            for (let i = 0; i < res.rows.length; i++) {
                items.push(res.rows.item(i));
            }
        }
        return items;
    }

    async getUnsyncedReadingProgress(): Promise<ReadingProgress[]> {
        const res = await this.db.executeSql('SELECT * FROM reading_progress WHERE is_synced = 0', []);
        const items: ReadingProgress[] = [];
        if (res.rows.length > 0) {
            for (let i = 0; i < res.rows.length; i++) {
                items.push(res.rows.item(i));
            }
        }
        return items;
    }

    async saveReadingProgress(progress: ReadingProgress, isSynced: boolean = false): Promise<void> {
        const sql = `
      INSERT OR REPLACE INTO reading_progress (id, plan_id, day_id, status, completed_at, is_synced)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
        await this.db.executeSql(sql, [
            progress.id, progress.plan_id, progress.day_id, progress.status, progress.completed_at, isSynced ? 1 : 0
        ]);
    }

    async markReadingProgressSynced(ids: string[]): Promise<void> {
        if (ids.length === 0) return;
        const placeholders = ids.map(() => '?').join(',');
        await this.db.executeSql(
            `UPDATE reading_progress SET is_synced = 1 WHERE id IN (${placeholders})`,
            ids
        );
    }

    // --- STATS ---
    async getStats(): Promise<UserStats[]> {
        const res = await this.db.executeSql('SELECT * FROM user_stats', []);
        const items: UserStats[] = [];
        if (res.rows.length > 0) {
            for (let i = 0; i < res.rows.length; i++) {
                items.push(res.rows.item(i));
            }
        }
        return items;
    }

    async getUnsyncedStats(): Promise<UserStats[]> {
        const res = await this.db.executeSql('SELECT * FROM user_stats WHERE is_synced = 0', []);
        const items: UserStats[] = [];
        if (res.rows.length > 0) {
            for (let i = 0; i < res.rows.length; i++) {
                items.push(res.rows.item(i));
            }
        }
        return items;
    }

    async saveStat(stat: UserStats, isSynced: boolean = false): Promise<void> {
        const sql = `
      INSERT OR REPLACE INTO user_stats (id, metric_key, value, updated_at, is_synced)
      VALUES (?, ?, ?, ?, ?)
    `;
        await this.db.executeSql(sql, [
            stat.id, stat.metric_key, stat.value, stat.updated_at, isSynced ? 1 : 0
        ]);
    }

    async markStatsSynced(ids: string[]): Promise<void> {
        if (ids.length === 0) return;
        const placeholders = ids.map(() => '?').join(',');
        await this.db.executeSql(
            `UPDATE user_stats SET is_synced = 1 WHERE id IN (${placeholders})`,
            ids
        );
    }

    // --- ACTIVITY LOGS (For Streak) ---
    async logActivity(type: string = 'app_usage'): Promise<void> {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`; // YYYY-MM-DD

        // 1. Check if logged today
        const check = await this.db.executeSql('SELECT id FROM activity_logs WHERE date = ?', [dateStr]);
        if (check.rows.length > 0) return; // Already logged today

        // 2. Log it
        const id = dateStr; // Simple ID: date string itself ensures uniqueness per day
        await this.db.executeSql(
            `INSERT OR REPLACE INTO activity_logs (id, date, timestamp, type, is_synced) VALUES (?, ?, ?, ?, ?)`,
            [id, dateStr, Date.now(), type, 0]
        );
    }

    async getActivityLogs(): Promise<{ date: string, timestamp: number }[]> {
        const res = await this.db.executeSql('SELECT * FROM activity_logs ORDER BY date DESC', []);
        const items: { date: string, timestamp: number }[] = [];
        if (res.rows.length > 0) {
            for (let i = 0; i < res.rows.length; i++) {
                items.push(res.rows.item(i));
            }
        }
        return items;
    }

    // --- CHAPTER PROGRESS ---
    async markChapterViewed(bookId: number, chapter: number): Promise<void> {
        const id = `${bookId}_${chapter}`;
        const now = Date.now();
        await this.db.executeSql(
            `INSERT OR REPLACE INTO chapter_views (id, book_id, chapter, timestamp) VALUES (?, ?, ?, ?)`,
            [id, bookId, chapter, now]
        );
    }

    async getChapterViews(): Promise<{ book_id: number, chapter: number, timestamp: number }[]> {
        const res = await this.db.executeSql('SELECT * FROM chapter_views', []);
        const items: any[] = [];
        if (res.rows.length > 0) {
            for (let i = 0; i < res.rows.length; i++) {
                items.push(res.rows.item(i));
            }
        }
        return items;
    }
}
