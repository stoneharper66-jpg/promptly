// Premium access rules, in ONE place.
//
// The real enforcement for premium prompt text is server-side: premium
// bodies live in the PromptContent entity, whose Base44 RLS only lets
// active members (User.has_premium) or admins read rows. The frontend
// can therefore ask for the text and simply not receive it without a
// valid membership — manipulating client code reveals nothing.

import { db } from '@/api/db';

export function canReadPremium(user) {
  return Boolean(user && (user.has_premium || user.role === 'admin'));
}

// Returns the full prompt text the current user is allowed to see, or
// null when it is paywalled for them.
export async function getFullPrompt(prompt, user) {
  if (!prompt.premium) return prompt.full_prompt || null;
  if (!canReadPremium(user)) return null;
  const rows = await db.PromptContent.filter({ prompt_id: prompt.id });
  return rows[0]?.full_prompt || null;
}

export async function recordView(prompt, user) {
  if (!user) return;
  try {
    await db.PromptHistory.create({
      user_id: user.id,
      prompt_id: prompt.id,
      viewed_at: new Date().toISOString(),
    });
  } catch {
    // history is best-effort
  }
}
