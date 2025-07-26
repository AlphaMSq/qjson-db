const fs = require("fs");
const path = require("path");

/**
 * Default configuration values.
 * @type {{asyncWrite: boolean, syncOnWrite: boolean, jsonSpaces: number}}
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
 * @returns {boolean} `true` if the content is valid JSON, otherwise throws an error.
 */
let validateJSON = function (fileContent) {
    try {
        this.options.parse(fileContent);
    } catch (e) {
        console.error("The specified file is not empty and does not contain valid JSON.");
        throw e;
    }
    return true;
};

/**
 * Class for working with a JSON database file.
 */
class JSONdb {
    /**
     * Main constructor. Manages the existing storage file and merges user options with defaults.
     * @param {string} filePath - Path to the file used as storage.
     * @param {object} [options] - Optional configuration options.
     * @param {boolean} [options.asyncWrite] - Enables asynchronous disk writing. Default: false.
     * @param {boolean} [options.syncOnWrite] - Writes changes to disk after each update. Default: true.
     * @param {number} [options.jsonSpaces] - Number of spaces for JSON formatting. Default: 4.
     */
    constructor(filePath, options) {
        if (typeof filePath !== "string") {
            throw new Error("Invalid file path.");
        } else if (filePath.endsWith(".json")) {
            this.filePath = filePath;
        } else {
            this.filePath = `${filePath}.json`;
        }

        this.options = options || defaultOptions;
        this.storage = {};

        const directory = path.dirname(filePath);
        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory, { recursive: true });
        }

        let stats;
        try {
            stats = fs.statSync(filePath);
        } catch (err) {
            if (err.code === "ENOENT") {
                return;
            } else if (err.code === "EACCES") {
                throw new Error(`Cannot access path "${filePath}".`);
            } else {
                throw new Error(`Error checking path "${filePath}": ${err}`);
            }
        }

        try {
            fs.accessSync(filePath, fs.constants.R_OK | fs.constants.W_OK);
        } catch (err) {
            throw new Error(`Cannot read/write at "${filePath}". Check permissions!`);
        }

        if (stats.size > 0) {
            let data;
            try {
                data = fs.readFileSync(filePath);
            } catch (err) {
                throw err;
            }
            if (validateJSON.bind(this)(data)) {
                this.storage = this.options.parse(data);
            }
        }
    }

    /**
     * Initializes a value if the key doesn't exist in the storage.
     * @param {string} key - Key to create or update.
     * @param {object} value - Value to store. Must be JSON-compatible.
     */
    init(key, value) {
        if (!this.storage.hasOwnProperty(key)) {
            this.storage[key] = value;
            if (this.options && this.options.syncOnWrite) this.sync();
        }
    }

    /**
     * Sets or updates a value by key.
     * @param {string} key - Key to create or update.
     * @param {object} value - Value to store. Must be JSON-compatible.
     */
    set(key, value) {
        this.storage[key] = value;
        if (this.options && this.options.syncOnWrite) this.sync();
    }

    /**
     * Gets the value of a key.
     * @param {string} key - Key to retrieve.
     * @returns {object|undefined} The value if exists, otherwise `undefined`.
     */
    get(key) {
        return this.storage.hasOwnProperty(key) ? this.storage[key] : undefined;
    }

    /**
     * Checks if a key exists.
     * @param {string} key - Key to check.
     * @returns {boolean} `true` if key exists, otherwise `false`.
     */
    has(key) {
        return this.storage.hasOwnProperty(key);
    }

    /**
     * Deletes a key from storage.
     * @param {string} key - Key to delete.
     * @returns {boolean|undefined} `true` if successful, `undefined` if key not found.
     */
    delete(key) {
        let retVal = this.storage.hasOwnProperty(key) ? delete this.storage[key] : undefined;
        if (this.options && this.options.syncOnWrite) this.sync();
        return retVal;
    }

    /**
     * Deletes all keys from storage.
     * @returns {object} The instance of JSONdb.
     */
    deleteAll() {
        for (let key in this.storage) {
            this.delete(key);
        }
        return this;
    }

    /**
     * Writes the current storage state to disk.
     */
    sync() {
        if (this.options && this.options.asyncWrite) {
            fs.writeFile(this.filePath, this.options.stringify(this.storage, null, this.options.jsonSpaces), (err) => {
                if (err) throw err;
            });
        } else {
            try {
                fs.writeFileSync(this.filePath, this.options.stringify(this.storage, null, this.options.jsonSpaces));
            } catch (err) {
                if (err.code === "EACCES") {
                    throw new Error(`Cannot access path "${this.filePath}".`);
                } else {
                    throw new Error(`Write error at "${this.filePath}": ${err}`);
                }
            }
        }
    }

    /**
     * If no argument is passed, returns a copy of internal storage.
     * If an object is passed, replaces the internal storage with it.
     * @param {object} storage - Optional JSON object to replace the current storage.
     * @returns {object} A deep clone of the internal storage.
     */
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

module.exports = JSONdb;
module.exports.default = JSONdb;