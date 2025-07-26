const JSONdb = require("../dist/index.cjs").default;

const db = new JSONdb("../data/test-cjs", { syncOnWrite: false });

db.set("cjs", "world");
console.log("CJS Test:", db.get("cjs"));
