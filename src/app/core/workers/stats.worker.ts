/// <reference lib="webworker" />

addEventListener('message', ({ data }) => {
    const result = calculateStats(data);
    postMessage(result);
});

function calculateStats(bookmarks: any[]): any {
    // 1. Calculate Streak
    const activityDates = new Set<string>();
    bookmarks.forEach(b => {
        // b.created_at is timestamp (number)
        const d = new Date(b.created_at || Date.now());
        d.setHours(0, 0, 0, 0);
        activityDates.add(d.toISOString());
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let streak = 0;
    let currentCheck = new Date(today);

    // Check today or yesterday to keep streak alive
    if (!activityDates.has(currentCheck.toISOString())) {
        currentCheck.setDate(currentCheck.getDate() - 1);
        if (!activityDates.has(currentCheck.toISOString())) {
            streak = 0;
            return { streak, versesMarked: bookmarks.length };
        }
    }

    while (true) {
        if (activityDates.has(currentCheck.toISOString())) {
            streak++;
            currentCheck.setDate(currentCheck.getDate() - 1);
        } else {
            break;
        }
    }

    return {
        streak,
        versesMarked: bookmarks.length
    };
}
