import JSONdb from "../dist/index.mjs";

const db = new JSONdb("../data/test-esm", { syncOnWrite: false });

db.set("esm", "hello");
console.log("ESM Test:", db.get("esm"));
