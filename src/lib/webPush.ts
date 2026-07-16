/**
 * Web Push helpers — service worker registration + PushManager subscribe.
 */

import { notificationService } from '@/services/notification.service';

const SW_PATH = '/sw.js';

export function isWebPushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

export function isNotificationsFeatureEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS !== 'false';
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function registerNotificationServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!isWebPushSupported() || !isNotificationsFeatureEnabled()) {
    return null;
  }
  try {
    return await navigator.serviceWorker.register(SW_PATH, { scope: '/' });
  } catch (error) {
    console.warn('Service worker registration failed:', error);
    return null;
  }
}

function subscriptionToJson(subscription: PushSubscription): string {
  return JSON.stringify(subscription.toJSON());
}

export async function getCurrentPushSubscription(): Promise<PushSubscription | null> {
  if (!isWebPushSupported()) return null;
  const reg = await navigator.serviceWorker.ready;
  return reg.pushManager.getSubscription();
}

export async function subscribeWebPush(): Promise<{ ok: boolean; reason?: string }> {
  if (!isWebPushSupported()) {
    return { ok: false, reason: 'Web Push is not supported in this browser.' };
  }
  if (!isNotificationsFeatureEnabled()) {
    return { ok: false, reason: 'Notifications are disabled.' };
  }

  const permission =
    Notification.permission === 'granted'
      ? 'granted'
      : await Notification.requestPermission();

  if (permission !== 'granted') {
    return { ok: false, reason: 'Notification permission was denied.' };
  }

  const vapidRes = await notificationService.getVapidPublicKey();
  if (!vapidRes.success || !vapidRes.data?.public_key) {
    return {
      ok: false,
      reason: vapidRes.message || 'Web push is not configured on the server.',
    };
  }

  await registerNotificationServiceWorker();
  const registration = await navigator.serviceWorker.ready;
  let subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        vapidRes.data.public_key,
      ) as BufferSource,
    });
  }

  const token = subscriptionToJson(subscription);
  const save = await notificationService.registerDeviceToken({
    token,
    platform: 'web',
    device_name: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 120) : 'web',
  });

  if (!save.success) {
    return { ok: false, reason: save.message || 'Could not save push subscription.' };
  }

  return { ok: true };
}

export async function unsubscribeWebPush(): Promise<void> {
  if (!isWebPushSupported()) return;

  try {
    const subscription = await getCurrentPushSubscription();
    if (subscription) {
      const token = subscriptionToJson(subscription);
      try {
        await notificationService.unsubscribeDeviceToken(token);
      } catch {
        // Best-effort server cleanup
      }
      await subscription.unsubscribe();
    }
  } catch (error) {
    console.warn('Web push unsubscribe failed:', error);
  }

  try {
    await notificationService.deactivateAllDeviceTokens();
  } catch {
    // ignore
  }
}

/**
 * Re-register an existing granted subscription after login (no permission prompt).
 */
export async function syncWebPushSubscription(): Promise<void> {
  if (!isWebPushSupported() || !isNotificationsFeatureEnabled()) return;
  if (Notification.permission !== 'granted') return;

  try {
    await registerNotificationServiceWorker();
    const registration = await navigator.serviceWorker.ready;
    const existing = await registration.pushManager.getSubscription();
    if (!existing) return;

    await notificationService.registerDeviceToken({
      token: subscriptionToJson(existing),
      platform: 'web',
      device_name: navigator.userAgent.slice(0, 120),
    });
  } catch (error) {
    console.warn('Web push sync failed:', error);
  }
}
