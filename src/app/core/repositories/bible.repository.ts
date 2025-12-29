export interface Bookmark {
    id: string; // UUID
    book_id: number;
    chapter: number;
    verse: number;
    color: string;
    created_at: number;
    updated_at: number;
    deleted_at?: number;
    is_synced: number; // 0 (false) or 1 (true)
}

export interface Note {
    id: string; // UUID
    book_id: number;
    chapter: number;
    verse: number;
    content: string;
    created_at: number;
    updated_at: number;
    deleted_at?: number;
    is_synced: number;
}

export interface ReadingProgress {
    id: string;
    plan_id: string;
    day_id: number;
    status: number; // 0 pending, 1 completed
    completed_at: number;
    is_synced: number;
}

export interface UserStats {
    id: string;
    metric_key: string;
    value: number;
    updated_at: number;
    is_synced: number;
}

export interface BibleRepository {
    // Bookmarks
    getBookmarks(): Promise<Bookmark[]>;
    getBookmark(bookId: number, chapter: number, verse: number): Promise<Bookmark | undefined>;
    saveBookmark(bookmark: Bookmark): Promise<void>;
    deleteBookmark(id: string): Promise<void>; // Soft delete

    // Notes
    getNotes(): Promise<Note[]>;
    saveNote(note: Note): Promise<void>;
    deleteNote(id: string): Promise<void>;

    // Progress
    getReadingProgress(planId: string): Promise<ReadingProgress[]>;
    saveReadingProgress(progress: ReadingProgress): Promise<void>;

    // Stats
    getStats(): Promise<UserStats[]>;
    saveStat(stat: UserStats): Promise<void>;
}
