const fs = require("fs");
const path = require("path");

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    if (file === "node_modules" || file === "dist" || file === ".git") continue;
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else if (file.endsWith(".js") || file.endsWith(".jsx")) {
      results.push(fullPath);
    }
  }
  return results;
}

const files = [...walk("./backend"), ...walk("./frontend/src")];
const vietnameseRegex = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;

for (const f of files) {
  if (f.includes("test_plan.js") || f.includes("find_comments.js")) continue;
  const content = fs.readFileSync(f, "utf-8");
  const lines = content.split("\n");
  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    // Check line comment // or trailing comment //
    const commentMatch = trimmed.match(/\/\/(.*)$/);
    if (commentMatch) {
      const comment = commentMatch[1].trim();
      if (comment.startsWith("http") || comment.length === 0) return;
      // If it looks like commented-out code (e.g. starts with const, let, if, return, import, src=, onClick, alert), skip or check
      // Check if pure English words
      if (/[a-zA-Z]/.test(comment) && !vietnameseRegex.test(comment)) {
        console.log(`${f}:${idx + 1}: ${comment}`);
      }
    }
  });
}

