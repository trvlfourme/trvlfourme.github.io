import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { GoogleGenAI, Type, Schema } from '@google/genai';
import { packArchive } from './scripts/pack-zip.js';
import { packSourcesArchive } from './scripts/pack-sources.js';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Gemini Status check endpoint
app.get('/api/gemini/status', (_req: Request, res: Response) => {
  const rawEnv = process.env.GEMINI_API_KEY;
  const hasEnvKey = Boolean(rawEnv && rawEnv !== 'MY_GEMINI_API_KEY' && rawEnv.length > 10);
  res.json({
    hasServerKey: hasEnvKey,
    model: 'gemini-3.8-flash'
  });
});

// Gemini API Key Verification Endpoint
app.post('/api/gemini/verify-key', async (req: Request, res: Response) => {
  try {
    const rawEnv = process.env.GEMINI_API_KEY;
    const validEnv = rawEnv && rawEnv !== 'MY_GEMINI_API_KEY' ? rawEnv : undefined;
    const key = (req.headers['x-gemini-api-key'] as string) || req.body?.apiKey || validEnv;
    if (!key) {
      return res.status(400).json({ success: false, error: 'API-ключ не настроен. Введите ваш ключ Gemini.' });
    }
    const ai = new GoogleGenAI({ 
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: 'Ответь кратко одним словом: "АКТИВЕН".'
    });
    return res.json({ 
      success: true, 
      message: 'Подключение к Gemini 3.8 Flash успешно установлено!',
      response: response.text?.trim() 
    });
  } catch (err: any) {
    console.error('Verify key error:', err);
    return res.status(400).json({ 
      success: false, 
      error: err?.message || 'Не удалось проверить ключ Gemini. Проверьте правильность ключа из Google AI Studio.' 
    });
  }
});

// Gemini Article Generation Proxy Endpoint
app.post('/api/gemini/generate-article', async (req: Request, res: Response) => {
  try {
    const { topic, category, targetAudience, primaryKeyword, customInstructions, apiKey: bodyApiKey, feedback, previousArticle, tags } = req.body;
    
    // Support user-provided API key from header or body, otherwise fall back to server env
    const rawEnv = process.env.GEMINI_API_KEY;
    const validEnv = rawEnv && rawEnv !== 'MY_GEMINI_API_KEY' ? rawEnv : undefined;
    const apiKey = (req.headers['x-gemini-api-key'] as string) || bodyApiKey || validEnv;
    if (!apiKey) {
      return res.status(400).json({ 
        error: 'API-ключ Gemini не настроен. Пожалуйста, введите ваш API-ключ в поле вверху страницы.' 
      });
    }

    const ai = new GoogleGenAI({ 
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

    // Dynamic Context Detection
    const tagsText = Array.isArray(tags) ? tags.join(' ') : (tags || '');
    const contextText = `${topic} ${tagsText} ${customInstructions || ''} ${feedback || ''}`.toLowerCase();
    
    const isBalanceTopic = 
      category === 'balance' ||
      /баланс|выгоран|отдых|стресс|личн.*жизн|границ.*работ|устал|психолог|сон|тайм-менеджмент|work-life|work life|режим дня|переработ|цифров.*детокс|ритуал/i.test(contextText);

    const isTravelTopic = 
      category === 'travel' || 
      (!isBalanceTopic && /поездк|путешеств|отпуск|дорог|командировк|номад|самолет|поезд|отел|за рубеж|пляж|вокзал|аэропорт/i.test(contextText));

    const isKidsTopic = 
      category === 'with-kids' || 
      /дет|однушк|шум|семь|малыш/i.test(contextText);

    let domainGuidance = '';
    if (isBalanceTopic) {
      domainGuidance = `
СПЕЦИФИКА ТЕМЫ — WORK-LIFE BALANCE, ПСИХОЛОГИЧЕСКИЕ ГРАНИЦЫ И ЗАЩИТА ОТ ВЫГОРАНИЯ НА УДАЛЕНКЕ:
- СТРОЖАЙШЕЕ ПРАВИЛО: НЕ ПРЕДЛАГАЙ дорожное оборудование, чемоданы, пауэрбанки или GaN-зарядки для путешествий! Это статья про домашнюю жизнь, баланс сил и гармонию!
- Фокусируйся на фундаментальных правилах разделения работы и отдыха:
  1. Физическое и визуальное зонирование: даже в компактной квартире рабочая зона должна «исчезать» после конца рабочего дня (закрытие ноутбука и убирание его с глаз, настольный акустический экран или ширма).
  2. Ритуалы перехода и «Виртуальная дорога домой»: 15-минутная прогулка на свежем воздухе до и после работы, смена домашней одежды, дыхательная пауза без экранов.
  3. Цифровой детокс и гигиена: фиксированное окончание рабочего дня (строго в 18:30–19:00), перевод рабочих мессенджеров в беззвучный режим, полный запрет на проверку почты в постели.
  4. Световые биоритмы и циркадный свет: нейтрально-белый свет 4000–5000K днем для бодрости; теплый янтарный свет 2700K без синего спектра вечером за 2 часа до сна.
  5. Управление вниманием: метод Pomodoro (спринты 50/10 или 25/5), физические таймеры без смартфона, полноразмерные ANC-наушники от бытового шума.
  6. Релевантные инструменты (ТОЛЬКО по теме!): тактильный таймер Pomodoro, настольная лампа с теплым закатным светом 2700K, анатомическая подставка для ног, массажный коврик для вечера, наушники с шумоподавлением.`;
    } else if (isTravelTopic) {
      domainGuidance = `
СПЕЦИФИКА ТЕМЫ — УДАЛЕНКА В ПОЕЗДКЕ / ОТПУСКЕ / КОМАНДИРОВКЕ (WORK & TRAVEL):
- СТРОГОЕ ПРАВИЛО: НЕ НАВЯЗЫВАЙ тяжелую мебель (столы с электроприводом, стационарные кресла, кронштейны для мониторов здесь АБСОЛЮТНО НЕУМЕСТНЫ!).
- Фокусируйся на реальных потребностях мобильного специалиста:
  1. Договоренности с командой и руководством: строгий асинхронный режим, четкие фиксированные «окна связи» (например, строго 1.5-2 часа утром с 8:30 до 10:30 МСК, остальное время — офлайн), публичный статус в Slack/Telegram, делегирование дежурств, алгоритм вежливого отказа спонтанным созвонам.
  2. Подготовка техники и железа: компактные GaN-зарядки (65–100W на 3–4 порта вместо кучи тяжелых блоков), плоский пауэрбанк с Power Delivery 65W/100W (разрешенный в самолет до 100 Вт·ч / 27000 мАч в ручную кладь), качественные кабели с запасом, универсальные переходники под розетки других стран, складная невидимая подставка под ноутбук (MOFT/Nillkin) для шеи в отелях и кафе, портативная гарнитура с микрофоном ENC или наушники с ANC.
  3. Кибербезопасность и софт (особенно при выезде за рубеж): резервный бэкап данных перед вылетом, шифрование диска (BitLocker на Windows Pro, FileVault на macOS на случай утери/кражи), корпоративный VPN/VDI (проверить работу ДО выезда!), двухфакторная аутентификация (2FA) ТОЛЬКО через генераторы кодов (Google Authenticator, Яндекс Ключ, 2FAS), а НЕ через российские SMS, которые не приходят в роуминге или при местной симке.
  4. Связь и форс-мажоры: туристическая eSIM (Airalo, Yesim) vs местная SIM-карта vs роуминг, мобильная точка доступа со смартфона как резерв, поиск ближайшего коворкинга на Google Maps, скачивание офлайн-карт и документов в Google Docs/Notion.
  5. Психологическая граница и защита отпуска: как не отравить отдых семье и себе — железное правило: закрыл крышку ноута в 10:30, убрал в сейф отеля, рабочий мессенджер в беззвучный режим, никакой работы на пляже и за ужином.`;
    } else if (isKidsTopic) {
      domainGuidance = `
СПЕЦИФИКА ТЕМЫ — УДАЛЕНКА В КВАРТИРЕ С ДЕТЬМИ:
- Фокусируйся на акустическом зонировании (ширмы, плотные шторы Blackout), методе визуальных сигналов занятости («Светофор» на двери), гарнитурах со штангой и шумоподавлением микрофона ENC (Jabra, Fifine), синхронизации режима сна ребенка с глубоким фокусом родителей.`;
    } else {
      domainGuidance = `
СПЕЦИФИКА ТЕМЫ — ДОМАШНИЙ КАБИНЕТ И ЭРГОНОМИКА:
- Фокусируйся на анатомии посадки (углы 90–100° в локтях и коленях, ГОСТ 13025.3-85, ГОСТ 21889-76), правильном освещении (СанПиН 1.2.3685-21, скринбары без бликов), подборе столов с электроприводом, ортопедических кресел с сеткой и кабель-менеджменте.`;
    }

    const prompt = `Ты опытный главный редактор и практикующий эксперт портала «Кабинет Дома» (kabinetdoma.ru).
Твоя задача — написать глубокую, живую, увлекательную и невероятно практичную статью, от которой читатель получит 100% прикладной пользы без капли "воды" и без искусственных штампов.

ТЕМА СТАТЬИ: "${topic}"
КАТЕГОРИЯ: "${category || 'balance'}"
ТЭГИ: "${Array.isArray(tags) && tags.length > 0 ? tags.join(', ') : 'Эргономика, Баланс'}"
ЦЕЛЕВАЯ АУДИТОРИЯ: "${targetAudience || 'Специалисты на удаленке в РФ'}"
SEO-КЛЮЧ: "${primaryKeyword || topic}"

${customInstructions ? `
ВАЖНЕЙШЕЕ ТЕХНИЧЕСКОЕ ЗАДАНИЕ ОТ РЕДАКТОРА (ОБЯЗАТЕЛЬНО К ИСПОЛНЕНИЮ):
"${customInstructions}"
ВНИМАНИЕ: Обязательно выстрой структуру и содержание разделов статьи СТРОГО вокруг этих пунктов! 
Раскрой КАЖДЫЙ пункт из ТЗ максимально подробно, выделив под него отдельный содержательный раздел (400–600 слов), с реальными примерами, чек-листами, конкретными моделями устройств и практическими шагами!
` : ''}

${feedback ? `
🔥🔥🔥 ПЕРЕГЕНЕРАЦИЯ С УЧЕТОМ ЗАМЕЧАНИЙ И ПРАВОК ПОЛЬЗОВАТЕЛЯ (КРИТИЧЕСКИЙ ПРИОРИТЕТ):
Пользователь оставил жесткую обратную связь по предыдущей версии материала:
"${feedback}"

${previousArticle ? `
ПРЕДЫДУЩАЯ ВЕРСИЯ СТАТЬИ ДЛЯ РЕФАКТОРИНГА:
- Заголовок: ${previousArticle.title || ''}
- Текущие разделы:
${(previousArticle.sections || []).map((s: any) => `  * ${s.title}: ${String(s.content || '').slice(0, 160)}...`).join('\n')}
` : ''}

ОБЯЗАТЕЛЬНЫЕ ТРЕБОВАНИЯ К ДОРАБОТАННОЙ ВЕРСИИ:
1. Устрани ВСЕ указанные пользователем недостатки без исключения!
2. Если пользователь требует добавить конкретные темы (например: психологические границы, ритуалы перехода, циркадный свет, тайм-менеджмент) — выдели под них отдельные подробные разделы с реальными цифрами и лайфхаками.
3. Если пользователь требует убрать или заменить неуместные рекомендации (например, чемоданы или дорогую мебель в дорогу) — исключи их полностью.
4. Добавь максимальную конкретику, живой слог практикующего эксперта и прикладные советы.
` : ''}

${domainGuidance}

ТРЕБОВАНИЯ К ФОРМАТИРОВАНИЮ И КАЧЕСТВУ ТЕКСТА:
1. Заголовок (title): привлекательный, обещающий конкретное решение проблемы, с упоминанием 2026 года.
2. Подзаголовок (subtitle): емкая фраза о том, кому и в чем статья поможет.
3. Краткое описание (excerpt): 2–3 плотных предложения для анонса в соцсетях и на портале.
4. Разделы (sections): сделай 4–5 полноценных, глубоких разделов.
   В КАЖДОМ РАЗДЕЛЕ (content):
   - КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНЫ скучные общие фразы («В современном мире...», «Ни для кого не секрет...», «Это очень важно...»)!
   - КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО писать служебные мета-заголовки вроде «Ключевая задача раздела», «Исходное требование», «ТЗ от автора»! Начинай раздел сразу с практической сути.
   - Используй структурированный текст: подзаголовки, маркированные списки с выделенными терминами, алгоритмы, блоки с предупреждениями (⚠️ Внимание: ...), советы профессионалов (💡 Лайфхак: ...).
   - Приводи реальные названия подходящих технологий, методик и проверенных устройств, СТРОГО соответствующих теме статьи. Если статья про баланс работы и жизни — приводи циркадное освещение 2700–5000K, технику тайм-боксинга, физические таймеры Pomodoro, ANC-наушники и анатомическую разгрузку; если про эргономику — углы 90°, регулируемые механизмы мультиблок и скринбары; если про поездку — ультракомпактное GaN-питание и eSIM. КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО упоминать нерелевантные девайсы (например, дорожные зарядки или чемоданы в статьях про баланс или осанку)!
   - Объем текста каждого раздела должен быть обстоятельным (3–5 содержательных абзацев и списков), чтобы материал читался как первоклассный лонгрид уровня Habr / Tinkoff Journal.
5. Резюме эксперта (conclusion): четкий финальный вывод и золотое правило.
6. FAQ: 3–4 самых острых и насущных вопроса с исчерпывающими практическими ответами.
7. SEO: привлекательный metaTitle (до 60 знаков), информативный metaDescription (до 160 знаков), primaryKeyword и список secondaryKeywords.`;

    const articleSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        subtitle: { type: Type.STRING },
        excerpt: { type: Type.STRING },
        readTimeMin: { type: Type.INTEGER },
        tableOfContents: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              label: { type: Type.STRING }
            },
            required: ['id', 'label']
          }
        },
        sections: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              content: { type: Type.STRING },
              productKeywords: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ['id', 'title', 'content']
          }
        },
        conclusion: { type: Type.STRING },
        faqList: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              answer: { type: Type.STRING }
            },
            required: ['question', 'answer']
          }
        },
        seo: {
          type: Type.OBJECT,
          properties: {
            metaTitle: { type: Type.STRING },
            metaDescription: { type: Type.STRING },
            primaryKeyword: { type: Type.STRING },
            secondaryKeywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ['metaTitle', 'metaDescription', 'primaryKeyword']
        },
        tags: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      },
      required: [
        'title',
        'subtitle',
        'excerpt',
        'readTimeMin',
        'tableOfContents',
        'sections',
        'conclusion',
        'faqList',
        'seo'
      ]
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: articleSchema,
        temperature: 0.7
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    const providedTags = Array.isArray(tags) && tags.length > 0 ? tags : [];
    const modelTags = Array.isArray(parsed.tags) && parsed.tags.length > 0 ? parsed.tags : [];
    const finalTags = Array.from(new Set([...providedTags, ...modelTags]));

    const enriched = {
      ...parsed,
      tags: finalTags.length > 0 ? finalTags : ['Эргономика', 'Продуктивность'],
      isAiGenerated: true,
      generatedBy: 'gemini',
      aiVerificationNotice: 'Материал структурирован ИИ-ассистентом на основе редакторских стандартов 2026 года и проверен профильным экспертом Кабинет Дома.'
    };
    return res.json({ success: true, article: enriched });
  } catch (error: any) {
    console.error('Gemini generate-article error:', error);
    return res.status(500).json({ 
      error: error?.message || 'Failed to generate article via Gemini API' 
    });
  }
});

// Gemini Article Audit & Update Proxy Endpoint
app.post('/api/gemini/audit-article', async (req: Request, res: Response) => {
  try {
    const { article } = req.body;
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ 
        error: 'GEMINI_API_KEY is not configured in server environment' 
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `Ты старший редактор и аналитик портала «Кабинет Дома» (kabinetdoma.ru).
Проведи аудит следующей статьи на актуальность для осени 2026 года в РФ.

Статья:
Название: "${article.title}"
Категория: "${article.category}"
Текст разделов:
${article.sections?.map((s: any) => `### ${s.title}\n${s.content}`).join('\n\n')}

Проанализируй:
1. Насколько советы соответствуют актуальным реалиям 2026 года (цены, доступность брендов в РФ на Яндекс Маркете/Ozon/WB).
2. Какие современные альтернативы или новые решения стоит добавить (например, новые стандарты скринбаров, свежие линейки кресел Metta или Sihoo, столы с USB-C хабами в столешнице).
3. Что устарело или требует уточнения.
4. Предложи 3 конкретных улучшения с готовыми абзацами текста, которые можно сразу вставить в статью.`;

    const auditSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        currencyScore: { type: Type.INTEGER }, // 0 - 100
        summary: { type: Type.STRING },
        outdatedPoints: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        },
        freshGearRecommendations: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING },
              modelName: { type: Type.STRING },
              reasonToInclude: { type: Type.STRING },
              approxPriceRub: { type: Type.INTEGER }
            },
            required: ['category', 'modelName', 'reasonToInclude', 'approxPriceRub']
          }
        },
        suggestedTextAdditions: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              targetSectionId: { type: Type.STRING },
              proposedParagraph: { type: Type.STRING }
            },
            required: ['proposedParagraph']
          }
        }
      },
      required: ['currencyScore', 'summary', 'outdatedPoints', 'freshGearRecommendations', 'suggestedTextAdditions']
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: auditSchema,
        temperature: 0.5
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, audit: parsed });
  } catch (error: any) {
    console.error('Gemini audit-article error:', error);
    return res.status(500).json({ 
      error: error?.message || 'Failed to audit article via Gemini API' 
    });
  }
});

// Gemini Imagen Image Generation Proxy Endpoint
app.post('/api/gemini/generate-image', async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;
    const apiKey = (req.headers['x-gemini-api-key'] as string) || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ 
        error: 'GEMINI_API_KEY is not configured in server environment or header' 
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

    const enhancedPrompt = `Photorealistic editorial lifestyle photography, 8k resolution, authentic natural light, interior design photography: ${prompt}. Professional shot for a modern remote work and ergonomics publication, natural realistic human workspace, zero cartoon style, high quality textures.`;

    const response = await ai.models.generateImages({
      model: 'imagen-3.0-generate-002',
      prompt: enhancedPrompt,
      config: {
        numberOfImages: 1,
        aspectRatio: '16:9',
        outputMimeType: 'image/jpeg'
      }
    });

    if (response.generatedImages && response.generatedImages[0]?.image?.imageBytes) {
      const base64Image = `data:image/jpeg;base64,${response.generatedImages[0].image.imageBytes}`;
      return res.json({ success: true, imageUrl: base64Image });
    }

    return res.status(500).json({ error: 'Image generation model did not return image data' });
  } catch (error: any) {
    console.error('Gemini generate-image error:', error);
    return res.status(500).json({ 
      error: error?.message || 'Failed to generate image via Gemini Imagen' 
    });
  }
});

// Archive management endpoints (Static Build & Sources)
app.get('/api/archive-info', (_req: Request, res: Response) => {
  try {
    const publicDir = path.resolve(process.cwd(), 'public');
    const infoPath = path.join(publicDir, 'archive-info.json');
    if (fs.existsSync(infoPath)) {
      const data = JSON.parse(fs.readFileSync(infoPath, 'utf-8'));
      return res.json({ success: true, archive: data });
    }
    const files = fs.existsSync(publicDir) ? fs.readdirSync(publicDir) : [];
    const zips = files.filter(f => !f.includes('sources') && f.startsWith('kabinetdoma-') && f.endsWith('.zip'));
    if (zips.length > 0) {
      zips.sort().reverse();
      const latest = zips[0];
      const stat = fs.statSync(path.join(publicDir, latest));
      const sizeMb = (stat.size / (1024 * 1024)).toFixed(2);
      return res.json({
        success: true,
        archive: {
          filename: latest,
          url: `/${latest}`,
          sizeBytes: stat.size,
          sizeFormatted: `${sizeMb} МБ`,
          date: latest.split('-').slice(1, 4).join('-'),
          version: latest.match(/-v(\d+)\.zip$/)?.[1] || '1',
          updatedAt: stat.mtime.toISOString()
        }
      });
    }
    return res.status(404).json({ success: false, error: 'Архив еще не сформирован' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'Error fetching archive info' });
  }
});

// Sources archive info endpoint
app.get('/api/sources-info', (_req: Request, res: Response) => {
  try {
    const publicDir = path.resolve(process.cwd(), 'public');
    const infoPath = path.join(publicDir, 'sources-info.json');
    if (fs.existsSync(infoPath)) {
      const data = JSON.parse(fs.readFileSync(infoPath, 'utf-8'));
      return res.json({ success: true, sources: data });
    }
    const files = fs.existsSync(publicDir) ? fs.readdirSync(publicDir) : [];
    const zips = files.filter(f => f.startsWith('kabinetdoma-sources-') && f.endsWith('.zip') && f !== 'kabinetdoma-sources-latest.zip');
    if (zips.length > 0) {
      zips.sort().reverse();
      const latest = zips[0];
      const stat = fs.statSync(path.join(publicDir, latest));
      const sizeMb = (stat.size / (1024 * 1024)).toFixed(2);
      return res.json({
        success: true,
        sources: {
          filename: latest,
          url: `/${latest}`,
          latestUrl: '/kabinetdoma-sources-latest.zip',
          sizeBytes: stat.size,
          sizeFormatted: `${sizeMb} МБ`,
          date: latest.split('-').slice(2, 5).join('-'),
          version: latest.match(/-v(\d+)\.zip$/)?.[1] || '1',
          updatedAt: stat.mtime.toISOString()
        }
      });
    }
    return res.status(404).json({ success: false, error: 'Архив исходников еще не сформирован' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'Error fetching sources info' });
  }
});

// Trigger fresh archive build (Static website)
app.post('/api/build-archive', async (req: Request, res: Response) => {
  try {
    const version = req.body?.version ? parseInt(req.body.version, 10) : undefined;
    const info = await packArchive(version);
    return res.json({ success: true, archive: info });
  } catch (err: any) {
    console.error('Error generating archive:', err);
    return res.status(500).json({ success: false, error: err?.message || 'Failed to pack archive' });
  }
});

// Trigger fresh sources archive build
app.post('/api/build-sources-archive', async (req: Request, res: Response) => {
  try {
    const version = req.body?.version ? parseInt(req.body.version, 10) : undefined;
    const info = await packSourcesArchive(version);
    return res.json({ success: true, sources: info });
  } catch (err: any) {
    console.error('Error generating sources archive:', err);
    return res.status(500).json({ success: false, error: err?.message || 'Failed to pack sources archive' });
  }
});

// Redirects to latest archives
app.get(['/kabinetdoma-sources.zip', '/sources.zip', '/latest-sources.zip'], (_req: Request, res: Response) => {
  const publicDir = path.resolve(process.cwd(), 'public');
  const files = fs.existsSync(publicDir) ? fs.readdirSync(publicDir) : [];
  const zips = files.filter(f => f.startsWith('kabinetdoma-sources-') && f.endsWith('.zip') && f !== 'kabinetdoma-sources-latest.zip').sort().reverse();
  if (zips.length > 0) {
    return res.redirect(302, `/${zips[0]}`);
  }
  if (fs.existsSync(path.join(publicDir, 'kabinetdoma-sources-latest.zip'))) {
    return res.redirect(302, '/kabinetdoma-sources-latest.zip');
  }
  return res.status(404).send('Архив исходников не найден');
});

app.get(['/kabinetdoma-site.zip', '/home4work-site.zip'], (_req: Request, res: Response) => {
  const publicDir = path.resolve(process.cwd(), 'public');
  const files = fs.existsSync(publicDir) ? fs.readdirSync(publicDir) : [];
  const zips = files.filter(f => !f.includes('sources') && f.startsWith('kabinetdoma-') && f.endsWith('.zip')).sort().reverse();
  if (zips.length > 0) {
    return res.redirect(302, `/${zips[0]}`);
  }
  return res.status(404).send('Архив не найден');
});

// Vite middleware in dev or static files in prod
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
