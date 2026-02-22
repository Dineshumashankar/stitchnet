/**
 * Utility to dispatch and listen for chatbot notification events.
 */

const CHATBOT_NOTIFICATION_EVENT = 'stitchnet-chatbot-notification';

/**
 * Dispatches a notification to the chatbot.
 * @param {string} message - The message to display in the chatbot.
 */
export const notifyChatbot = (message) => {
    const event = new CustomEvent(CHATBOT_NOTIFICATION_EVENT, { detail: { message } });
    window.dispatchEvent(event);
};

/**
 * Hook-like function to listen for chatbot notifications.
 * @param {Function} callback - Function to call when a notification is received.
 * @returns {Function} Function to remove the listener.
 */
export const onChatbotNotification = (callback) => {
    const handler = (event) => {
        if (event.detail && event.detail.message) {
            callback(event.detail.message);
        }
    };
    window.addEventListener(CHATBOT_NOTIFICATION_EVENT, handler);
    return () => window.removeEventListener(CHATBOT_NOTIFICATION_EVENT, handler);
};
