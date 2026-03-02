CREATE TABLE IF NOT EXISTS bespoke_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),

  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,

  model TEXT,
  dial_color TEXT,
  hand_color TEXT,
  strap TEXT,

  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new'
);

CREATE INDEX IF NOT EXISTS idx_bespoke_created_at ON bespoke_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_bespoke_status ON bespoke_requests(status);