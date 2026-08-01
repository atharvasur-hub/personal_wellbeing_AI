// background.js - Service Worker for Aspiration Engine Chrome Extension

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // 1. Handle Deep Work Scheduling
  if (request.action === 'SCHEDULE_DEEP_WORK' || request.action === 'TRIGGER_DEEP_WORK') {
    console.log('[Aspiration Engine] Received request to schedule deep work session...');

    fetch('http://localhost:3000/schedule-deep-work', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        source: 'chrome-extension',
        url: sender.tab ? sender.tab.url : null,
        timestamp: new Date().toISOString()
      })
    })
      .then(async (response) => {
        const data = await response.json();
        if (response.ok) {
          console.log('[Aspiration Engine] Deep work event created successfully:', data);
          sendResponse({ success: true, data });
        } else {
          console.error('[Aspiration Engine] Express API returned an error:', data);
          sendResponse({ success: false, error: data.error || 'Failed to schedule deep work' });
        }
      })
      .catch((error) => {
        console.error('[Aspiration Engine] Error connecting to Express API bridge:', error);
        sendResponse({ success: false, error: error.message });
      });

    return true;
  }

  // 2. Handle Session Telemetry Logging
  if (request.action === 'LOG_SESSION') {
    const domain = request.domain || (sender.tab && sender.tab.url ? new URL(sender.tab.url).hostname : 'reddit.com');
    const timeSavedSeconds = request.time_saved_seconds || 0;
    const actionType = request.action_type || 'intentional_focus';

    console.log(`[Aspiration Engine] Logging telemetry session for ${domain}: ${timeSavedSeconds}s`);

    fetch('http://localhost:3000/log-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        domain: domain,
        time_saved_seconds: timeSavedSeconds,
        action: actionType
      })
    })
      .then(async (response) => {
        const data = await response.json();
        if (response.ok) {
          console.log('[Aspiration Engine] Telemetry logged successfully:', data);
          sendResponse({ success: true, data });
        } else {
          console.error('[Aspiration Engine] Failed to log telemetry:', data);
          sendResponse({ success: false, error: data.error });
        }
      })
      .catch((error) => {
        console.error('[Aspiration Engine] Error posting telemetry to Express server:', error);
        sendResponse({ success: false, error: error.message });
      });

    return true;
  }
});
