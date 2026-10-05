const fs = require("fs");
const s = fs.readFileSync(process.env.TEMP + "/mtd-programs.html", "utf8");
const ids = [...s.matchAll(/9f6ef5_[a-z0-9]+/gi)].map((x) => x[0]);
const uniq = [...new Set(ids)];
console.log("ids", uniq.length);
console.log(uniq.join("\n"));
for (const id of ["comp-m655om7d", "comp-m655qlvj", "comp-m655wlnm", "comp-mfcvizae", "comp-mfcvizax", "comp-mfcvizb91"]) {
  const idx = s.indexOf(id);
  console.log("\n====", id, idx, "====");
  if (idx >= 0) console.log(s.slice(idx, idx + 500));
}
