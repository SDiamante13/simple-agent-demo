const fs = require("fs");
const path = require("path");

const SYSTEM_PROMPT = fs.readFileSync(
  path.join(__dirname, "..", "..", "prompt.md"),
  "utf8",
);

module.exports = ({ vars }) => [
  { role: "system", content: SYSTEM_PROMPT },
  { role: "user", content: vars.query },
];
