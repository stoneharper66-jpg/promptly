// Data layer with two interchangeable adapters:
//
//  * Base44 adapter  — used when BASE44_ENABLED; every entity maps 1:1 to a
//    schema in /base44/entities/*.jsonc. Access control (who can read
//    premium PromptContent rows) is enforced server-side by Base44 RLS,
//    NOT by this file.
//
//  * Local adapter   — localStorage-backed demo store seeded from
//    src/data/seed.js so the whole product works before Base44 import.
//
// Both expose: list(), filter(query), get(id), create(data),
// update(id, data), remove(id).

import { base44, BASE44_ENABLED } from '@/api/base44Client';
import { categories as seedCategories, prompts as seedPrompts } from '@/data/seed';

const LS_PREFIX = 'promptly_db_';

/* ---------- local adapter ---------- */

function loadCollection(name) {
  try {
    const raw = localStorage.getItem(LS_PREFIX + name);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveCollection(name, rows) {
  localStorage.setItem(LS_PREFIX + name, JSON.stringify(rows));
}

function seedIfNeeded() {
  if (loadCollection('Category')) return;

  saveCollection(
    'Category',
    seedCategories.map((c) => ({ ...c })),
  );

  // Premium prompt bodies live in a separate collection, mirroring the
  // Base44 entity split that lets RLS protect them server-side.
  const promptRows = [];
  const contentRows = [];
  for (const p of seedPrompts) {
    const { full_prompt, ...meta } = p;
    promptRows.push({
      ...meta,
      // Free prompts carry their text publicly; premium ones do not.
      full_prompt: p.premium ? null : full_prompt,
    });
    if (p.premium) {
      contentRows.push({ id: `content-${p.id}`, prompt_id: p.id, full_prompt });
    }
  }
  saveCollection('Prompt', promptRows);
  saveCollection('PromptContent', contentRows);
  saveCollection('Membership', []);
  saveCollection('SavedPrompt', []);
  saveCollection('PromptHistory', []);
}

function matches(row, query) {
  return Object.entries(query || {}).every(([k, v]) => row[k] === v);
}

function localEntity(name) {
  return {
    async list() {
      seedIfNeeded();
      return loadCollection(name) || [];
    },
    async filter(query) {
      seedIfNeeded();
      return (loadCollection(name) || []).filter((r) => matches(r, query));
    },
    async get(id) {
      seedIfNeeded();
      return (loadCollection(name) || []).find((r) => r.id === id) || null;
    },
    async create(data) {
      seedIfNeeded();
      const rows = loadCollection(name) || [];
      const row = { id: data.id || `${name.toLowerCase()}-${Date.now()}`, ...data };
      rows.push(row);
      saveCollection(name, rows);
      return row;
    },
    async update(id, data) {
      seedIfNeeded();
      const rows = loadCollection(name) || [];
      const i = rows.findIndex((r) => r.id === id);
      if (i === -1) throw new Error(`${name} ${id} not found`);
      rows[i] = { ...rows[i], ...data };
      saveCollection(name, rows);
      return rows[i];
    },
    async remove(id) {
      seedIfNeeded();
      saveCollection(name, (loadCollection(name) || []).filter((r) => r.id !== id));
    },
  };
}

/* ---------- base44 adapter ---------- */

function base44Entity(name) {
  const entity = base44.entities[name];
  return {
    list: () => entity.list(),
    filter: (query) => entity.filter(query),
    get: (id) => entity.get(id),
    create: (data) => entity.create(data),
    update: (id, data) => entity.update(id, data),
    remove: (id) => entity.delete(id),
  };
}

/* ---------- facade ---------- */

const adapter = BASE44_ENABLED ? base44Entity : localEntity;

export const db = {
  Category: adapter('Category'),
  Prompt: adapter('Prompt'),
  PromptContent: adapter('PromptContent'),
  Membership: adapter('Membership'),
  SavedPrompt: adapter('SavedPrompt'),
  PromptHistory: adapter('PromptHistory'),
};

export const IS_DEMO_DATA = !BASE44_ENABLED;
