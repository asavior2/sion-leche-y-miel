import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { LocalBibleRepository } from '../repositories/local-bible.repository';
import { FirebaseBibleRepository } from '../repositories/firebase-bible.repository';
import { Bookmark, ReadingProgress } from '../repositories/bible.repository';
import { BehaviorSubject, firstValueFrom } from 'rxjs';

@Injectable()
export class SyncService {

    private _isSyncing = new BehaviorSubject<boolean>(false);
    isSyncing$ = this._isSyncing.asObservable();

    constructor(
        private auth: AuthService,
        private localRepo: LocalBibleRepository,
        private cloudRepo: FirebaseBibleRepository
    ) { }

    private lastSyncTime: number = 0;
    private readonly SYNC_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

    async syncAll(force: boolean = false) {
        // 1. Concurrency Check
        if (this._isSyncing.value) {
            console.log('Sync skipped: Already syncing.');
            return;
        }

        // 2. Network Check
        // Note: navigator.onLine is a basic check. effectiveType could be used for 'data saver'.
        if (!navigator.onLine) {
            console.log('Sync skipped: Offline.');
            return;
        }

        // 3. Cooldown Check (unless forced)
        const now = Date.now();
        if (!force && (now - this.lastSyncTime < this.SYNC_COOLDOWN_MS)) {
            console.log(`Sync skipped: Cooldown active. Last sync: ${Math.round((now - this.lastSyncTime) / 1000)}s ago.`);
            return;
        }

        // Wait for auth state to resolve, as currentUser might be null closely after login
        const user = await firstValueFrom(this.auth.user$);
        if (!user) {
            console.warn('Sync aborted: No authenticated user.');
            return;
        }

        this._isSyncing.next(true);
        try {
            // STEP 1: PUSH (Client -> Cloud)
            await this.pushLocalChanges();

            // STEP 2: SMART PULL (Cloud -> Client)
            await this.smartPull();

            this.lastSyncTime = Date.now();
            console.log('Sync completed successfully.');
        } catch (error) {
            console.error('Sync failed:', error);
        } finally {
            this._isSyncing.next(false);
        }
    }

    private async pushLocalChanges() {
        // Bookmarks
        const unsyncedBookmarks = await this.localRepo.getUnsyncedBookmarks();
        if (unsyncedBookmarks.length > 0) {
            console.log(`Pushing ${unsyncedBookmarks.length} bookmarks...`);
            for (const item of unsyncedBookmarks) {
                await this.cloudRepo.saveBookmark(item);
            }
            const ids = unsyncedBookmarks.map(b => b.id);
            await this.localRepo.markBookmarksSynced(ids);
        }

        // Notes
        const unsyncedNotes = await this.localRepo.getUnsyncedNotes();
        if (unsyncedNotes.length > 0) {
            console.log(`Pushing ${unsyncedNotes.length} notes...`);
            for (const item of unsyncedNotes) {
                await this.cloudRepo.saveNote(item);
            }
            const ids = unsyncedNotes.map(n => n.id);
            await this.localRepo.markNotesSynced(ids);
        }

        // Reading Progress
        const unsyncedProgress = await this.localRepo.getUnsyncedReadingProgress();
        if (unsyncedProgress.length > 0) {
            console.log(`Pushing ${unsyncedProgress.length} progress items...`);
            for (const item of unsyncedProgress) {
                await this.cloudRepo.saveReadingProgress(item);
            }
            const ids = unsyncedProgress.map(p => p.id);
            await this.localRepo.markReadingProgressSynced(ids);
        }
    }

    private async smartPull() {
        console.log('Checking for cloud updates (Smart Delta)...');

        // 1. Get Sync Metadata (Cost: 1 Read)
        const cloudMeta = await this.cloudRepo.getSyncInfo();

        // If meta doesn't exist, use 0
        const bookmarksCloudTime = cloudMeta?.bookmarks_updated_at || 0;
        const notesCloudTime = cloudMeta?.notes_updated_at || 0;
        const progressCloudTime = cloudMeta?.reading_progress_updated_at || 0;

        // 2. Delta Pull Bookmarks
        if (bookmarksCloudTime > this.lastSyncTime) {
            console.log('New bookmarks found. Fetching delta...');
            const newBookmarks = await this.cloudRepo.getBookmarksAfter(this.lastSyncTime);
            console.log(`Downloaded ${newBookmarks.length} new bookmarks.`);
            for (const item of newBookmarks) {
                await this.localRepo.saveBookmark(item, true);
            }
        } else {
            console.log('Bookmarks up to date.');
        }

        // 3. Delta Pull Notes
        if (notesCloudTime > this.lastSyncTime) {
            console.log('New notes found. Fetching delta...');
            const newNotes = await this.cloudRepo.getNotesAfter(this.lastSyncTime);
            console.log(`Downloaded ${newNotes.length} new notes.`);
            for (const item of newNotes) {
                await this.localRepo.saveNote(item, true);
            }
        } else {
            console.log('Notes up to date.');
        }

        // 4. Delta Pull Reading Progress
        if (progressCloudTime > this.lastSyncTime) {
            console.log('New reading progress found. Fetching delta...');
            const newProgress = await this.cloudRepo.getReadingProgressAfter(this.lastSyncTime);
            console.log(`Downloaded ${newProgress.length} new progress items.`);
            for (const item of newProgress) {
                await this.localRepo.saveReadingProgress(item, true); // true = isSynced
            }
        } else {
            console.log('Reading progress up to date.');
        }
    }
}
