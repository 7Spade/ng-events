/**
 * Google Analytics Adapter
 *
 * 🌐 Frontend analytics tracking
 *
 * ✅ Uses @angular/fire or gtag
 */

export class GoogleAnalyticsAdapter {
  // TODO: Implement GA tracking
  trackEvent(category: string, action: string, label?: string): void {
    console.log('GoogleAnalyticsAdapter.trackEvent:', category, action, label);
  }

  trackPageView(path: string): void {
    console.log('GoogleAnalyticsAdapter.trackPageView:', path);
  }
}

// END OF FILE
