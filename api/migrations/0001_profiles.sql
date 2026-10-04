-- Migration number: 0001
-- One saved game per player: their whole progress + settings as JSON.
-- `rev` goes up by one on every save, so two devices can't overwrite
-- each other's changes unseen.
CREATE TABLE profiles (
  who TEXT PRIMARY KEY CHECK (who IN ('jasper', 'parent')),
  data TEXT NOT NULL,
  rev INTEGER NOT NULL,
  updated_at TEXT NOT NULL
);
