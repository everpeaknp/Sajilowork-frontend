export async function persistSessionCookies(access: string, refresh: string): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    await fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ access, refresh }),
      credentials: 'same-origin',
    });
  } catch (error) {
    console.error('Failed to persist session cookies', error);
  }
}

export async function clearSessionCookies(): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    await fetch('/api/auth/session', {
      method: 'DELETE',
      credentials: 'same-origin',
    });
  } catch (error) {
    console.error('Failed to clear session cookies', error);
  }
}
