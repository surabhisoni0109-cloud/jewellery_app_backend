const fs = require("fs");
const path = require("path");

const sourceDir = path.join(__dirname, "..", "out");
const targetDir = path.join(__dirname, "..", "..", "public", "admin");

console.log(`📦 Copying static build from: ${sourceDir}`);
console.log(`🎯 Target destination:       ${targetDir}`);

if (!fs.existsSync(sourceDir)) {
  console.error("❌ Source 'out' folder does not exist. Did `next build` fail?");
  process.exit(1);
}

// Ensure target parent directory exists
fs.mkdirSync(targetDir, { recursive: true });

// Clean old files in targetDir
fs.rmSync(targetDir, { recursive: true, force: true });
fs.mkdirSync(targetDir, { recursive: true });

// Copy all files and folders recursively
fs.cpSync(sourceDir, targetDir, { recursive: true });

// Create RSC dotted alias files for Next.js App Router prefetch requests
// e.g. users/__next.!KHBhZ2VzKQ/users/__PAGE__.txt -> users/__next.!KHBhZ2VzKQ.users.__PAGE__.txt
function createRscDottedAliases(baseDir) {
  function scanDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name.startsWith("__next.")) {
          findAndCreateAliases(dir, entry.name, fullPath);
        } else {
          scanDir(fullPath);
        }
      }
    }
  }

  function findAndCreateAliases(parentDir, currentPrefix, currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        findAndCreateAliases(parentDir, `${currentPrefix}.${entry.name}`, fullPath);
      } else if (entry.isFile() && entry.name === "__PAGE__.txt") {
        const aliasFileName = `${currentPrefix}.__PAGE__.txt`;
        const aliasFilePath = path.join(parentDir, aliasFileName);
        fs.copyFileSync(fullPath, aliasFilePath);
        console.log(`  🔗 Created RSC alias: ${path.relative(baseDir, aliasFilePath)}`);
      }
    }
  }

  scanDir(baseDir);
}

console.log("🔗 Generating RSC prefetch alias files...");
createRscDottedAliases(targetDir);

// For every route directory (like notifications, users, vendors, dashboard),
// if a corresponding <route>.html exists at root, copy it to <route>/index.html
// so requests with trailing slash (/admin/notifications/) load cleanly everywhere.
function createDirectoryIndexHtml(baseDir) {
  const entries = fs.readdirSync(baseDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory() && !entry.name.startsWith("_")) {
      const htmlFile = path.join(baseDir, `${entry.name}.html`);
      const targetIndex = path.join(baseDir, entry.name, "index.html");
      if (fs.existsSync(htmlFile) && !fs.existsSync(targetIndex)) {
        fs.copyFileSync(htmlFile, targetIndex);
        console.log(`  📄 Created trailing-slash fallback: ${entry.name}/index.html`);
      }
    }
  }
}

createDirectoryIndexHtml(targetDir);

console.log("✅ Build successfully copied to public/admin!");
console.log("🚀 You can now `git add .`, `git commit`, and `git push` to make it live!");
