import fs from "fs";
import path from "path";

/**
 * Default configuration values.
 */
const defaultOptions = {
  asyncWrite: false,
  syncOnWrite: true,
  jsonSpaces: 4,
  stringify: JSON.stringify,
  parse: JSON.parse,
};

/**
 * Validates the contents of a JSON file.
 * @param {string} fileContent
 * @param {object} options
 * @returns {boolean} true if valid, throws if invalid
 */
function validateJSON(fileContent, options) {
  try {
    options.parse(fileContent);
  } catch (e) {
    console.error("The specified file is not empty and does not contain valid JSON.");
    throw e;
  }
  return true;
}

/**
 * Class for working with a JSON database file.
 */
export class JSONdb {
  /**
   * @param {string} filePath
   * @param {object} [options]
   */
  constructor(filePath, options = {}) {
    if (typeof filePath !== "string") {
      throw new Error("Invalid file path.");
    }

    this.filePath = filePath.endsWith(".json") ? filePath : `${filePath}.json`;
    this.options = { ...defaultOptions, ...options };
    this.storage = {};

    const directory = path.dirname(this.filePath);
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }

    let stats;
    try {
      stats = fs.statSync(this.filePath);
    } catch (err) {
      if (err.code === "ENOENT") {
        return;
      } else if (err.code === "EACCES") {
        throw new Error(`Cannot access path "${this.filePath}".`);
      } else {
        throw new Error(`Error checking path "${this.filePath}": ${err}`);
      }
    }

    try {
      fs.accessSync(this.filePath, fs.constants.R_OK | fs.constants.W_OK);
    } catch (err) {
      throw new Error(`Cannot read/write at "${this.filePath}". Check permissions!`);
    }

    if (stats.size > 0) {
      const data = fs.readFileSync(this.filePath, "utf-8");
      if (validateJSON(data, this.options)) {
        this.storage = this.options.parse(data);
      }
    }
  }

  init(key, value) {
    if (!this.storage.hasOwnProperty(key)) {
      this.storage[key] = value;
      if (this.options.syncOnWrite) this.sync();
    }
  }

  set(key, value) {
    this.storage[key] = value;
    if (this.options.syncOnWrite) this.sync();
  }

  get(key) {
    return this.storage.hasOwnProperty(key) ? this.storage[key] : undefined;
  }

  has(key) {
    return this.storage.hasOwnProperty(key);
  }

  delete(key) {
    const retVal = this.storage.hasOwnProperty(key) ? delete this.storage[key] : undefined;
    if (this.options.syncOnWrite) this.sync();
    return retVal;
  }

  deleteAll() {
    for (const key in this.storage) {
      this.delete(key);
    }
    return this;
  }

  sync() {
    const json = this.options.stringify(this.storage, null, this.options.jsonSpaces);

    if (this.options.asyncWrite) {
      fs.writeFile(this.filePath, json, (err) => {
        if (err) throw err;
      });
    } else {
      try {
        fs.writeFileSync(this.filePath, json);
      } catch (err) {
        if (err.code === "EACCES") {
          throw new Error(`Cannot access path "${this.filePath}".`);
        } else {
          throw new Error(`Write error at "${this.filePath}": ${err}`);
        }
      }
    }
  }

  JSON(storage) {
    if (storage) {
      try {
        JSON.parse(this.options.stringify(storage));
        this.storage = storage;
      } catch (err) {
        throw new Error("Provided value is not a valid JSON object.");
      }
    }
    return JSON.parse(this.options.stringify(this.storage));
  }
}

export default JSONdb;
