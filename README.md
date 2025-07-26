# qjson-db

Lightweight local JSON-based database for Node.js projects.

## Installation

`npm install qjson-db`

## Usage

```js
const JSONdb = require("qjson-db").default; /* CommonJS */
const db = new JSONdb("./data.json");

db.set("username", "Qpla");
console.log(db.get("username")); // "Qpla"
```

## Options

- `asyncWrite` — Enables asynchronous write to disk (default: false)
- `syncOnWrite` — Writes changes to disk immediately after modification (default: true)
- `jsonSpaces` — Number of spaces to use for JSON formatting (default: 4)

## API

### new JSONdb(filePath[, options])

Creates a new database instance.

- `filePath` (string) — Path to the JSON file (extension .json will be added if missing)
- `options` (object, optional):
  - `asyncWrite` (boolean)
  - `syncOnWrite` (boolean)
  - `jsonSpaces` (number)
  - `stringify` (function)
  - `parse` (function)

### Methods

- `init(key, value)` — Initializes a key with a value if it doesn't exist.
- `set(key, value)` — Sets or updates a key with a value.
- `get(key)` — Retrieves the value by key.
- `has(key)` — Checks if a key exists.
- `delete(key)` — Deletes a key. Returns true if deleted, undefined if not found.
- `deleteAll()` — Deletes all keys.
- `sync()` — Writes current storage to disk.
- `JSON([storage])` — Gets a clone of the storage or replaces storage if an object is passed.

## License

MIT

---

Made with ❤️
