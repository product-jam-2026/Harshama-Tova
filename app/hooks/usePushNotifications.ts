'use client';

import { useState, useEffect } from 'react';
import { saveSubscription, deleteSubscription } from '@/app/actions/push-notifications';

// Helper function to convert VAPID key to format required by PushManager
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotifications() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  // In loading: check existing subscription
  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      
      // Register our SW
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          return registration.pushManager.getSubscription();
        })
        .then(existingSubscription => {
          setSubscription(existingSubscription);
          setIsSubscribed(!!existingSubscription);
          setNotificationPermission(Notification.permission);
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }, []);

  // Function to subscribe: asks permission, subscribes, sends to server
  const subscribeToPush = async () => {
    if (!('serviceWorker' in navigator)) return false;

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // The browser will prompt the user for permission
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!)
      });

      // Convert to JSON serializable format
      const subJSON = JSON.parse(JSON.stringify(sub));
      
      // Send subscription to our server
      const result = await saveSubscription(subJSON);
      
      if (result.success) {
        setSubscription(sub);
        setIsSubscribed(true);
        setNotificationPermission('granted');
        return true;
      }
    } catch (error) {
      console.error('Failed to subscribe:', error);
      // Update permission state
      setNotificationPermission(Notification.permission); 
      return false;
    }
  };

  // Function to unsubscribe: deletes from server and browser
  const unsubscribeFromPush = async () => {
    if (!subscription) return;

    try {
      // 1. Delete from our database
      await deleteSubscription(subscription.endpoint);

      // 2. Cancel subscription with the browser
      await subscription.unsubscribe();

      setSubscription(null);
      setIsSubscribed(false);
    } catch (error) {
      console.error('Error unsubscribing', error);
    }
  };

  return {
    isSubscribed,
    notificationPermission,
    subscribeToPush,
    unsubscribeFromPush
  };
}