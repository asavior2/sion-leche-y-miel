/// <reference lib="webworker" />

addEventListener('message', ({ data }) => {
    const result = calculateStats(data);
    postMessage(result);
});

function calculateStats(data: { bookmarks: any[], notes: any[], activityLogs: any[], chapterViews: any[], bookMetadata: any[] }): any {
    const { bookmarks, notes, activityLogs, chapterViews, bookMetadata } = data;

    // 1. Calculate Streak (Activity Logs)
    const activityDates = new Set<string>();
    activityLogs.forEach(log => {
        if (log.date && typeof log.date === 'string') {
            activityDates.add(log.date);
        } else {
            const d = new Date(log.timestamp || Date.now());
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            activityDates.add(`${year}-${month}-${day}`);
        }
    });

    const toKey = (d: Date) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const today = new Date();
    let streak = 0;
    let currentCheck = new Date(today);

    if (!activityDates.has(toKey(today))) {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        if (!activityDates.has(toKey(yesterday))) {
            streak = 0;
        } else {
            currentCheck = yesterday;
            streak = 0; // Will start counting in loop
        }
    }

    if (activityDates.has(toKey(currentCheck)) || (streak === 0 && activityDates.size > 0)) {
        // Re-verify streak logic
        let tempCheck = new Date(today);
        if (!activityDates.has(toKey(tempCheck))) {
            tempCheck.setDate(tempCheck.getDate() - 1);
        }

        if (activityDates.has(toKey(tempCheck))) {
            let s = 0;
            while (true) {
                if (activityDates.has(toKey(tempCheck))) {
                    s++;
                    tempCheck.setDate(tempCheck.getDate() - 1);
                } else {
                    break;
                }
            }
            streak = s;
        }
    }

    // 2. Time Patterns
    let earlyBird = false;
    let nightOwl = false;

    // Check chapterViews for timestamps (more granular)
    if (chapterViews && chapterViews.length > 0) {
        chapterViews.forEach(v => {
            const d = new Date(v.timestamp);
            const h = d.getHours();
            if (h < 7) earlyBird = true;
            if (h >= 22) nightOwl = true;
        });
    }

    // 3. Book Completion Logic
    const viewedChapters = new Map<number, Set<number>>();
    if (chapterViews) {
        chapterViews.forEach(v => {
            if (!viewedChapters.has(v.book_id)) {
                viewedChapters.set(v.book_id, new Set());
            }
            viewedChapters.get(v.book_id).add(v.chapter);
        });
    }

    const isBookComplete = (bookId: number) => {
        const meta = bookMetadata.find(m => m.id == bookId);
        if (!meta) return false;
        const total = parseInt(meta.capitulos);
        const viewed = viewedChapters.get(bookId);
        if (!viewed) return false;
        return viewed.size >= total;
    };

    const checkSet = (ids: number[]) => ids.every(id => isBookComplete(id));

    // Define Sets
    const toraIds = [1, 2, 3, 4, 5];
    const profetasIds = [6, 7, 9, 10, 11, 12, 23, 24, 26]; // Josh, Judg, Sam, Kings, Isa, Jer, Eze
    const profetasMenoresIds = [28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39]; // Hos to Mal
    const escritosIds = [19, 20, 18, 22, 8, 25, 21, 17, 27, 15, 16, 13, 14]; // Psa, Prov, Job, Song, Ruth, Lam, Ecc, Est, Dan, Ezr, Neh, Chr
    const ntIds = Array.from({ length: 27 }, (_, i) => i + 40); // 40-66

    return {
        streak,
        versesMarked: bookmarks ? bookmarks.length : 0,
        notesCount: notes ? notes.length : 0,
        earlyBird,
        nightOwl,
        cat_tora: checkSet(toraIds),
        cat_profetas: checkSet(profetasIds),
        cat_menores: checkSet(profetasMenoresIds),
        cat_escritos: checkSet(escritosIds),
        cat_nt: checkSet(ntIds)
    };
}
