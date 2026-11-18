// Base44 client. When the project runs inside Base44 (or with a
// VITE_BASE44_APP_ID env var), the real SDK client is used and all data,
// auth and payments flow through Base44. Without it the app falls back to
// a fully functional local demo adapter (see db.js) so the product can be
// developed and reviewed before import.
import { createClient } from '@base44/sdk';

export const BASE44_ENABLED = Boolean(import.meta.env.VITE_BASE44_APP_ID);

export const base44 = BASE44_ENABLED
  ? createClient({ appId: import.meta.env.VITE_BASE44_APP_ID })
  : null;
