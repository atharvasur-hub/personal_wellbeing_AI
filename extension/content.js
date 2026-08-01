// content.js - DOM Interceptor Overlay & Telemetry Tracker for Aspiration Engine

(function () {
  'use strict';

  // Prevent multiple injections
  if (document.getElementById('aspiration-engine-overlay')) return;

  let focusStartTime = null;

  // Create overlay container
  const overlay = document.createElement('div');
  overlay.id = 'aspiration-engine-overlay';

  // Apply dark slate inline CSS
  overlay.style.cssText = `
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    background-color: #0f172a !important;
    color: #f8fafc !important;
    z-index: 2147483647 !important;
    display: flex !important;
    flex-direction: column !important;
    justify-content: center !important;
    align-items: center !important;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
    text-align: center !important;
    padding: 20px !important;
    box-sizing: border-box !important;
    margin: 0 !important;
  `;

  // Inner card structure
  overlay.innerHTML = `
    <div style="
      background-color: #1e293b;
      border: 1px solid #334155;
      border-radius: 16px;
      padding: 40px 48px;
      max-width: 520px;
      width: 90%;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      animation: ae-fade-in 0.3s ease-out;
    ">
      <div style="
        display: inline-block;
        background: rgba(99, 102, 241, 0.15);
        color: #818cf8;
        padding: 6px 16px;
        border-radius: 20px;
        font-size: 13px;
        font-weight: 600;
        letter-spacing: 0.5px;
        text-transform: uppercase;
        margin-bottom: 20px;
      ">
        Aspiration Engine Interceptor
      </div>
      <h1 style="
        margin: 0 0 16px 0;
        font-size: 28px;
        font-weight: 700;
        color: #f8fafc;
        line-height: 1.3;
      ">
        Are you here to research or relax?
      </h1>
      <p style="
        margin: 0 0 32px 0;
        font-size: 15px;
        color: #94a3b8;
        line-height: 1.5;
      ">
        Choose your intention before proceeding. Choosing research will unlock this tab and schedule a 45-minute deep work session on your calendar.
      </p>
      <div style="
        display: flex;
        gap: 16px;
        justify-content: center;
      ">
        <button id="ae-btn-relax" style="
          flex: 1;
          padding: 14px 24px;
          border-radius: 10px;
          border: 1px solid #475569;
          background-color: #334155;
          color: #f1f5f9;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        ">
          Relax
        </button>
        <button id="ae-btn-research" style="
          flex: 1;
          padding: 14px 24px;
          border-radius: 10px;
          border: none;
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          color: #ffffff;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.35);
          transition: all 0.2s ease;
        ">
          Research
        </button>
      </div>
    </div>
  `;

  // Insert style tag for animations and hover effects
  const styleTag = document.createElement('style');
  styleTag.textContent = `
    @keyframes ae-fade-in {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
    #ae-btn-relax:hover {
      background-color: #475569 !important;
      border-color: #64748b !important;
    }
    #ae-btn-research:hover {
      opacity: 0.95 !important;
      transform: translateY(-1px) !important;
      box-shadow: 0 6px 16px rgba(99, 102, 241, 0.45) !important;
    }
  `;

  // Attach overlay to document immediately
  function inject() {
    const parent = document.documentElement || document.body;
    if (parent) {
      parent.appendChild(styleTag);
      parent.appendChild(overlay);
      setupListeners();
    } else {
      window.addEventListener('DOMContentLoaded', inject);
    }
  }

  function setupListeners() {
    const relaxBtn = document.getElementById('ae-btn-relax');
    const researchBtn = document.getElementById('ae-btn-research');

    if (relaxBtn) {
      relaxBtn.addEventListener('click', () => {
        // Redirect to an invalid URL to exit / close the tab
        window.location.href = 'https://invalid.url';
      });
    }

    if (researchBtn) {
      researchBtn.addEventListener('click', () => {
        // Record start time when DOM is unblocked for intentional research
        focusStartTime = Date.now();

        // Unblock DOM
        if (overlay.parentNode) {
          overlay.parentNode.removeChild(overlay);
        }
        if (styleTag.parentNode) {
          styleTag.parentNode.removeChild(styleTag);
        }

        // Save state in local storage
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          chrome.storage.local.set({
            deepWorkSession: true,
            site: window.location.hostname,
            focusStartTime: focusStartTime
          }, () => {
            console.log('[Aspiration Engine] Intent saved to local storage.');
          });
        }

        // Send message to background.js to schedule deep work session
        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
          chrome.runtime.sendMessage({ action: 'SCHEDULE_DEEP_WORK' }, (response) => {
            if (chrome.runtime.lastError) {
              console.warn('[Aspiration Engine] Message error:', chrome.runtime.lastError.message);
            } else {
              console.log('[Aspiration Engine] Schedule response:', response);
            }
          });
        }

        // Register unload telemetry listener to calculate focus time saved
        setupTelemetryUnloadListener();
      });
    }
  }

  function sendTelemetry() {
    if (!focusStartTime) return;
    const durationSeconds = Math.max(1, Math.round((Date.now() - focusStartTime) / 1000));
    const domain = window.location.hostname || 'reddit.com';

    focusStartTime = null; // Ensure sent only once

    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({
        action: 'LOG_SESSION',
        domain: domain,
        time_saved_seconds: durationSeconds,
        action_type: 'intentional_focus'
      });
    }
  }

  function setupTelemetryUnloadListener() {
    window.addEventListener('beforeunload', sendTelemetry);
    window.addEventListener('pagehide', sendTelemetry);
  }

  inject();
})();
