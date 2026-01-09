import { TestBed } from '@angular/core/testing';
import { SyncService } from './sync.service';
import { AuthService } from './auth.service';
import { LocalBibleRepository } from '../repositories/local-bible.repository';
import { FirebaseBibleRepository } from '../repositories/firebase-bible.repository';
import { of, BehaviorSubject } from 'rxjs';

/**
 * Unit Test to prove "Smart Delta" Logic
 * Run with: npm test
 */
describe('SyncService (Smart Delta Logic)', () => {
    let service: SyncService;
    let authSpy: jasmine.SpyObj<AuthService>;
    let localRepoSpy: jasmine.SpyObj<LocalBibleRepository>;
    let cloudRepoSpy: jasmine.SpyObj<FirebaseBibleRepository>;

    beforeEach(() => {
        // 1. Create Mocks
        const authMock = jasmine.createSpyObj('AuthService', [], {
            user$: of({ uid: 'test-user' })
        });

        // Mock Local Repo (Always empty for this test)
        const localMock = jasmine.createSpyObj('LocalBibleRepository', [
            'getUnsyncedBookmarks', 'getUnsyncedNotes', 'getUnsyncedReadingProgress',
            'markBookmarksSynced', 'markNotesSynced', 'markReadingProgressSynced',
            'saveBookmark', 'saveNote', 'saveReadingProgress'
        ]);
        localMock.getUnsyncedBookmarks.and.returnValue(Promise.resolve([]));
        localMock.getUnsyncedNotes.and.returnValue(Promise.resolve([]));
        localMock.getUnsyncedReadingProgress.and.returnValue(Promise.resolve([]));

        // Mock Cloud Repo (The core verification target)
        const cloudMock = jasmine.createSpyObj('FirebaseBibleRepository', [
            'getSyncInfo', 'getBookmarksAfter', 'getNotesAfter', 'getReadingProgressAfter'
        ]);

        TestBed.configureTestingModule({
            providers: [
                SyncService,
                { provide: AuthService, useValue: authMock },
                { provide: LocalBibleRepository, useValue: localMock },
                { provide: FirebaseBibleRepository, useValue: cloudMock }
            ]
        });

        service = TestBed.inject(SyncService);
        authSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
        localRepoSpy = TestBed.inject(LocalBibleRepository) as jasmine.SpyObj<LocalBibleRepository>;
        cloudRepoSpy = TestBed.inject(FirebaseBibleRepository) as jasmine.SpyObj<FirebaseBibleRepository>;
    });

    it('SCENARIO 1: Should NOT download anything if timestamps are old (Green Light)', async () => {
        // Setup: Cloud metadata is OLDER than local (simulated 0 vs 100)
        // Actually in the code we compare cloud > local.
        // Let's say local lastSync was 2000. Cloud says updated at 1000.
        // Result: Should NOT call getBookmarksAfter.

        // NOTE: In the real service, 'lastSyncTime' starts at 0. 
        // To test the "Skipping" logic, we need to simulate a second run.

        // Mock Metadata response
        cloudRepoSpy.getSyncInfo.and.returnValue(Promise.resolve({
            bookmarks_updated_at: 1000,
            notes_updated_at: 1000,
            reading_progress_updated_at: 1000
        }));

        // Perform Sync
        await service.syncAll(true); // First run (lastSync=0). 1000 > 0. It WILL download.

        // Reset spy counts
        cloudRepoSpy.getBookmarksAfter.calls.reset();

        // Perform Second Sync. Now lastSync should be > 1000 (set to Date.now() in previous call)
        await service.syncAll();

        // ASSERTION: Since we just synced, lastSync > cloudTime.
        // getBookmarksAfter should NOT have been called.
        expect(cloudRepoSpy.getBookmarksAfter).not.toHaveBeenCalled();
        console.log('✅ Proof: No bookmarks downloaded on second sync.');
    });

    it('SCENARIO 2: Should ONLY download changed items (Red Light)', async () => {
        // Setup: Cloud updated RECENTLY (Future)
        cloudRepoSpy.getSyncInfo.and.returnValue(Promise.resolve({
            bookmarks_updated_at: 9999999999999, // Way in the future
            notes_updated_at: 0,
            reading_progress_updated_at: 0
        }));

        cloudRepoSpy.getBookmarksAfter.and.returnValue(Promise.resolve([])); // Return empty just for flow

        await service.syncAll();

        // ASSERTION: Bookmarks changed, implies download
        expect(cloudRepoSpy.getBookmarksAfter).toHaveBeenCalled();

        // Notes didn't change, implies NO download
        expect(cloudRepoSpy.getNotesAfter).not.toHaveBeenCalled();

        console.log('✅ Proof: Only Bookmarks downloaded (Notes skipped).');
    });
});
