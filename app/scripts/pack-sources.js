import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';

function getTodayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export async function packSourcesArchive(targetVersion) {
  const cwd = process.cwd();
  const publicDir = path.resolve(cwd, 'public');

  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const todayStr = getTodayString();

  // Find version number
  let version = targetVersion;
  if (!version) {
    const arg = process.argv[2];
    if (arg && /^[vV]?\d+$/.test(arg)) {
      version = parseInt(arg.replace(/^[vV]/, ''), 10);
    } else if (process.env.SOURCES_VERSION) {
      version = parseInt(process.env.SOURCES_VERSION, 10);
    } else {
      let highest = 0;
      const existingFiles = fs.readdirSync(publicDir);
      const regex = new RegExp(`^kabinetdoma-sources-${todayStr}-v(\\d+)\\.zip$`);
      for (const file of existingFiles) {
        const match = file.match(regex);
        if (match) {
          const v = parseInt(match[1], 10);
          if (v > highest) highest = v;
        }
      }
      version = highest > 0 ? highest + 1 : 1;
    }
  }

  const archiveName = `kabinetdoma-sources-${todayStr}-v${version}.zip`;

  // Clean up previous sources archives from public
  const publicFiles = fs.readdirSync(publicDir);
  for (const f of publicFiles) {
    if (f.startsWith('kabinetdoma-sources-') && f.endsWith('.zip') && f !== archiveName) {
      try {
        fs.unlinkSync(path.join(publicDir, f));
        console.log(`Removed obsolete sources archive: ${f}`);
      } catch (err) {
        console.warn(`Could not delete ${f}:`, err);
      }
    }
  }

  const zip = new JSZip();

  // Helper to recursively add a directory to zip, skipping excluded patterns
  function addDirectoryToZip(dirPath, zipFolderPrefix = '') {
    if (!fs.existsSync(dirPath)) return;
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const name = entry.name;
      // Skip node_modules, dist, .git, zip files, DS_Store, etc.
      if (name === 'node_modules' || name === 'dist' || name === '.git' || name === '.DS_Store' || name === '.turbo') {
        continue;
      }
      if (name.endsWith('.zip') || name.endsWith('.log')) {
        continue;
      }

      const fullPath = path.join(dirPath, name);
      const relativeZipPath = zipFolderPrefix ? `${zipFolderPrefix}/${name}` : name;

      if (entry.isDirectory()) {
        addDirectoryToZip(fullPath, relativeZipPath);
      } else if (entry.isFile()) {
        zip.file(relativeZipPath, fs.readFileSync(fullPath));
      }
    }
  }

  console.log('Collecting project source files...');

  // 1. Root files
  const rootFiles = [
    'package.json',
    'tsconfig.json',
    'vite.config.ts',
    'server.ts',
    'index.html',
    'metadata.json',
    'README.md',
    '.gitignore',
    '.env.example'
  ];

  for (const fileName of rootFiles) {
    const fullPath = path.resolve(cwd, fileName);
    if (fs.existsSync(fullPath)) {
      zip.file(fileName, fs.readFileSync(fullPath));
      console.log(`  + [root] ${fileName}`);
    }
  }

  // 2. Add src/ directory
  console.log('  + [dir] src/');
  addDirectoryToZip(path.resolve(cwd, 'src'), 'src');

  // 3. Add scripts/ directory
  console.log('  + [dir] scripts/');
  addDirectoryToZip(path.resolve(cwd, 'scripts'), 'scripts');

  // 4. Add public/ directory (excluding any zip files)
  console.log('  + [dir] public/');
  addDirectoryToZip(path.resolve(cwd, 'public'), 'public');

  console.log(`Compressing and generating ZIP: ${archiveName}...`);
  const content = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 }
  });

  const sizeMb = (content.length / (1024 * 1024)).toFixed(2);
  const sizeFormatted = `${sizeMb} МБ`;

  // Write archive to public
  const targetPath = path.join(publicDir, archiveName);
  fs.writeFileSync(targetPath, content);

  // Also write a convenient latest alias
  fs.writeFileSync(path.join(publicDir, 'kabinetdoma-sources-latest.zip'), content);

  // Metadata JSON
  const info = {
    filename: archiveName,
    url: `/${archiveName}`,
    latestUrl: `/kabinetdoma-sources-latest.zip`,
    sizeBytes: content.length,
    sizeFormatted,
    date: todayStr,
    version,
    type: 'sources',
    updatedAt: new Date().toISOString()
  };

  fs.writeFileSync(path.join(publicDir, 'sources-info.json'), JSON.stringify(info, null, 2));

  console.log(`✅ Successfully generated source archive: public/${archiveName} (${sizeFormatted})`);
  return info;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  packSourcesArchive().catch((err) => {
    console.error('Packaging sources failed:', err);
    process.exit(1);
  });
}
