// Auth facade.
//
//  * In Base44: delegates to Base44's built-in user system (Google/email
//    auth configured in the Base44 dashboard). user.has_premium is a custom
//    User field kept in sync by the Base44 Stripe integration (see README).
//
//  * Locally: a clearly-labelled demo auth that stores the session in
//    localStorage so every authenticated flow can be exercised end-to-end.

import { base44, BASE44_ENABLED } from '@/api/base44Client';

const LS_USER = 'promptly_user';

export async function currentUser() {
  if (BASE44_ENABLED) {
    try {
      return await base44.auth.me();
    } catch {
      return null;
    }
  }
  try {
    const raw = localStorage.getItem(LS_USER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function login(email, _password) {
  if (BASE44_ENABLED) {
    // Base44 handles credentials on its hosted auth screen.
    base44.auth.login();
    return null;
  }
  const user = {
    id: `user-${email.toLowerCase()}`,
    email,
    full_name: email.split('@')[0],
    role: email.toLowerCase().startsWith('admin') ? 'admin' : 'user',
    has_premium: false,
  };
  localStorage.setItem(LS_USER, JSON.stringify(user));
  return user;
}

export async function signup(name, email, password) {
  if (BASE44_ENABLED) {
    base44.auth.login();
    return null;
  }
  const user = await login(email, password);
  user.full_name = name || user.full_name;
  localStorage.setItem(LS_USER, JSON.stringify(user));
  return user;
}

export async function logout() {
  if (BASE44_ENABLED) {
    await base44.auth.logout();
    return;
  }
  localStorage.removeItem(LS_USER);
}

export async function updateLocalUser(patch) {
  const user = await currentUser();
  if (!user) return null;
  const next = { ...user, ...patch };
  if (!BASE44_ENABLED) localStorage.setItem(LS_USER, JSON.stringify(next));
  return next;
}

export const IS_DEMO_AUTH = !BASE44_ENABLED;
