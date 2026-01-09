import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { BibleRepository, Bookmark, Note, ReadingProgress, UserStats } from './bible.repository';
import { AuthService } from '../services/auth.service';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirebaseBibleRepository implements BibleRepository {

  constructor(
    private afs: AngularFirestore,
    private auth: AuthService
  ) { }

  private async getUserId(): Promise<string | null> {
    const user = await this.auth.getCurrentUser();
    return user ? user.uid : null;
  }

  // --- METADATA (SMART SYNC) ---
  async getSyncInfo(): Promise<any> {
    const uid = await this.getUserId();
    if (!uid) return null;

    const doc = await firstValueFrom(
      this.afs.doc(`users/${uid}/metadata/sync_info`).valueChanges()
    );
    return doc || null;
  }

  async updateSyncInfo(type: 'bookmarks' | 'notes' | 'reading_progress', timestamp: number): Promise<void> {
    const uid = await this.getUserId();
    if (!uid) return;

    const updateData: any = {};
    updateData[`${type}_updated_at`] = timestamp;

    // Use set with merge to ensure document creation if it doesn't exist
    await this.afs.doc(`users/${uid}/metadata/sync_info`).set(updateData, { merge: true });
  }

  // --- BOOKMARKS ---
  async getBookmarks(): Promise<Bookmark[]> {
    const uid = await this.getUserId();
    if (!uid) return [];

    const snapshot = await firstValueFrom(
      this.afs.collection<Bookmark>(`users/${uid}/bookmarks`).valueChanges()
    );
    return snapshot || [];
  }

  async getBookmarksAfter(timestamp: number): Promise<Bookmark[]> {
    const uid = await this.getUserId();
    if (!uid) return [];

    const snapshot = await firstValueFrom(
      this.afs.collection<Bookmark>(`users/${uid}/bookmarks`, ref =>
        ref.where('updated_at', '>', timestamp)
      ).valueChanges()
    );
    return snapshot || [];
  }

  async saveBookmark(bookmark: Bookmark): Promise<void> {
    const uid = await this.getUserId();
    if (!uid) return;

    const batch = this.afs.firestore.batch();
    const bookmarkRef = this.afs.doc(`users/${uid}/bookmarks/${bookmark.id}`).ref;
    const metadataRef = this.afs.doc(`users/${uid}/metadata/sync_info`).ref;

    // Add bookmark write
    batch.set(bookmarkRef, bookmark, { merge: true });

    // Add metadata update
    batch.set(metadataRef, { bookmarks_updated_at: Date.now() }, { merge: true });

    await batch.commit();
  }

  async deleteBookmark(id: string): Promise<void> {
    const uid = await this.getUserId();
    if (!uid) return;

    const batch = this.afs.firestore.batch();
    const bookmarkRef = this.afs.doc(`users/${uid}/bookmarks/${id}`).ref;
    const metadataRef = this.afs.doc(`users/${uid}/metadata/sync_info`).ref;

    batch.delete(bookmarkRef);
    batch.set(metadataRef, { bookmarks_updated_at: Date.now() }, { merge: true });

    await batch.commit();
  }

  async getBookmark(bookId: number, chapter: number, verse: number): Promise<Bookmark | undefined> {
    const uid = await this.getUserId();
    if (!uid) return undefined;

    const snapshot = await firstValueFrom(
      this.afs.collection<Bookmark>(`users/${uid}/bookmarks`, ref =>
        ref.where('book_id', '==', bookId)
          .where('chapter', '==', chapter)
          .where('verse', '==', verse)
          .limit(1)
      ).valueChanges()
    );
    return snapshot.length > 0 ? snapshot[0] : undefined;
  }

  async deleteBookmarkByRef(bookId: number, chapter: number, verse: number): Promise<void> {
    const bookmark = await this.getBookmark(bookId, chapter, verse);
    if (bookmark) {
      await this.deleteBookmark(bookmark.id);
    }
  }

  // --- NOTES ---
  async getNotes(): Promise<Note[]> {
    const uid = await this.getUserId();
    if (!uid) return [];

    const snapshot = await firstValueFrom(
      this.afs.collection<Note>(`users/${uid}/notes`).valueChanges()
    );
    return snapshot || [];
  }

  async getNotesAfter(timestamp: number): Promise<Note[]> {
    const uid = await this.getUserId();
    if (!uid) return [];

    const snapshot = await firstValueFrom(
      this.afs.collection<Note>(`users/${uid}/notes`, ref =>
        ref.where('updated_at', '>', timestamp)
      ).valueChanges()
    );
    return snapshot || [];
  }

  async saveNote(note: Note): Promise<void> {
    const uid = await this.getUserId();
    if (!uid) return;

    const batch = this.afs.firestore.batch();
    const noteRef = this.afs.doc(`users/${uid}/notes/${note.id}`).ref;
    const metadataRef = this.afs.doc(`users/${uid}/metadata/sync_info`).ref;

    batch.set(noteRef, note, { merge: true });
    batch.set(metadataRef, { notes_updated_at: Date.now() }, { merge: true });

    await batch.commit();
  }

  async deleteNote(id: string): Promise<void> {
    const uid = await this.getUserId();
    if (!uid) return;

    const batch = this.afs.firestore.batch();
    const noteRef = this.afs.doc(`users/${uid}/notes/${id}`).ref;
    const metadataRef = this.afs.doc(`users/${uid}/metadata/sync_info`).ref;

    batch.delete(noteRef);
    batch.set(metadataRef, { notes_updated_at: Date.now() }, { merge: true });

    await batch.commit();
  }

  // --- READING PROGRESS ---
  async getReadingProgress(planId: string): Promise<ReadingProgress[]> {
    const uid = await this.getUserId();
    if (!uid) return [];

    const snapshot = await firstValueFrom(
      this.afs.collection<ReadingProgress>(`users/${uid}/reading_progress`, ref =>
        ref.where('plan_id', '==', planId)
      ).valueChanges()
    );
    return snapshot || [];
  }

  async getReadingProgressAfter(timestamp: number): Promise<ReadingProgress[]> {
    const uid = await this.getUserId();
    if (!uid) return [];

    const snapshot = await firstValueFrom(
      // We query by 'updated_at' which we inject during save.
      this.afs.collection<ReadingProgress>(`users/${uid}/reading_progress`, ref =>
        ref.where('updated_at', '>', timestamp)
      ).valueChanges()
    );
    return snapshot || [];
  }

  async saveReadingProgress(progress: ReadingProgress): Promise<void> {
    const uid = await this.getUserId();
    if (!uid) return;

    const batch = this.afs.firestore.batch();
    const progressRef = this.afs.doc(`users/${uid}/reading_progress/${progress.id}`).ref;
    const metadataRef = this.afs.doc(`users/${uid}/metadata/sync_info`).ref;

    // Inject 'updated_at' into the document for reliable Delta Sync
    const docData = { ...progress, updated_at: Date.now() };

    batch.set(progressRef, docData, { merge: true });
    batch.set(metadataRef, { reading_progress_updated_at: Date.now() }, { merge: true });

    await batch.commit();
  }

  // --- USER STATS ---
  async getStats(): Promise<UserStats[]> {
    const uid = await this.getUserId();
    if (!uid) return [];

    const snapshot = await firstValueFrom(
      this.afs.collection<UserStats>(`users/${uid}/stats`).valueChanges()
    );
    return snapshot || [];
  }

  async saveStat(stat: UserStats): Promise<void> {
    const uid = await this.getUserId();
    if (!uid) return;
    await this.afs.doc(`users/${uid}/stats/${stat.id}`).set(stat, { merge: true });
  }
}
