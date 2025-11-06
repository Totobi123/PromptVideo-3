export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) {
    console.warn("This browser does not support notifications");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
}

export function isNotificationSupported(): boolean {
  return "Notification" in window;
}

export function hasNotificationPermission(): boolean {
  return isNotificationSupported() && Notification.permission === "granted";
}

export function showNotification(title: string, options?: NotificationOptions): void {
  if (!hasNotificationPermission()) {
    console.warn("Notification permission not granted");
    return;
  }

  try {
    const notification = new Notification(title, {
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      ...options,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  } catch (error) {
    console.error("Error showing notification:", error);
  }
}

export function showVideoReadyNotification(videoUrl?: string): void {
  showNotification("Video Ready! 🎥", {
    body: "Your video has been rendered successfully. Click to view.",
    tag: "video-ready",
    requireInteraction: true,
  });
}

export function showVideoFailedNotification(error?: string): void {
  showNotification("Video Rendering Failed ❌", {
    body: error || "An error occurred while rendering your video.",
    tag: "video-failed",
  });
}
