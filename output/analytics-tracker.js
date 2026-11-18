// Wealth Lab Analytics — Privacy-friendly, self-hosted tracking
// Add this script to your micro-tool HTML files before the closing </body> tag

(function() {
  'use strict';

  const trackEvent = function(eventType, eventData) {
    const data = {
      type: eventType,
      page: window.location.pathname,
      referrer: document.referrer || 'direct',
      timestamp: new Date().toISOString(),
      ...eventData
    };

    // Store in localStorage for privacy (no external requests)
    try {
      const existing = JSON.parse(localStorage.getItem('wl_events') || '[]');
      existing.push(data);
      // Keep only last 500 events
      if (existing.length > 500) existing.splice(0, existing.length - 500);
      localStorage.setItem('wl_events', JSON.stringify(existing));
    } catch (e) {
      // LocalStorage not available, silently ignore
    }

    // Log to console for debugging
    if (window.location.hostname === 'localhost') {
      console.log('[Wealth Lab Analytics]', data);
    }
  };

  // Track page view on load
  window.addEventListener('DOMContentLoaded', function() {
    trackEvent('page_view');
  });

  // Track button clicks
  document.addEventListener('click', function(e) {
    const btn = e.target.closest('button, a');
    if (btn) {
      trackEvent('click', {
        element: btn.tagName.toLowerCase(),
        text: btn.innerText.trim().substring(0, 50),
        href: btn.getAttribute('href') || null,
        id: btn.id || null,
      });
    }
  });

  // Expose for manual tracking
  window.wlAnalytics = { track: trackEvent };
})();

// Usage example:
// window.wlAnalytics.track('affiliate_click', { destination: 'systeme.io' });
// window.wlAnalytics.track('tool_use', { tool: 'side-hustle-calculator' });
