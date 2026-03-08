CREATE TABLE IF NOT EXISTS bespoke_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),

  name TEXT NOT NULL,
  email TEXT NOT NULL,
  budget TEXT,
  style_brand TEXT,
  style_build TEXT,
  case_size TEXT,
  case_finish TEXT,
  bracelet TEXT,
  hands TEXT,
  movement TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new'
);