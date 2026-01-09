import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@awesome-cordova-plugins/sqlite/ngx';
import { Platform } from '@ionic/angular';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { filter } from 'rxjs/operators';
import { MockSQLiteObject } from './mock-sqlite';

@Injectable({
    providedIn: 'root'
})
export class DatabaseService {

    private database: SQLiteObject;
    private dbReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

    constructor(private platform: Platform, private sqlite: SQLite) {
        this.platform.ready().then(() => {
            this.createDatabase();
        });
    }

    dbState() {
        return this.dbReady.asObservable();
    }

    createDatabase() {
        if (this.platform.is('cordova')) {
            this.sqlite.create({
                name: 'biblia_slm.db',
                location: 'default'
            })
                .then((db: SQLiteObject) => {
                    this.database = db;
                    this.createTables();
                })
                .catch(e => console.error('Error creating database', e));
        } else {
            console.warn('SQLite plugin not available. Running in browser mode with MOCK DB.');
            this.database = new MockSQLiteObject() as any;
            this.createTables();
        }
    }

    createTables() {
        // 1. Users (Local Metadata)
        this.database.executeSql(
            `CREATE TABLE IF NOT EXISTS users (
        uuid TEXT PRIMARY KEY,
        cloud_id TEXT,
        email TEXT,
        last_sync INTEGER
      )`, []
        ).then(() => console.log('Table users created'))
            .catch(e => console.error('Error creating table users', e));

        // 2. Bookmarks
        this.database.executeSql(
            `CREATE TABLE IF NOT EXISTS bookmarks (
        id TEXT PRIMARY KEY,
        book_id INTEGER,
        chapter INTEGER,
        verse INTEGER,
        color TEXT,
        created_at INTEGER,
        updated_at INTEGER,
        deleted_at INTEGER,
        is_synced INTEGER
      )`, []
        ).then(() => console.log('Table bookmarks created'))
            .catch(e => console.error('Error creating table bookmarks', e));

        // 3. Notes
        this.database.executeSql(
            `CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY,
        book_id INTEGER,
        chapter INTEGER,
        verse INTEGER,
        content TEXT,
        created_at INTEGER,
        updated_at INTEGER,
        deleted_at INTEGER,
        is_synced INTEGER
      )`, []
        ).then(() => console.log('Table notes created'))
            .catch(e => console.error('Error creating table notes', e));

        // 4. Reading Progress
        this.database.executeSql(
            `CREATE TABLE IF NOT EXISTS reading_progress (
        id TEXT PRIMARY KEY,
        plan_id TEXT,
        day_id INTEGER,
        status INTEGER,
        completed_at INTEGER,
        is_synced INTEGER
      )`, []
        ).then(() => console.log('Table reading_progress created'))
            .catch(e => console.error('Error creating table reading_progress', e));

        // 5. User Stats
        this.database.executeSql(
            `CREATE TABLE IF NOT EXISTS user_stats (
          id TEXT PRIMARY KEY,
          metric_key TEXT,
          value REAL,
          updated_at INTEGER,
          is_synced INTEGER
        )`, []
        ).then(() => {
            console.log('Table user_stats created');
            // Check next table
        })
            .catch(e => console.error('Error creating table user_stats', e));

        // 6. Activity Logs (For Streak)
        this.database.executeSql(
            `CREATE TABLE IF NOT EXISTS activity_logs (
          id TEXT PRIMARY KEY,
          date TEXT,
          timestamp INTEGER,
          type TEXT,
          is_synced INTEGER
        )`, []
        ).then(() => {
            console.log('Table activity_logs created');
            this.dbReady.next(true); // Signal DB is ready
        })
            .catch(e => console.error('Error creating table activity_logs', e));

        // 7. Chapter Progress (For Book Completion Badges)
        this.database.executeSql(
            `CREATE TABLE IF NOT EXISTS chapter_views (
          id TEXT PRIMARY KEY,
          book_id INTEGER,
          chapter INTEGER,
          timestamp INTEGER
        )`, []
        ).then(() => {
            console.log('Table chapter_views created');
            this.dbReady.next(true); // Signal DB is ready
        })
            .catch(e => console.error('Error creating table chapter_views', e));
    }

    // Helper for executing queries
    async executeSql(statement: string, params: any[] = []) {
        await firstValueFrom(this.dbReady.pipe(filter(ready => ready)));
        return this.database.executeSql(statement, params);
    }

    getDatabase(): SQLiteObject {
        return this.database;
    }
}
