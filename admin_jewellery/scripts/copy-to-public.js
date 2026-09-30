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

console.log("✅ Build successfully copied to public/admin!");
console.log("🚀 You can now `git add .`, `git commit`, and `git push` to make it live!");
