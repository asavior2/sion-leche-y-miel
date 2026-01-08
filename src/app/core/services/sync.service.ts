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
            await this.syncBookmarks();
            await this.syncReadingProgress();
            await this.syncNotes(); // Enabled
            // await this.syncStats(); // Future
            this.lastSyncTime = Date.now();
            console.log('Sync completed successfully.');
        } catch (error) {
            console.error('Sync failed:', error);
        } finally {
            this._isSyncing.next(false);
        }
    }

    // --- BOOKMARKS SYNC ---
    private async syncBookmarks(push: boolean = true, pull: boolean = true) {
        // ... (existing logic) ...
        if (push) {
            const unsyncedLocal = await this.localRepo.getUnsyncedBookmarks();
            if (unsyncedLocal.length > 0) {
                console.log(`Pushing ${unsyncedLocal.length} bookmarks...`);
                for (const item of unsyncedLocal) {
                    await this.cloudRepo.saveBookmark(item);
                }
                const ids = unsyncedLocal.map(b => b.id);
                await this.localRepo.markBookmarksSynced(ids);
            }
        }
        if (pull) {
            const cloudItems = await this.cloudRepo.getBookmarks();
            for (const item of cloudItems) {
                await this.localRepo.saveBookmark(item, true);
            }
        }
    }

    // --- NOTES SYNC ---
    private async syncNotes(push: boolean = true, pull: boolean = true) {
        if (push) {
            const unsyncedLocal = await this.localRepo.getUnsyncedNotes();
            if (unsyncedLocal.length > 0) {
                console.log(`Pushing ${unsyncedLocal.length} notes...`);
                for (const item of unsyncedLocal) {
                    await this.cloudRepo.saveNote(item);
                }
                const ids = unsyncedLocal.map(n => n.id);
                await this.localRepo.markNotesSynced(ids);
            }
        }
        if (pull) {
            const cloudItems = await this.cloudRepo.getNotes();
            for (const item of cloudItems) {
                await this.localRepo.saveNote(item, true);
            }
        }
    }

    // --- PROGRESS SYNC ---
    private async syncReadingProgress(push: boolean = true, pull: boolean = true) {
        // 1. PUSH
        if (push) {
            const unsynced = await this.localRepo.getUnsyncedReadingProgress();
            if (unsynced.length > 0) {
                console.log(`Pushing ${unsynced.length} progress items...`);
                for (const item of unsynced) {
                    await this.cloudRepo.saveReadingProgress(item);
                }
                const ids = unsynced.map(p => p.id);
                await this.localRepo.markReadingProgressSynced(ids);
            }
        }

        // 2. PULL
        if (pull) {
            // Fetching ALL progress... (Logic pending as per previous comments)
            // Decision: Pushing is enabled. Pulling is pending "Get All" capability.
        }
    }
}
