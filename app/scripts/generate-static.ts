import fs from 'fs';
import path from 'path';
import { ARTICLES_DATA, CATEGORIES } from '../src/data/contentData.ts';
import { Article } from '../src/types/index.ts';

function escapeHtml(text: string = ''): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderSimpleMarkdown(content: string = ''): string {
  return content
    .split('\n\n')
    .map(block => {
      const trimmed = block.trim();
      if (!trimmed) return '';
      if (trimmed.startsWith('#### ')) {
        return `<h4 class="text-base font-bold text-stone-900 mt-4 mb-2">${escapeHtml(trimmed.slice(5))}</h4>`;
      }
      if (trimmed.startsWith('### ')) {
        return `<h3 class="text-lg font-bold text-stone-900 mt-6 mb-3">${escapeHtml(trimmed.slice(4))}</h3>`;
      }
      if (trimmed.startsWith('## ')) {
        return `<h2 class="text-xl font-bold text-stone-900 mt-8 mb-4">${escapeHtml(trimmed.slice(3))}</h2>`;
      }
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const items = trimmed.split('\n').map(l => l.replace(/^[-*]\s+/, '').trim()).filter(Boolean);
        return `<ul class="list-disc list-inside space-y-1.5 my-3 text-stone-700 leading-relaxed">${items.map(i => `<li>${escapeHtml(i)}</li>`).join('')}</ul>`;
      }
      if (/^\d+\.\s/.test(trimmed)) {
        const items = trimmed.split('\n').map(l => l.replace(/^\d+\.\s+/, '').trim()).filter(Boolean);
        return `<ol class="list-decimal list-inside space-y-1.5 my-3 text-stone-700 leading-relaxed">${items.map(i => `<li>${escapeHtml(i)}</li>`).join('')}</ol>`;
      }
      return `<p class="my-3 text-stone-700 leading-relaxed text-base">${escapeHtml(trimmed)}</p>`;
    })
    .join('\n');
}

export function generateStaticPages() {
  const cwd = process.cwd();
  const distDir = path.resolve(cwd, 'dist');
  const indexHtmlPath = path.resolve(distDir, 'index.html');

  if (!fs.existsSync(indexHtmlPath)) {
    console.error('dist/index.html not found! Please run "vite build" first.');
    process.exit(1);
  }

  const baseHtml = fs.readFileSync(indexHtmlPath, 'utf8');

  // Helper to replace SEO meta tags in HTML
  function injectMeta(html: string, options: {
    title: string;
    description: string;
    canonicalUrl: string;
    ogType?: string;
    ogImage?: string;
    jsonLd?: object;
    rootBodyHtml?: string;
  }): string {
    let result = html;

    // 1. Replace <title>
    result = result.replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(options.title)}</title>`);

    // 2. Replace meta description
    result = result.replace(/<meta\s+name=["']description["']\s+content=["'].*?["']\s*\/?>/i,
      `<meta name="description" content="${escapeHtml(options.description)}" />`);

    // 3. Replace canonical
    result = result.replace(/<link\s+rel=["']canonical["']\s+href=["'].*?["']\s*\/?>/i,
      `<link rel="canonical" href="${escapeHtml(options.canonicalUrl)}" />`);

    // 4. OpenGraph tags
    result = result.replace(/<meta\s+property=["']og:title["']\s+content=["'].*?["']\s*\/?>/i,
      `<meta property="og:title" content="${escapeHtml(options.title)}" />`);
    result = result.replace(/<meta\s+property=["']og:description["']\s+content=["'].*?["']\s*\/?>/i,
      `<meta property="og:description" content="${escapeHtml(options.description)}" />`);
    result = result.replace(/<meta\s+property=["']og:url["']\s+content=["'].*?["']\s*\/?>/i,
      `<meta property="og:url" content="${escapeHtml(options.canonicalUrl)}" />`);
    
    if (options.ogType) {
      result = result.replace(/<meta\s+property=["']og:type["']\s+content=["'].*?["']\s*\/?>/i,
        `<meta property="og:type" content="${escapeHtml(options.ogType)}" />`);
    }

    if (options.ogImage) {
      const imgTag = `<meta property="og:image" content="${escapeHtml(options.ogImage)}" />`;
      if (result.includes('property="og:image"')) {
        result = result.replace(/<meta\s+property=["']og:image["']\s+content=["'].*?["']\s*\/?>/i, imgTag);
      } else {
        result = result.replace('</head>', `    ${imgTag}\n  </head>`);
      }
    }

    // 5. Schema.org JSON-LD structured data
    if (options.jsonLd) {
      const scriptTag = `\n    <!-- Page Structured Data -->\n    <script type="application/ld+json">\n    ${JSON.stringify(options.jsonLd, null, 2)}\n    </script>\n  `;
      result = result.replace('</head>', `${scriptTag}</head>`);
    }

    // 6. Pre-rendered root body content for crawlers
    if (options.rootBodyHtml) {
      result = result.replace('<div id="root"></div>', `<div id="root">${options.rootBodyHtml}</div>`);
    }

    return result;
  }

  // 1. Generate Static Section Pages
  const staticSections = [
    {
      pathName: 'articles',
      title: 'Все экспертные гайды и обзоры — Кабинет Дома (kabinetdoma.ru)',
      description: 'Практические руководства по организации рабочего места дома, выбору эргономичной мебели, кабель-менеджменту и зонированию.',
      heading: 'Все материалы и обзоры по организации домашнего офиса'
    },
    {
      pathName: 'calculator',
      title: 'Калькулятор эргономики стола и стула — Кабинет Дома',
      description: 'Интерактивный расчет высоты столешницы, сиденья кресла и расположения монитора под ваш точный рост по стандартам BIFMA и ГОСТ.',
      heading: 'Калькулятор эргономики рабочего места'
    },
    {
      pathName: 'builder',
      title: 'Конструктор тишины и уюта в квартире — Кабинет Дома',
      description: 'Интерактивный подбор решений для тихой и продуктивной работы в условиях однокомнатной квартиры с детьми и шумом.',
      heading: 'Конструктор тихого рабочего места'
    },
    {
      pathName: 'checklist',
      title: 'Чек-лист идеального домашнего офиса — Кабинет Дома',
      description: 'Интерактивный чек-лист из 12 шагов: от выбора угла и розеток до звукоизоляции и эргономики спины.',
      heading: 'Чек-лист обустройства домашнего кабинета'
    },
    {
      pathName: 'catalog',
      title: 'Каталог проверенной эргономичной мебели — Кабинет Дома',
      description: 'Экспертный каталог столов с электроприводом, эргономичных кресел, кронштейнов и скринбаров с честными плюсами и минусами.',
      heading: 'Каталог эргономичной мебели и аксессуаров'
    },
    {
      pathName: 'about',
      title: 'О проекте Кабинет Дома (KabinetDoma.ru) — Наша миссия',
      description: 'Миссия независимого медиапортала KabinetDoma.ru: помогать удаленщикам и родителям работать дома с комфортом без боли в спине.',
      heading: 'О независимом портале KabinetDoma.ru'
    },
    {
      pathName: 'privacy',
      title: 'Политика конфиденциальности — Кабинет Дома',
      description: 'Политика конфиденциальности и обработки персональных данных посетителей портала KabinetDoma.ru.',
      heading: 'Политика в отношении обработки персональных данных'
    },
    {
      pathName: 'terms',
      title: 'Пользовательское соглашение и маркировка рекламы — Кабинет Дома',
      description: 'Пользовательское соглашение, раскрытие партнерских ссылок (ОРД) и юридическая информация проекта Кабинет Дома.',
      heading: 'Пользовательское соглашение и раскрытие партнерских ссылок'
    }
  ];

  let pagesGenerated = 0;

  for (const sec of staticSections) {
    const secDir = path.resolve(distDir, sec.pathName);
    if (!fs.existsSync(secDir)) {
      fs.mkdirSync(secDir, { recursive: true });
    }

    const canonicalUrl = `https://kabinetdoma.ru/${sec.pathName}`;
    const preRenderHtml = `
      <div class="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 lg:px-8">
        <header class="max-w-4xl mx-auto mb-8">
          <nav class="text-xs text-stone-500 mb-4 flex items-center gap-2">
            <a href="/" class="hover:underline">Главная</a> <span>/</span> <span class="text-stone-900 font-medium">${escapeHtml(sec.heading)}</span>
          </nav>
          <h1 class="text-3xl font-extrabold text-stone-900 tracking-tight sm:text-4xl">${escapeHtml(sec.heading)}</h1>
          <p class="mt-3 text-lg text-stone-600 leading-relaxed">${escapeHtml(sec.description)}</p>
        </header>
        <div class="max-w-4xl mx-auto py-8">
          <p class="text-stone-500 text-sm">Интерактивный интерфейс загружается...</p>
        </div>
      </div>
    `;

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      'name': sec.title,
      'description': sec.description,
      'url': canonicalUrl,
      'isPartOf': {
        '@type': 'WebSite',
        'name': 'Кабинет Дома',
        'url': 'https://kabinetdoma.ru'
      }
    };

    const sectionHtml = injectMeta(baseHtml, {
      title: sec.title,
      description: sec.description,
      canonicalUrl,
      jsonLd,
      rootBodyHtml: preRenderHtml
    });

    fs.writeFileSync(path.resolve(secDir, 'index.html'), sectionHtml, 'utf8');
    pagesGenerated++;
  }

  // 2. Generate Static Article Pages for all Articles and their Aliases
  for (const article of ARTICLES_DATA) {
    const primarySlug = article.slug || article.id;
    const aliases = article.slugAliases || [];
    const allSlugs = Array.from(new Set([primarySlug, ...aliases]));

    const canonicalUrl = `https://kabinetdoma.ru/article/${primarySlug}`;
    const pageTitle = article.seo?.metaTitle || `${article.title} — Кабинет Дома`;
    const metaDesc = article.seo?.metaDescription || article.excerpt;
    const heroImage = article.heroImage
      ? (article.heroImage.startsWith('http') ? article.heroImage : `https://kabinetdoma.ru${article.heroImage}`)
      : 'https://kabinetdoma.ru/logo.png';

    // Rich semantic pre-rendered HTML for Googlebot and users before JS boots
    const sectionsHtml = article.sections.map(s => `
      <section id="${escapeHtml(s.id)}" class="my-8">
        <h2 class="text-2xl font-bold text-stone-900 mb-4">${escapeHtml(s.title)}</h2>
        ${renderSimpleMarkdown(s.content)}
        ${s.highlightBox ? `
          <aside class="my-6 p-4 rounded-xl border border-amber-200 bg-amber-50/70 text-stone-800">
            <h4 class="font-bold text-amber-900 mb-1 text-base">${escapeHtml(s.highlightBox.title)}</h4>
            <p class="text-sm leading-relaxed">${escapeHtml(s.highlightBox.text)}</p>
          </aside>
        ` : ''}
      </section>
    `).join('\n');

    const faqHtml = article.faqList && article.faqList.length > 0 ? `
      <section class="my-10 pt-8 border-t border-stone-200">
        <h2 class="text-2xl font-bold text-stone-900 mb-6">Часто задаваемые вопросы (FAQ)</h2>
        <div class="space-y-4">
          ${article.faqList.map(item => `
            <details class="group bg-white p-4 rounded-xl border border-stone-200" open>
              <summary class="font-semibold text-stone-900 cursor-pointer list-none flex items-center justify-between">
                <span>${escapeHtml(item.question)}</span>
              </summary>
              <p class="mt-2 text-stone-600 text-sm leading-relaxed">${escapeHtml(item.answer)}</p>
            </details>
          `).join('\n')}
        </div>
      </section>
    ` : '';

    const tocHtml = article.tableOfContents && article.tableOfContents.length > 0 ? `
      <nav class="my-6 p-5 rounded-xl border border-stone-200 bg-stone-50" aria-label="Содержание статьи">
        <h3 class="text-sm font-bold uppercase tracking-wider text-stone-700 mb-3">Содержание руководства</h3>
        <ul class="space-y-1.5 text-sm">
          ${article.tableOfContents.map(toc => `
            <li><a href="#${escapeHtml(toc.id)}" class="text-amber-800 hover:underline">${escapeHtml(toc.label)}</a></li>
          `).join('\n')}
        </ul>
      </nav>
    ` : '';

    const articlePreRenderHtml = `
      <article class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-white">
        <!-- Breadcrumbs -->
        <nav class="text-xs text-stone-500 mb-4 flex items-center gap-2 flex-wrap" aria-label="Хлебные крошки">
          <a href="/" class="hover:underline">Главная</a>
          <span>/</span>
          <a href="/articles" class="hover:underline">Гайды</a>
          <span>/</span>
          <span class="text-stone-900 font-medium truncate max-w-xs">${escapeHtml(article.title)}</span>
        </nav>

        <header class="mb-8">
          <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 tracking-tight leading-tight mb-4">
            ${escapeHtml(article.title)}
          </h1>
          <p class="text-lg text-stone-600 leading-relaxed mb-6 font-medium">
            ${escapeHtml(article.subtitle || article.excerpt)}
          </p>

          <div class="flex items-center gap-3 text-xs text-stone-600 border-y border-stone-100 py-3">
            <span class="font-semibold text-stone-900">${escapeHtml(article.author.name)}</span>
            <span>·</span>
            <span>${escapeHtml(article.author.role)}</span>
            <span>·</span>
            <time datetime="${article.publishedAt}">${escapeHtml(article.publishedAt)}</time>
            <span>·</span>
            <span>${article.readTimeMin} мин на чтение</span>
          </div>
        </header>

        <figure class="mb-8">
          <img src="${escapeHtml(article.heroImage)}" alt="${escapeHtml(article.title)}" class="w-full rounded-2xl object-cover max-h-[460px]" />
        </figure>

        ${tocHtml}

        <div class="prose prose-stone max-w-none text-stone-800 leading-relaxed">
          ${sectionsHtml}
        </div>

        ${faqHtml}

        <footer class="mt-12 pt-6 border-t border-stone-200">
          <a href="/articles" class="inline-flex items-center text-sm font-semibold text-amber-800 hover:underline">
            ← Вернуться ко всем гайдам и статьям
          </a>
        </footer>
      </article>
    `;

    // Article Structured Data + FAQPage Structured Data
    const articleJsonLd: Record<string, any> = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      'headline': article.title,
      'description': metaDesc,
      'image': [heroImage],
      'datePublished': article.publishedAt,
      'dateModified': article.updatedAt,
      'author': {
        '@type': 'Person',
        'name': article.author.name,
        'jobTitle': article.author.role
      },
      'publisher': {
        '@type': 'Organization',
        'name': 'Кабинет Дома',
        'url': 'https://kabinetdoma.ru',
        'logo': {
          '@type': 'ImageObject',
          'url': 'https://kabinetdoma.ru/logo.png'
        }
      },
      'mainEntityOfPage': {
        '@type': 'WebPage',
        '@id': canonicalUrl
      }
    };

    const finalHtml = injectMeta(baseHtml, {
      title: pageTitle,
      description: metaDesc,
      canonicalUrl,
      ogType: 'article',
      ogImage: heroImage,
      jsonLd: articleJsonLd,
      rootBodyHtml: articlePreRenderHtml
    });

    // Write file for primary slug and all known aliases
    for (const slug of allSlugs) {
      const artDir = path.resolve(distDir, 'article', slug);
      if (!fs.existsSync(artDir)) {
        fs.mkdirSync(artDir, { recursive: true });
      }
      fs.writeFileSync(path.resolve(artDir, 'index.html'), finalHtml, 'utf8');
      pagesGenerated++;
    }
  }

  console.log(`✅ Static generation completed: ${pagesGenerated} HTML pages pre-rendered in dist/`);
}

// Run if executed directly
generateStaticPages();
