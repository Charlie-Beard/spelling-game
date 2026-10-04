-- Migration number: 0002
-- Profiles beyond Jasper's: a demo one for showing the game to people
-- without touching his progress, and any added later from the grown-ups'
-- corner. Rebuilds the table without the old jasper/parent restriction
-- (dropping the unused grown-up profile) and gives each profile a name.
CREATE TABLE profiles_new (
  who TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  data TEXT NOT NULL,
  rev INTEGER NOT NULL,
  updated_at TEXT NOT NULL
);
INSERT INTO profiles_new (who, label, data, rev, updated_at)
  SELECT who, 'Jasper', data, rev, updated_at FROM profiles WHERE who = 'jasper';
DROP TABLE profiles;
ALTER TABLE profiles_new RENAME TO profiles;

-- The demo: every chapter open, and no name, so nobody is called "Jasper".
INSERT INTO profiles (who, label, data, rev, updated_at)
  VALUES ('demo', 'Demo', '{"v":1,"name":"","unlockAll":true}', 1, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'));
