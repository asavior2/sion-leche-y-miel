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

  setUserType(type: 'guest' | 'registered') {
    this.analytics.setUserProperties({ user_type: type })
      .then(() => console.log(`[Analytics] User Property set: user_type = ${type}`))
      .catch(err => console.error(`[Analytics] Error setting user property:`, err));
  }
}
