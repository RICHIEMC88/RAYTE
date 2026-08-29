const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const OUTPUT = path.join(ROOT, "..", "rayte-codigo-completo.txt");

const IGNORE_DIRS = new Set([
  "node_modules",
  ".next",
  ".git",
  ".turbo",
  ".cache",
  "dist",
  "build",
  "public"
]);

const ALLOWED_EXTS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".mjs",
  ".json",
  ".css",
  ".sql",
  ".md",
  ".env",
  ".svg",
  ".txt"
]);

function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    if (file.startsWith(".") && file !== ".env" && file !== ".gitignore") continue;
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (!IGNORE_DIRS.has(file)) {
        results = results.concat(getFiles(fullPath));
      }
    } else {
      const ext = path.extname(file);
      if (ALLOWED_EXTS.has(ext) || file === ".env" || file === ".gitignore") {
        results.push(fullPath);
      }
    }
  }
  return results;
}

const files = getFiles(ROOT).sort();
let content = `// ========================================================\n// RAYTE — CÓDIGO COMPLETO ACTUALIZADO\n// Fecha de actualización: ${new Date().toISOString()}\n// Total archivos incluidos: ${files.length}\n// ========================================================\n\n`;

for (const f of files) {
  const rel = path.relative(ROOT, f).replace(/\\/g, "/");
  try {
    const data = fs.readFileSync(f, "utf8");
    content += `// --------------------------------------------------------\n// ARCHIVO: ${rel}\n// --------------------------------------------------------\n${data}\n\n`;
  } catch (err) {
    // binary or unreadable
  }
}

fs.writeFileSync(OUTPUT, content, "utf8");
console.log(`✓ Archivo completo guardado en: ${OUTPUT} (${files.length} archivos, ${(content.length / 1024).toFixed(1)} KB)`);
