/**
 * Real-time synchronization manager across browser tabs and components.
 * Utilizes HTML5 BroadcastChannel with local window CustomEvents fallback.
 */

const CHANNEL_NAME = 'mini_instagram_realtime_sync';

let channel = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    channel = new BroadcastChannel(CHANNEL_NAME);
  }
} catch (e) {
  console.warn('BroadcastChannel initialization skipped:', e);
}

/**
 * Broadcast an application event across tabs and to local components
 * @param {string} type - Event type (e.g., 'FOLLOW_REQUEST_SENT', 'FOLLOW_REQUEST_RESOLVED', 'FOLLOW_STATUS_CHANGED')
 * @param {object} payload - Optional event metadata
 */
export const broadcastSync = (type, payload = {}) => {
  const eventData = { type, payload, timestamp: Date.now() };

  // 1. Cross-tab communication
  if (channel) {
    try {
      channel.postMessage(eventData);
    } catch (e) {
      console.warn('Failed to post to BroadcastChannel:', e);
    }
  }

  // 2. Same-tab CustomEvents
  if (typeof window !== 'undefined') {
    if (type === 'FOLLOW_REQUEST_SENT' || type === 'FOLLOW_REQUEST_RESOLVED') {
      window.dispatchEvent(new CustomEvent('follow-requests-updated', { detail: eventData }));
    } else if (type === 'FOLLOW_STATUS_CHANGED') {
      window.dispatchEvent(new CustomEvent('follow-status-changed', { detail: eventData }));
    } else if (type === 'PROFILE_UPDATED') {
      window.dispatchEvent(new CustomEvent('profile-updated', { detail: eventData }));
    }

    window.dispatchEvent(new CustomEvent('app-sync', { detail: eventData }));
  }
};

/**
 * Subscribe to sync events from other tabs or components
 * @param {function} callback
 * @returns {function} unsubscribe function
 */
export const subscribeToSync = (callback) => {
  if (typeof window === 'undefined') return () => {};

  const handleChannelMessage = (e) => {
    callback(e.data);
  };

  const handleCustomEvent = (e) => {
    callback(e.detail);
  };

  if (channel) {
    channel.addEventListener('message', handleChannelMessage);
  }
  window.addEventListener('app-sync', handleCustomEvent);

  return () => {
    if (channel) {
      channel.removeEventListener('message', handleChannelMessage);
    }
    window.removeEventListener('app-sync', handleCustomEvent);
  };
};
