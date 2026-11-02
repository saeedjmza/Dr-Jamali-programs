/**
 * pack-assets.cjs
 * Packages the web distribution files into compact binary bundles
 * in multiple safe locations (build/, scripts/, resources/)
 * and compiles the standalone release/Tunnelapp1.0.exe directly.
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { execSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const RESOURCES_DIR = path.join(ROOT_DIR, 'resources');
const RESOURCES_DIST = path.join(RESOURCES_DIR, 'dist');
const BUILD_DIR = path.join(ROOT_DIR, 'build');
const RELEASE_DIR = path.join(ROOT_DIR, 'release');

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function getAllFiles(dirPath, arrayOfFiles = []) {
  if (!fs.existsSync(dirPath)) return arrayOfFiles;
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  }
  return arrayOfFiles;
}

function pack() {
  // If dist doesn't exist, try falling back to resources/dist
  let sourceDir = DIST_DIR;
  if (!fs.existsSync(sourceDir) || !fs.existsSync(path.join(sourceDir, 'index.html'))) {
    if (fs.existsSync(RESOURCES_DIST) && fs.existsSync(path.join(RESOURCES_DIST, 'index.html'))) {
      console.log(`Restoring dist folder from resources/dist...`);
      copyDirRecursive(RESOURCES_DIST, DIST_DIR);
    } else {
      console.error(`[Error] Neither dist nor resources/dist exists.`);
      process.exit(1);
    }
  }

  // Backup dist to resources/dist so zip export will never lose it
  if (fs.existsSync(DIST_DIR)) {
    copyDirRecursive(DIST_DIR, RESOURCES_DIST);
  }

  if (!fs.existsSync(BUILD_DIR)) fs.mkdirSync(BUILD_DIR, { recursive: true });
  if (!fs.existsSync(RESOURCES_DIR)) fs.mkdirSync(RESOURCES_DIR, { recursive: true });
  if (!fs.existsSync(RELEASE_DIR)) fs.mkdirSync(RELEASE_DIR, { recursive: true });

  const allFiles = getAllFiles(DIST_DIR);
  console.log(`Packing ${allFiles.length} files from dist into standalone asset bundles...`);

  const fileRecords = [];
  let totalRawSize = 0;
  let totalCompressedSize = 0;

  for (const fullPath of allFiles) {
    const relPath = path.relative(DIST_DIR, fullPath).replace(/\\/g, '/');
    const rawData = fs.readFileSync(fullPath);
    totalRawSize += rawData.length;

    // DeflateRaw format compatible with System.IO.Compression.DeflateStream
    const compressedData = zlib.deflateRawSync(rawData, { level: 9 });
    totalCompressedSize += compressedData.length;

    fileRecords.push({
      relPath,
      rawSize: rawData.length,
      compressedSize: compressedData.length,
      compressedData
    });
  }

  // Calculate header and buffer size
  let headerSize = 12; // "TAPP" (4) + version (4) + fileCount (4)
  for (const rec of fileRecords) {
    const pathBuf = Buffer.from(rec.relPath, 'utf8');
    headerSize += 2 + pathBuf.length + 4 + 4 + rec.compressedSize;
  }

  const bundleBuf = Buffer.alloc(headerSize);
  let offset = 0;

  bundleBuf.write('TAPP', offset, 4, 'ascii');
  offset += 4;
  bundleBuf.writeInt32LE(1, offset);
  offset += 4;
  bundleBuf.writeInt32LE(fileRecords.length, offset);
  offset += 4;

  for (const rec of fileRecords) {
    const pathBuf = Buffer.from(rec.relPath, 'utf8');
    bundleBuf.writeUInt16LE(pathBuf.length, offset);
    offset += 2;
    pathBuf.copy(bundleBuf, offset);
    offset += pathBuf.length;
    bundleBuf.writeUInt32LE(rec.rawSize, offset);
    offset += 4;
    bundleBuf.writeUInt32LE(rec.compressedSize, offset);
    offset += 4;
    rec.compressedData.copy(bundleBuf, offset);
    offset += rec.compressedSize;
  }

  // Write bundle to 3 locations so export tools never lose it
  const outputLocations = [
    path.join(BUILD_DIR, 'app_assets.bundle'),
    path.join(ROOT_DIR, 'scripts', 'assets.bundle'),
    path.join(RESOURCES_DIR, 'app_assets.bundle')
  ];

  for (const outPath of outputLocations) {
    fs.writeFileSync(outPath, bundleBuf);
    console.log(`[Bundle Created] ${outPath}`);
  }

  console.log(`Total Raw Size: ${(totalRawSize / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`Compressed Bundle: ${(bundleBuf.length / (1024 * 1024)).toFixed(2)} MB`);

  // Compile release/Tunnelapp1.0.exe directly if mcs is available
  try {
    const iconPath = path.join(BUILD_DIR, 'icon.ico');
    const iconParam = fs.existsSync(iconPath) ? `-win32icon:"${iconPath}"` : '';
    const csLauncher = path.join(ROOT_DIR, 'scripts', 'TunnelappLauncher.cs');
    const outExe = path.join(RELEASE_DIR, 'Tunnelapp1.0.exe');
    const bundleFile = path.join(BUILD_DIR, 'app_assets.bundle');

    console.log('Compiling native standalone executable release/Tunnelapp1.0.exe with mcs...');
    execSync(`mcs -target:winexe ${iconParam} -resource:"${bundleFile}",TunnelappAssets -out:"${outExe}" -r:System.dll "${csLauncher}"`, {
      stdio: 'inherit'
    });
    console.log(`[Success] Standalone executable compiled: ${outExe}`);
  } catch (err) {
    console.warn(`[Notice] Native mcs compiler not run or skipped: ${err.message}`);
  }
}

pack();
