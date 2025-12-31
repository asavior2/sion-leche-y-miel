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

  // --- BOOKMARKS ---
  async getBookmarks(): Promise<Bookmark[]> {
    const uid = await this.getUserId();
    if (!uid) return [];

    // Firestore returns QuerySnapshot. We map it to our interface.
    // Need to convert Timestamp to number (milliseconds) if we stick to our Schema
    // Our SQLite schema uses INTEGER (Date.now()). Firestore uses serverTimestamp typically.
    // For simplicity in Sync Phase, we will store as Numbers here too or handle conversion.
    // Let's store as Numbers for 1:1 compatibility with SQLite for now.
    const snapshot = await firstValueFrom(
      this.afs.collection<Bookmark>(`users/${uid}/bookmarks`).valueChanges()
    );
    return snapshot || [];
  }

  async saveBookmark(bookmark: Bookmark): Promise<void> {
    const uid = await this.getUserId();
    if (!uid) return;

    // Use set({ ... }, { merge: true }) for upsert behavior
    await this.afs.doc(`users/${uid}/bookmarks/${bookmark.id}`).set(bookmark, { merge: true });
  }

  async deleteBookmark(id: string): Promise<void> {
    const uid = await this.getUserId();
    if (!uid) return;
    await this.afs.doc(`users/${uid}/bookmarks/${id}`).delete();
  }

  async getBookmark(bookId: number, chapter: number, verse: number): Promise<Bookmark | undefined> {
    // This query is inefficient in Firestore without an index if we query by properties.
    // But typically we look up by ID.
    // SQLite can do `WHERE bookId=...`. Firestore needs a composite query.
    // For now, let's skip complex querying if not strictly needed or handle essentially.
    // Actually, `BibliaService` uses `getBookmark` to check existence.
    // We can query with where clauses.
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

  async saveNote(note: Note): Promise<void> {
    const uid = await this.getUserId();
    if (!uid) return;

    await this.afs.doc(`users/${uid}/notes/${note.id}`).set(note, { merge: true });
  }

  async deleteNote(id: string): Promise<void> {
    const uid = await this.getUserId();
    if (!uid) return;
    await this.afs.doc(`users/${uid}/notes/${id}`).delete();
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

  async saveReadingProgress(progress: ReadingProgress): Promise<void> {
    const uid = await this.getUserId();
    if (!uid) return;
    await this.afs.doc(`users/${uid}/reading_progress/${progress.id}`).set(progress, { merge: true });
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
