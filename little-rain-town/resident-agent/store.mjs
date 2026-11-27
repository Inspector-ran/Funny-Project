import { DatabaseSync } from 'node:sqlite';
import { newTown } from './engine.mjs';

export function openTown(filename) {
  const db = new DatabaseSync(filename);
  db.exec(`
    PRAGMA busy_timeout = 3000;
    CREATE TABLE IF NOT EXISTS town (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      revision INTEGER NOT NULL,
      snapshot TEXT NOT NULL
    );
  `);
  db.prepare('INSERT OR IGNORE INTO town VALUES (1, 0, ?)').run(JSON.stringify(newTown()));
  const read = db.prepare('SELECT snapshot FROM town WHERE id=1');
  const write = db.prepare('UPDATE town SET revision=?, snapshot=? WHERE id=1 AND revision=?');
  return {
    read: () => JSON.parse(read.get().snapshot),
    save(previous, next) {
      if (next.revision !== previous.revision + 1) throw Error('Unexpected town revision');
      return write.run(next.revision, JSON.stringify(next), previous.revision).changes === 1;
    },
    close: () => db.close()
  };
}
