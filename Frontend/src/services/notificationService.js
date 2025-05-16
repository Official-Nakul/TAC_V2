/**
 * Notification Service
 * Handles communication between frontend and backend for notifications
 */

const API_URL = "http://localhost:5000/api/notifications";

/**
 * Fetch all notifications from the backend
 * @returns {Promise<Array>} Array of notification objects
 */
export const fetchNotifications = async () => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`Error fetching notifications: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    throw error;
  }
};

/**
 * Save a notification to the backend
 * @param {Object} notification - The notification object to save
 * @returns {Promise<Object>} The saved notification with ID
 */
export const saveNotification = async (notification) => {
  try {
    // Transform frontend notification format to backend format
    const backendNotification = {
      title: notification.title,
      message: notification.description,
      type: mapNotificationType(notification.type),
      recipient: "user", // Default recipient - can be updated based on user authentication
    };

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(backendNotification),
    });

    if (!response.ok) {
      throw new Error(`Error saving notification: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to save notification:", error);
    throw error;
  }
};

/**
 * Mark a notification as read
 * @param {string} id - The ID of the notification to mark as read
 * @returns {Promise<Object>} The updated notification
 */
export const markNotificationAsRead = async (id) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error marking notification as read: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to mark notification as read:", error);
    throw error;
  }
};

/**
 * Map frontend notification types to backend types
 * @param {string} frontendType - The frontend notification type
 * @returns {string} The corresponding backend notification type
 */
const mapNotificationType = (frontendType) => {
  const typeMap = {
    message: "info",
    system: "info",
    task: "info",
    reminder: "info",
    weather: "info",
    "weather-alert": "warning",
  };

  return typeMap[frontendType] || "info";
};
