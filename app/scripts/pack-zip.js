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

export async function packArchive(targetVersion) {
  const cwd = process.cwd();
  const distDir = path.resolve(cwd, 'dist');
  const publicDir = path.resolve(cwd, 'public');

  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const todayStr = getTodayString();

  // Find existing version if not provided
  let version = targetVersion;
  if (!version) {
    // Check if version was specified via env var or command line args
    const arg = process.argv[2];
    if (arg && /^[vV]?\d+$/.test(arg)) {
      version = parseInt(arg.replace(/^[vV]/, ''), 10);
    } else if (process.env.ARCHIVE_VERSION) {
      version = parseInt(process.env.ARCHIVE_VERSION, 10);
    } else {
      // Find highest existing version for today in public
      let highest = 0;
      const existingFiles = fs.readdirSync(publicDir);
      const regex = new RegExp(`^kabinetdoma-${todayStr}-v(\\d+)\\.zip$`);
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

  const archiveName = `kabinetdoma-${todayStr}-v${version}.zip`;

  // CLEAN UP: remove obsolete build archives from public and dist (preserving sources archives)
  const isBuildArchive = (file) => 
    !file.includes('sources') && 
    (file.startsWith('kabinetdoma-') || file.startsWith('home4work-')) && 
    file.endsWith('.zip');

  const publicFiles = fs.readdirSync(publicDir);
  for (const f of publicFiles) {
    if (isBuildArchive(f) && f !== archiveName) {
      try {
        fs.unlinkSync(path.join(publicDir, f));
        console.log(`Removed obsolete build archive from public: ${f}`);
      } catch (err) {
        console.warn(`Could not delete ${f}:`, err);
      }
    }
  }

  if (fs.existsSync(distDir)) {
    const distFiles = fs.readdirSync(distDir);
    for (const f of distFiles) {
      if (isBuildArchive(f) && f !== archiveName) {
        try {
          fs.unlinkSync(path.join(distDir, f));
          console.log(`Removed obsolete build archive from dist: ${f}`);
        } catch (err) {
          console.warn(`Could not delete ${f}:`, err);
        }
      }
    }
  }

  // Pre-render static HTML pages for all 25+ routes, guides and aliases
  if (fs.existsSync(distDir) && fs.existsSync(path.join(distDir, 'index.html'))) {
    try {
      const { execSync } = await import('child_process');
      console.log('Generating pre-rendered static HTML pages for all routes and articles...');
      execSync('npx tsx scripts/generate-static.ts', { stdio: 'inherit' });
    } catch (err) {
      console.warn('Could not run generate-static.ts:', err);
    }
  }

  const zip = new JSZip();

  // Add .nojekyll (mandatory for GitHub Pages)
  zip.file('.nojekyll', '');
  fs.writeFileSync(path.join(publicDir, '.nojekyll'), '');

  // Add CNAME for kabinetdoma.ru
  zip.file('CNAME', 'kabinetdoma.ru\n');
  fs.writeFileSync(path.join(publicDir, 'CNAME'), 'kabinetdoma.ru\n');

  // Add robots.txt
  const robots = `User-agent: *\nAllow: /\nSitemap: https://kabinetdoma.ru/sitemap.xml\nHost: kabinetdoma.ru\n`;
  zip.file('robots.txt', robots);
  fs.writeFileSync(path.join(publicDir, 'robots.txt'), robots);

  // Add Yandex Webmaster verification file
  const yandexVerificationHtml = `<html>\n    <head>\n        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">\n    </head>\n    <body>Verification: f90ccbe3e80e4f97</body>\n</html>\n`;
  zip.file('yandex_f90ccbe3e80e4f97.html', yandexVerificationHtml);
  fs.writeFileSync(path.join(publicDir, 'yandex_f90ccbe3e80e4f97.html'), yandexVerificationHtml);

  // Add sitemap.xml
  const sitemap = fs.existsSync(path.join(publicDir, 'sitemap.xml'))
    ? fs.readFileSync(path.join(publicDir, 'sitemap.xml'), 'utf-8')
    : `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://kabinetdoma.ru/</loc><priority>1.0</priority></url>
</urlset>\n`;
  zip.file('sitemap.xml', sitemap);

  // Add 404.html for GitHub Pages SPA routing
  if (fs.existsSync(path.join(publicDir, '404.html'))) {
    zip.file('404.html', fs.readFileSync(path.join(publicDir, '404.html')));
  }

  // Add README.md from root
  if (fs.existsSync(path.resolve(cwd, 'README.md'))) {
    const readmeContent = fs.readFileSync(path.resolve(cwd, 'README.md'), 'utf-8');
    zip.file('README.md', readmeContent);
  }

  // Recursively add all files from dist
  if (fs.existsSync(distDir)) {
    // Write CNAME to dist as well
    fs.writeFileSync(path.join(distDir, 'CNAME'), 'kabinetdoma.ru\n');
    fs.writeFileSync(path.join(distDir, '.nojekyll'), '');
    fs.writeFileSync(path.join(distDir, 'robots.txt'), robots);
    fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemap);

    function addDir(currentDir, relativePath = '') {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.name.endsWith('.zip')) continue;
        const fullPath = path.join(currentDir, entry.name);
        const rel = relativePath ? `${relativePath}/${entry.name}` : entry.name;
        if (entry.isDirectory()) {
          addDir(fullPath, rel);
        } else {
          zip.file(rel, fs.readFileSync(fullPath));
        }
      }
    }
    addDir(distDir);
  }

  console.log(`Packing ZIP: ${archiveName}...`);
  const content = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  const sizeMb = (content.length / (1024 * 1024)).toFixed(2);
  const sizeFormatted = `${sizeMb} МБ`;

  // Write new archive
  fs.writeFileSync(path.join(publicDir, archiveName), content);
  if (fs.existsSync(distDir)) {
    fs.writeFileSync(path.join(distDir, archiveName), content);
  }

  // Write archive metadata JSON for API & UI
  const archiveInfo = {
    filename: archiveName,
    url: `/${archiveName}`,
    sizeBytes: content.length,
    sizeFormatted,
    date: todayStr,
    version,
    updatedAt: new Date().toISOString()
  };

  fs.writeFileSync(path.join(publicDir, 'archive-info.json'), JSON.stringify(archiveInfo, null, 2));
  if (fs.existsSync(distDir)) {
    fs.writeFileSync(path.join(distDir, 'archive-info.json'), JSON.stringify(archiveInfo, null, 2));
  }

  console.log(`Successfully generated public/${archiveName} (${sizeFormatted})`);
  return archiveInfo;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  packArchive().catch((err) => {
    console.error('Packaging failed:', err);
    process.exit(1);
  });
}
