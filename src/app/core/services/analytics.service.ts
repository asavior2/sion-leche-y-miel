import { Injectable } from '@angular/core';
import { AngularFireAnalytics } from '@angular/fire/compat/analytics';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {

  constructor(private analytics: AngularFireAnalytics) { }

  logEvent(eventName: string, params?: { [key: string]: any }) {
    this.analytics.logEvent(eventName, params)
      .then(() => console.log(`[Analytics] Event logged: ${eventName}`, params))
      .catch(err => console.error(`[Analytics] Error logging event: ${eventName}`, err));
  }

  // Preset Events
  logScreenView(screenName: string) {
    this.logEvent('screen_view', { firebase_screen: screenName });
  }

  logReading(book: string, chapter: number) {
    this.logEvent('select_content', {
      content_type: 'bible_chapter',
      item_id: `${book}_${chapter}`
    });
  }

  logBookmark(bookId: number, chapter: number, verse: number) {
    this.logEvent('earn_virtual_currency', {
      virtual_currency_name: 'bookmark',
      value: 1,
      source: `${bookId}:${chapter}:${verse}`
    });
  }
}
