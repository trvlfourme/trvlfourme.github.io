import React, { useState, useMemo } from 'react';
import { 
  X, 
  Sparkles, 
  Edit3, 
  ExternalLink, 
  Check, 
  Download, 
  Copy, 
  RefreshCw, 
  Bot, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Sliders, 
  Save, 
  Trash2, 
  Plus, 
  Eye, 
  Clock,
  Layers,
  Calendar,
  FileCode,
  GitBranch,
  Search,
  KeyRound,
  CheckCheck,
  Tag,
  Hash
} from 'lucide-react';
import { Article, Category, ProductItem } from '../types';
import { CATEGORIES, POPULAR_TAGS, getTagsForArticle } from '../data/contentData';
import { PRODUCTS_CATALOG } from '../data/products';
import { generateArticleWithGemini, auditArticleWithGemini, verifyGeminiApiKey, getGeminiServerStatus, AuditReport } from '../utils/aiPipeline';
import { buildPartnerUrl } from '../utils/affiliate';
import { stripMarkdownSymbols } from '../utils/textCleaner';
import { cleanTemplateArtifacts } from './MarkdownRenderer';

interface PublisherAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  articles: Article[];
  onSaveArticles: (updated: Article[]) => void;
  onResetArticles: () => void;
}

export const PublisherAdminModal: React.FC<PublisherAdminModalProps> = ({
  isOpen,
  onClose,
  articles,
  onSaveArticles,
  onResetArticles
}) => {
  const [activeTab, setActiveTab] = useState<'generator' | 'editor' | 'audit' | 'export' | 'agents' | 'affiliate'>('generator');
  
  // AI Generator state
  const [genTopic, setGenTopic] = useState('');
  const [genCategory, setGenCategory] = useState<Category>('balance');
  const [genTags, setGenTags] = useState<string[]>(['Баланс', 'Work-Life', 'Эргономика']);
  const [newTagInput, setNewTagInput] = useState('');
  const [editorTagInput, setEditorTagInput] = useState('');
  const [genAudience, setGenAudience] = useState('Удаленщики в типовых квартирах РФ');
  const [genKeyword, setGenKeyword] = useState('');
  const [genInstructions, setGenInstructions] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(1);
  const [generatedArticle, setGeneratedArticle] = useState<Article | null>(null);
  const [genSuccessMsg, setGenSuccessMsg] = useState(false);
  const [refineFeedback, setRefineFeedback] = useState('');
  const [isRefining, setIsRefining] = useState(false);

  // Gemini API Key state
  const [customApiKey, setCustomApiKey] = useState(() => {
    return typeof window !== 'undefined' ? localStorage.getItem('kd_gemini_api_key') || '' : '';
  });
  const [serverHasKey, setServerHasKey] = useState(false);
  const [isVerifyingKey, setIsVerifyingKey] = useState(false);
  const [apiKeyStatus, setApiKeyStatus] = useState<{ checked: boolean; success?: boolean; message?: string }>({
    checked: false
  });

  // Check key status on modal open
  React.useEffect(() => {
    if (isOpen) {
      getGeminiServerStatus().then(status => {
        setServerHasKey(status.hasServerKey);
        if (customApiKey.trim()) {
          verifyGeminiApiKey(customApiKey.trim()).then(res => {
            setApiKeyStatus({ checked: true, success: res.success, message: res.message });
          });
        }
      });
    }
  }, [isOpen]);

  // Editor state
  const [selectedArticleId, setSelectedArticleId] = useState<string>(articles[0]?.id || '');
  const editingArticle = articles.find(a => a.id === selectedArticleId) || articles[0];
  const [editForm, setEditForm] = useState<Article | null>(editingArticle || null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imagePrompt, setImagePrompt] = useState('');

  // Audit state
  const [auditTargetId, setAuditTargetId] = useState<string>(articles[0]?.id || '');
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditReport, setAuditReport] = useState<AuditReport | null>(null);

  // Export & Archive state
  const [copiedCode, setCopiedCode] = useState(false);
  const [archiveInfo, setArchiveInfo] = useState<{
    filename: string;
    url: string;
    sizeFormatted: string;
    date: string;
    version: number;
  }>({
    filename: 'kabinetdoma-2026-10-13-v1.zip',
    url: '/kabinetdoma-2026-10-13-v1.zip',
    sizeFormatted: '10.3 МБ',
    date: '2026-11-04',
    version: 1
  });
  const [isBuildingArchive, setIsBuildingArchive] = useState(false);
  const [archiveSuccessMsg, setArchiveSuccessMsg] = useState('');

  // Sources archive state
  const [sourcesInfo, setSourcesInfo] = useState<{
    filename: string;
    url: string;
    latestUrl?: string;
    sizeFormatted: string;
    date: string;
    version: number;
  }>({
    filename: 'kabinetdoma-sources-2026-11-04-v1.zip',
    url: '/kabinetdoma-sources-2026-11-04-v1.zip',
    latestUrl: '/kabinetdoma-sources-latest.zip',
    sizeFormatted: '15.8 МБ',
    date: '2026-11-04',
    version: 1
  });
  const [isBuildingSources, setIsBuildingSources] = useState(false);
  const [sourcesSuccessMsg, setSourcesSuccessMsg] = useState('');

  // Fetch archive info & sources info on open
  React.useEffect(() => {
    if (isOpen) {
      fetch('/api/archive-info')
        .then(r => r.json())
        .then(data => {
          if (data?.archive) {
            setArchiveInfo(data.archive);
          }
        })
        .catch(() => {});

      fetch('/api/sources-info')
        .then(r => r.json())
        .then(data => {
          if (data?.sources) {
            setSourcesInfo(data.sources);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  const handleRebuildArchive = async () => {
    setIsBuildingArchive(true);
    setArchiveSuccessMsg('');
    try {
      const nextVer = (archiveInfo.version || 1) + 1;
      const res = await fetch('/api/build-archive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ version: nextVer })
      });
      const data = await res.json();
      if (data?.archive) {
        setArchiveInfo(data.archive);
        setArchiveSuccessMsg(`Архив успешно собран: ${data.archive.filename}`);
      }
    } catch (e: any) {
      console.error('Failed to rebuild archive:', e);
    } finally {
      setIsBuildingArchive(false);
    }
  };

  const handleRebuildSources = async () => {
    setIsBuildingSources(true);
    setSourcesSuccessMsg('');
    try {
      const nextVer = (sourcesInfo.version || 1) + 1;
      const res = await fetch('/api/build-sources-archive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ version: nextVer })
      });
      const data = await res.json();
      if (data?.sources) {
        setSourcesInfo(data.sources);
        setSourcesSuccessMsg(`Архив исходников обновлен: ${data.sources.filename}`);
      }
    } catch (e: any) {
      console.error('Failed to rebuild sources archive:', e);
    } finally {
      setIsBuildingSources(false);
    }
  };

  // All unique system tags (popular tags + tags from current articles)
  const allAvailableSystemTags = useMemo(() => {
    const set = new Set<string>(POPULAR_TAGS);
    articles.forEach(a => {
      const tList = a.tags || getTagsForArticle(a);
      tList.forEach(t => set.add(t));
    });
    return Array.from(set);
  }, [articles]);

  if (!isOpen) return null;

  // Tag management handlers
  const handleToggleGenTag = (tag: string) => {
    if (genTags.includes(tag)) {
      setGenTags(genTags.filter(t => t !== tag));
    } else {
      setGenTags([...genTags, tag]);
    }
  };

  const handleAddCustomGenTag = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const raw = newTagInput.trim();
    if (!raw) return;
    const parts = raw.split(/[,;\n]+/).map(p => p.trim().replace(/^#+/, '')).filter(Boolean);
    if (parts.length === 0) return;
    const next = [...genTags];
    parts.forEach(p => {
      if (!next.includes(p)) next.push(p);
    });
    setGenTags(next);
    setNewTagInput('');
  };

  const handleRemoveGenTag = (tag: string) => {
    setGenTags(genTags.filter(t => t !== tag));
  };

  const handleAutoSuggestTagsForTopic = () => {
    const text = `${genTopic} ${genInstructions}`.toLowerCase();
    const matched: string[] = [];
    if (/баланс|выгоран|отдых|стресс|work-life|жизн|сон|вечер|ритуал/i.test(text)) {
      matched.push('Баланс', 'Work-Life', 'Биоритмы и сон');
    }
    if (/дет|ребенок|семь|малыш/i.test(text)) {
      matched.push('С детьми', 'Зонирование');
    }
    if (/стол|электропривод|подъемн|стоя/i.test(text)) {
      matched.push('Столы', 'Эргономика');
    }
    if (/кресл|стул|осанк|спин|поясниц/i.test(text)) {
      matched.push('Кресла', 'Осанка', 'Здоровье спины');
    }
    if (/свет|лампа|скринбар|зрени|глаз/i.test(text)) {
      matched.push('Освещение', 'Зрение');
    }
    if (/микрофон|звук|шум|звонк|созвон|гарнитур|anc/i.test(text)) {
      matched.push('Звук и шум', 'Микрофоны', 'Созвоны');
    }
    if (/кабел|провод|порядок|удлинител/i.test(text)) {
      matched.push('Кабель-менеджмент', 'Порядок');
    }
    if (/поездк|дорог|отпуск|путешеств|номад|gan|esim/i.test(text)) {
      matched.push('Поездки', 'Техника в дорогу', 'Автономность');
    }
    if (/квартир|однушк|студи|комнат|зонирован/i.test(text)) {
      matched.push('Компактная квартира', 'Планировка', 'Зонирование');
    }
    if (/бюджет|недорог|дешев/i.test(text)) {
      matched.push('Бюджетный сетап');
    }
    if (matched.length === 0) {
      matched.push('Эргономика', 'Продуктивность');
    }
    const merged = Array.from(new Set([...genTags, ...matched]));
    setGenTags(merged);
  };

  const handleToggleEditTag = (tag: string) => {
    if (!editForm) return;
    const current = editForm.tags || getTagsForArticle(editForm);
    const updated = current.includes(tag)
      ? current.filter(t => t !== tag)
      : [...current, tag];
    setEditForm({ ...editForm, tags: updated });
  };

  const handleAddCustomEditTag = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editForm) return;
    const raw = editorTagInput.trim();
    if (!raw) return;
    const parts = raw.split(/[,;\n]+/).map(p => p.trim().replace(/^#+/, '')).filter(Boolean);
    if (parts.length === 0) return;
    const current = editForm.tags || getTagsForArticle(editForm);
    const next = [...current];
    parts.forEach(p => {
      if (!next.includes(p)) next.push(p);
    });
    setEditForm({ ...editForm, tags: next });
    setEditorTagInput('');
  };

  const handleRemoveEditTag = (tag: string) => {
    if (!editForm) return;
    const current = editForm.tags || getTagsForArticle(editForm);
    setEditForm({ ...editForm, tags: current.filter(t => t !== tag) });
  };

  // Handle switching article to edit
  const handleSelectArticleToEdit = (id: string) => {
    setSelectedArticleId(id);
    const target = articles.find(a => a.id === id);
    if (target) {
      setEditForm(JSON.parse(JSON.stringify(target)));
    }
  };

  // Verify API Key
  const handleVerifyApiKey = async () => {
    setIsVerifyingKey(true);
    try {
      const res = await verifyGeminiApiKey(customApiKey);
      setApiKeyStatus({ checked: true, success: res.success, message: res.message });
      if (res.success && customApiKey) {
        localStorage.setItem('kd_gemini_api_key', customApiKey);
      }
    } catch (err: any) {
      setApiKeyStatus({ checked: true, success: false, message: err?.message || 'Ошибка проверки ключа' });
    } finally {
      setIsVerifyingKey(false);
    }
  };

  const handleSaveApiKey = () => {
    if (typeof window !== 'undefined') {
      if (customApiKey.trim()) {
        localStorage.setItem('kd_gemini_api_key', customApiKey.trim());
      } else {
        localStorage.removeItem('kd_gemini_api_key');
      }
      handleVerifyApiKey();
    }
  };

  // Generate article handler
  const handleRunAiGenerator = async () => {
    if (!genTopic.trim()) return;
    setIsGenerating(true);
    setGenSuccessMsg(false);
    setGenerationStep(1);

    const stepInterval = setInterval(() => {
      setGenerationStep(s => (s < 4 ? s + 1 : s));
    }, 4000);

    try {
      const result = await generateArticleWithGemini({
        topic: genTopic,
        category: genCategory,
        tags: genTags,
        targetAudience: genAudience,
        primaryKeyword: genKeyword || genTopic,
        customInstructions: genInstructions,
        apiKey: customApiKey.trim() || undefined
      });
      clearInterval(stepInterval);
      const cleanedSections = (result.sections || []).map(s => ({
        ...s,
        title: (s.title || '').replace(/^#{1,6}\s*/, '').trim(),
        content: cleanTemplateArtifacts(s.content || '')
      }));
      const combinedTags = Array.from(new Set([
        ...genTags,
        ...((result.tags && result.tags.length > 0) ? result.tags : getTagsForArticle({ category: genCategory, title: genTopic }))
      ]));
      const cleanedArticle = { 
        ...result, 
        sections: cleanedSections,
        tags: combinedTags.length > 0 ? combinedTags : ['Эргономика', 'Продуктивность']
      };
      setGeneratedArticle(cleanedArticle);
      // Auto-save to articles list
      const updated = [cleanedArticle, ...articles];
      onSaveArticles(updated);
      setSelectedArticleId(cleanedArticle.id);
      setEditForm(JSON.parse(JSON.stringify(cleanedArticle)));
      setGenSuccessMsg(true);
    } catch (err) {
      console.error('Failed to generate article:', err);
    } finally {
      clearInterval(stepInterval);
      setIsGenerating(false);
    }
  };

  // Save edited article
  const handleSaveEditedArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm) return;
    const updated = articles.map(a => a.id === editForm.id ? editForm : a);
    onSaveArticles(updated);
    setSaveSuccessMsg(true);
    setTimeout(() => setSaveSuccessMsg(false), 2500);
  };

  // Delete article handler
  const handleDeleteArticle = (articleId: string) => {
    const target = articles.find(a => a.id === articleId);
    if (!target) return;
    const confirmMessage = `Вы действительно хотите удалить статью «${target.title}»?\nЭто действие удалит статью из каталога, меню и карты сайта sitemap.xml.`;
    if (!window.confirm(confirmMessage)) {
      return;
    }
    const updated = articles.filter(a => a.id !== articleId);
    onSaveArticles(updated);
    if (selectedArticleId === articleId) {
      if (updated.length > 0) {
        setSelectedArticleId(updated[0].id);
        setEditForm(JSON.parse(JSON.stringify(updated[0])));
      } else {
        setSelectedArticleId('');
        setEditForm(null);
      }
    }
    if (generatedArticle?.id === articleId) {
      setGeneratedArticle(null);
    }
    alert(`Статья «${target.title}» успешно удалена.`);
  };

  // Regenerate / refine article with feedback
  const handleRegenerateWithFeedback = async (baseArticle: Article, feedbackText: string) => {
    if (!feedbackText.trim()) return;
    setIsRefining(true);
    try {
      const result = await generateArticleWithGemini({
        topic: baseArticle.title,
        category: baseArticle.category as Category,
        tags: baseArticle.tags || genTags,
        primaryKeyword: baseArticle.seo?.primaryKeyword || baseArticle.title,
        customInstructions: genInstructions || '',
        feedback: feedbackText.trim(),
        previousArticle: baseArticle,
        apiKey: customApiKey.trim() || undefined
      });
      // Update article in state with cleaned sections
      const cleanedSections = (result.sections || []).map(s => ({
        ...s,
        title: (s.title || '').replace(/^#{1,6}\s*/, '').trim(),
        content: cleanTemplateArtifacts(s.content || '')
      }));
      const cleanedArticle = { 
        ...result, 
        sections: cleanedSections, 
        tags: result.tags || baseArticle.tags || genTags,
        id: baseArticle.id, 
        slug: baseArticle.slug 
      };
      const updated = articles.map(a => a.id === baseArticle.id ? cleanedArticle : a);
      onSaveArticles(updated);
      setGeneratedArticle(cleanedArticle);
      setEditForm(cleanedArticle);
      setRefineFeedback('');
      alert('Статья успешно перегенерирована с учетом ваших замечаний и сохранена!');
    } catch (err: any) {
      console.error('Failed to regenerate article:', err);
      alert('Ошибка при перегенерации статьи: ' + (err.message || 'Попробуйте снова'));
    } finally {
      setIsRefining(false);
    }
  };

  // Generate unique realistic image with Gemini Imagen
  const handleGenerateImageWithGemini = async () => {
    if (!editForm) return;
    const promptToUse = imagePrompt.trim() || editForm.title || 'Современное эргономичное рабочее место дома с мягким светом';
    setIsGeneratingImage(true);
    try {
      const res = await fetch('/api/gemini/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(customApiKey.trim() ? { 'x-gemini-api-key': customApiKey.trim() } : {})
        },
        body: JSON.stringify({ prompt: promptToUse })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.imageUrl) {
          setEditForm({ ...editForm, heroImage: data.imageUrl });
          alert('Реалистичное фото успешно сгенерировано нейросетью Gemini Imagen и установлено!');
        } else {
          throw new Error(data.error || 'Не удалось сгенерировать изображение');
        }
      } else {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Ошибка запроса к Gemini Imagen');
      }
    } catch (err: any) {
      console.warn('Gemini image generation warning:', err);
      // Helpful fallback suggestion
      alert('Генерация изображения через Gemini: ' + (err.message || 'Проверьте API-ключ') + '\nВы также можете выбрать готовое студийное фото из коллекции ниже.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Run AI Audit handler
  const handleRunAiAudit = async () => {
    const target = articles.find(a => a.id === auditTargetId);
    if (!target) return;
    setIsAuditing(true);
    try {
      const report = await auditArticleWithGemini(target);
      setAuditReport(report);
    } catch (err) {
      console.error('Audit failed:', err);
    } finally {
      setIsAuditing(false);
    }
  };

  // Apply audit suggestions to article
  const handleApplyAuditSuggestions = () => {
    if (!auditReport || !editForm) return;
    const newSection = {
      id: `sec-audit-update-${Date.now().toString().slice(-4)}`,
      title: 'Актуализация 2026: свежие рекомендации экспертов',
      content: auditReport.suggestedTextAdditions.map(s => s.proposedParagraph).join('\n\n')
    };
    const updated: Article = {
      ...editForm,
      updatedAt: '05 октября 2026',
      sections: [...editForm.sections, newSection]
    };
    setEditForm(updated);
    const updatedArticles = articles.map(a => a.id === updated.id ? updated : a);
    onSaveArticles(updatedArticles);
    alert('Рекомендации ИИ успешно добавлены в статью!');
  };

  // Download updated contentData.ts
  const handleDownloadContentDataFile = () => {
    const fileContent = generateContentDataTypeScript(articles);
    const blob = new Blob([fileContent], { type: 'text/typescript;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'contentData.ts');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Copy contentData.ts to clipboard
  const handleCopyCode = () => {
    const fileContent = generateContentDataTypeScript(articles);
    navigator.clipboard.writeText(fileContent);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-stone-200">
        
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-stone-950 flex items-center justify-center font-bold text-sm">
              КД
            </div>
            <div>
              <h2 className="font-bold text-base flex items-center gap-2">
                Редакторская студия «Кабинет Дома»
                <span className="text-[10px] font-mono font-medium text-amber-300 bg-amber-900/40 px-2 py-0.5 rounded border border-amber-500/30">
                  Скрытый раздел редакции
                </span>
              </h2>
              <p className="text-[11px] text-stone-400">
                Генерация на Gemini 3.8 Flash · Проверка ссылок без авточехлов · Экспорт в 1 клик
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-6 border-b border-stone-200 bg-stone-50 overflow-x-auto text-xs font-semibold py-2">
          <button
            onClick={() => setActiveTab('generator')}
            className={`px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'generator'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            AI-Генератор статей
          </button>

          <button
            onClick={() => setActiveTab('editor')}
            className={`px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'editor'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5 text-blue-400" />
            Редактор и проверка ссылок ({articles.length})
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'audit'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
            AI-Аудит актуальности (2026)
          </button>

          <button
            onClick={() => setActiveTab('export')}
            className={`px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'export'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200'
            }`}
          >
            <Download className="w-3.5 h-3.5 text-purple-400" />
            Экспорт файла contentData.ts
          </button>

          <button
            onClick={() => setActiveTab('agents')}
            className={`px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'agents'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5 text-amber-500" />
            Агенты по расписанию (GitHub)
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6 text-stone-800 text-sm">
          
          {/* TAB 1: AI GENERATOR */}
          {activeTab === 'generator' && (
            <div className="max-w-3xl mx-auto space-y-6">
              
              {/* Header Box */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-bold mb-1">Генерация экспертного контента через Gemini 3.8 Flash</div>
                  <div>
                    Нейросеть генерирует глубокие прикладные статьи без шаблонной «воды»: точные технические решения, 
                    пошаговые чек-листы, кибербезопасность, адаптация под категорию (включая поездки, работу с детьми и мебель) и SEO-разметка.
                  </div>
                </div>
              </div>

              {/* API Key Box */}
              <div className="bg-stone-50 border border-stone-300 rounded-2xl p-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-bold text-stone-900">API-ключ Google Gemini:</span>
                    {apiKeyStatus.checked && apiKeyStatus.success ? (
                      <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Ключ активен (Gemini 3.8 Flash)
                      </span>
                    ) : serverHasKey ? (
                      <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-emerald-100 text-emerald-800 border border-emerald-300">
                        Серверный ключ подключен
                      </span>
                    ) : (
                      <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-800 border border-amber-300">
                        {customApiKey.trim() ? 'Требуется проверка' : 'Ключ не введен (вставьте ключ ниже)'}
                      </span>
                    )}
                  </div>

                  <a 
                    href="https://aistudio.google.com/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1 underline"
                  >
                    Получить бесплатный ключ в Google AI Studio
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="space-y-2">
                  <p className="text-[11px] text-stone-600 leading-relaxed">
                    Для полноценной генерации статей нейросетью в реальном времени используется модель <strong>Gemini 3.8 Flash</strong>. 
                    Если у вас есть API-ключ, вставьте его сюда и нажмите кнопку — он надежно сохранится в вашем браузере.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="password"
                      value={customApiKey}
                      onChange={(e) => setCustomApiKey(e.target.value)}
                      placeholder="Вставьте ваш API-ключ вида AIzaSy..."
                      className="flex-1 px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg outline-none font-mono focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    />
                    <button
                      type="button"
                      disabled={isVerifyingKey || !customApiKey.trim()}
                      onClick={handleSaveApiKey}
                      className="px-4 py-2 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {isVerifyingKey ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Проверка...
                        </>
                      ) : (
                        <>
                          <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                          Проверить и сохранить
                        </>
                      )}
                    </button>
                  </div>
                  {apiKeyStatus.checked && (
                    <div className={`text-[11px] font-medium flex items-center gap-1.5 mt-1 ${
                      apiKeyStatus.success ? 'text-emerald-700' : 'text-rose-600'
                    }`}>
                      {apiKeyStatus.success ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                      {apiKeyStatus.message}
                    </div>
                  )}
                </div>
              </div>

              {/* Topic quick presets */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-2">
                  Быстрые темы в один клик:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setGenTopic('Баланс работы и личной жизни на удаленке (Work-Life Balance)');
                      setGenCategory('balance');
                      setGenTags(['Баланс', 'Work-Life', 'Биоритмы и сон', 'Тайм-менеджмент']);
                      setGenKeyword('баланс работы и личной жизни на удаленке');
                      setGenInstructions(`1. Физическое зонирование и ритуал завершения дня: как «закрыть офис» в квартире и убрать ноутбук из зоны видимости.
2. Техника «Виртуальная дорога домой»: утренние и вечерние буферные прогулки для сброса кортизола.
3. Цифровой детокс и защита вечера: отключение рабочих уведомлений в 19:00 и преодоление чувства вины за отдых.
4. Световые циркадные биоритмы: дневной свет 4000K и теплый закатный свет 2700K без синего спектра перед сном.
5. Спринты глубокого фокуса без выгорания: метод Pomodoro, физические таймеры без смартфона и ANC-наушники от бытового шума.`);
                    }}
                    className="p-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-emerald-950 transition-colors text-left flex items-start gap-2 cursor-pointer"
                  >
                    <span className="text-base">🌿</span>
                    <div>
                      <div className="font-bold">Баланс работы и личной жизни</div>
                      <div className="text-[11px] text-emerald-700">Work-Life Balance, границы вечера, циркадный свет</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setGenTopic('Как подготовиться к удаленной работе во время поездки');
                      setGenCategory('other');
                      setGenTags(['Поездки', 'Техника в дорогу', 'Автономность', 'Work-Life']);
                      setGenKeyword('удаленная работа в поездке');
                      setGenInstructions(`1. Что с собой взять из техники (GaN-зарядка 100W, тонкий пауэрбанк для ноутбука с Power Delivery, складная подставка под ноутбук, кабели, переходники под розетки).
2. О чем договориться с коллегами и руководителем (асинхронный режим, окна связи 1-2 часа утром, статус в мессенджере, делегирование дежурств, как сказать «нет» спонтанным созвонам).
3. Как подготовить ноутбук перед выездом (полный бэкап в облако, шифрование диска BitLocker/FileVault на случай утери, двухфакторная аутентификация через приложение-генератор без SMS, проверка корпоративного VPN).
4. Связь и минимизация рисков (роуминг vs туристическая eSIM, раздача интернета со смартфона, офлайн-доступ к документам, коворкинги поблизости).
5. Как не испортить отпуск себе и близким (железное правило утреннего спринта, закрыл ноутбук в 11:00 — убрал в сейф отеля, никаких рабочих чатов на пляже).`);
                    }}
                    className="p-2.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl text-purple-950 transition-colors text-left flex items-start gap-2 cursor-pointer"
                  >
                    <span className="text-base">✈️</span>
                    <div>
                      <div className="font-bold">Удаленка в поездке и отпуске</div>
                      <div className="text-[11px] text-purple-700">С подробным ТЗ: техника, софт, договоренности с шефом</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setGenTopic('Как обустроить тихий рабочий уголок в 1-комнатной квартире с ребенком');
                      setGenCategory('with-kids');
                      setGenTags(['С детьми', 'Зонирование', 'Звук и шум', 'Компактная квартира']);
                      setGenKeyword('удаленка с ребенком в однушке');
                      setGenInstructions('Акустическое зонирование, плотные шторы, метод светофора занятости для детей, ENC-гарнитура с отсечением фонового шума мультиков, режим синхронизации детского сна.');
                    }}
                    className="p-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl text-rose-950 transition-colors text-left flex items-start gap-2 cursor-pointer"
                  >
                    <span className="text-base">👶</span>
                    <div>
                      <div className="font-bold">Удаленка с детьми в однушке</div>
                      <div className="text-[11px] text-rose-700">Акустические ширмы, тишина и режим дня</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setGenTopic('Как выбрать эргономичное кресло для больной поясницы');
                      setGenCategory('furniture');
                      setGenTags(['Кресла', 'Эргономика', 'Осанка', 'Здоровье спины']);
                      setGenKeyword('эргономичное кресло для поясницы');
                      setGenInstructions('Разбор поясничных упоров (2D/3D), сетка vs ткань, синхромеханизмы качания со смещенной осью, тест моделей Метта Самурай и SIHOO в РФ.');
                    }}
                    className="p-2.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl text-amber-950 transition-colors text-left flex items-start gap-2 cursor-pointer"
                  >
                    <span className="text-base">🪑</span>
                    <div>
                      <div className="font-bold">Выбор эргономичного кресла</div>
                      <div className="text-[11px] text-amber-700">Анатомический упор, сетка, синхромеханизмы</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setGenTopic('Скринбар на монитор vs обычная настольная лампа: замеры люксов и тесты');
                      setGenCategory('lighting-sound');
                      setGenTags(['Освещение', 'Зрение', 'Биоритмы и сон', 'Эргономика']);
                      setGenKeyword('скринбар для монитора');
                      setGenInstructions('Физика асимметричного луча, нулевые блики на матрице, нормы СанПиН по освещенности 400-500 лк, беспроводной пульт-шайба, тест моделей Xiaomi и BenQ.');
                    }}
                    className="p-2.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl text-blue-950 transition-colors text-left flex items-start gap-2 cursor-pointer"
                  >
                    <span className="text-base">💡</span>
                    <div>
                      <div className="font-bold">Скринбар против лампы</div>
                      <div className="text-[11px] text-blue-700">Замеры бликов, СанПиН и защита зрения</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Form */}
              <div className="space-y-4 bg-stone-50 p-5 rounded-2xl border border-stone-200">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Тема будущей статьи *
                  </label>
                  <input
                    type="text"
                    value={genTopic}
                    onChange={(e) => setGenTopic(e.target.value)}
                    placeholder="Например: Как подготовиться к удаленной работе во время поездки"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                  />
                </div>

                {/* Tags Management Section */}
                <div className="p-4 bg-white rounded-xl border border-stone-200 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                      <Tag className="w-4 h-4 text-amber-600" />
                      <span>Тэги статьи (множественный выбор и создание):</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleAutoSuggestTagsForTopic}
                        className="text-[11px] font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 px-2.5 py-0.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                        title="Автоматически подобрать релевантные тэги на основе введенной темы"
                      >
                        <span>⚡ Подобрать по теме</span>
                      </button>
                      <span className="text-[11px] text-stone-500">
                        Выбрано: <strong>{genTags.length}</strong> {genTags.length === 1 ? 'тэг' : genTags.length < 5 ? 'тэга' : 'тэгов'}
                      </span>
                    </div>
                  </div>

                  {/* Active selected tags */}
                  <div className="flex flex-wrap items-center gap-1.5 min-h-[32px] p-2 bg-stone-50 rounded-lg border border-stone-200">
                    {genTags.length === 0 ? (
                      <span className="text-xs text-stone-400 italic">
                        Тэги не выбраны. Выберите ниже или введите свой собственный тэг.
                      </span>
                    ) : (
                      genTags.map(tag => (
                        <span 
                          key={tag} 
                          className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs"
                        >
                          <span className="text-amber-600 font-bold">#</span>
                          <span>{tag}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveGenTag(tag)}
                            className="hover:text-rose-600 ml-1 font-bold transition-colors cursor-pointer"
                            title="Удалить тэг"
                          >
                            ×
                          </button>
                        </span>
                      ))
                    )}
                  </div>

                  {/* Add custom tag input */}
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Hash className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={newTagInput}
                        onChange={(e) => setNewTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCustomGenTag();
                          }
                        }}
                        placeholder="Создать свой тэг (например: Мониторы, Осанка, Домашний офис). Можно через запятую..."
                        className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg outline-none focus:border-amber-500 font-medium"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddCustomGenTag()}
                      disabled={!newTagInput.trim()}
                      className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-40 text-white text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Добавить тэг</span>
                    </button>
                  </div>

                  {/* System & Popular tags suggestions */}
                  <div className="space-y-1.5 pt-1">
                    <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider flex items-center justify-between">
                      <span>Каталог доступных тэгов (нажмите для добавления/удаления):</span>
                      <span className="text-stone-400 font-normal">Всего: {allAvailableSystemTags.length}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                      {allAvailableSystemTags.map((tag: string) => {
                        const isSelected = genTags.includes(tag);
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => handleToggleGenTag(tag)}
                            className={`px-2.5 py-1 text-xs rounded-lg transition-all cursor-pointer flex items-center gap-1 font-medium ${
                              isSelected
                                ? 'bg-amber-600 text-white font-bold shadow-xs'
                                : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200'
                            }`}
                          >
                            <span>#{tag}</span>
                            {isSelected && <span className="text-[10px] ml-0.5">✓</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Категория статьи (общий раздел)
                    </label>
                    <select
                      value={genCategory}
                      onChange={(e) => setGenCategory(e.target.value as Category)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                    >
                      {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                        <option key={c.id} value={c.id}>{c.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Основной поисковый SEO-ключ
                    </label>
                    <input
                      type="text"
                      value={genKeyword}
                      onChange={(e) => setGenKeyword(e.target.value)}
                      placeholder="Оставить пустым (возьмется тема)"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-stone-800">
                      Подробный план, контекст и ТЗ автора:
                    </label>
                    <span className="text-[11px] text-stone-500 font-medium">
                      Нейросеть детально раскроет каждый указанный пункт
                    </span>
                  </div>
                  <textarea
                    rows={5}
                    value={genInstructions}
                    onChange={(e) => setGenInstructions(e.target.value)}
                    placeholder="Опишите структуру и важные детали. Например:
- Что взять из техники (GaN-зарядка 100W, пауэрбанк, подставка)
- О чем договориться с шефом (асинхрон, окна связи 2 часа в день)
- Как подготовить ноутбук (BitLocker, 2FA без SMS, бэкап)
- Связь и риски (eSIM, точка доступа, офлайн-документы)
- Психологическая граница: закрыл ноутбук в 11:00 и убрал в сейф"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 leading-relaxed font-sans"
                  />
                </div>

                {/* Progress status while generating */}
                {isGenerating && (
                  <div className="p-4 bg-amber-50/90 border border-amber-200 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center justify-between text-amber-900 font-bold">
                      <span className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-amber-600" />
                        Генерация через Gemini 3.8 Flash...
                      </span>
                      <span>Шаг {generationStep} из 4</span>
                    </div>
                    <div className="w-full bg-amber-200/60 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-amber-600 h-full transition-all duration-500" 
                        style={{ width: `${generationStep * 25}%` }}
                      />
                    </div>
                    <div className="text-[11px] text-amber-800">
                      {generationStep === 1 && '1. Анализируем вводные и строим экспертную структуру статьи...'}
                      {generationStep === 2 && '2. Формируем глубокие разделы, чек-листы и практические советы...'}
                      {generationStep === 3 && '3. Проверяем технические параметры оборудования и факты...'}
                      {generationStep === 4 && '4. Собираем FAQ, метатеги SEO и сохраняем статью в базу...'}
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  disabled={!genTopic.trim() || isGenerating}
                  onClick={handleRunAiGenerator}
                  className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer ${
                    isGenerating
                      ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                      : 'bg-stone-900 text-white hover:bg-stone-800'
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                      Идет глубокая генерация статьи...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      Сгенерировать глубокую статью через Gemini API
                    </>
                  )}
                </button>
              </div>

              {genSuccessMsg && generatedArticle && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-emerald-950 space-y-3">
                  <div className="flex items-center gap-2 font-bold text-sm text-emerald-800">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    Статья успешно сгенерирована и добавлена на сайт!
                  </div>
                  <div className="text-xs space-y-1.5">
                    <div><strong>Заголовок:</strong> {generatedArticle.title}</div>
                    <div className="flex items-center gap-2">
                      <strong>Движок:</strong>
                      {generatedArticle.generatedBy === 'gemini' ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md text-[11px] border border-emerald-300">
                          <Sparkles className="w-3 h-3 text-emerald-600" />
                          Google Gemini 3.8 Flash (нейросеть)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md text-[11px] border border-amber-300">
                          <KeyRound className="w-3 h-3 text-amber-600" />
                          Локальный экспертный синтез по вашему ТЗ
                        </span>
                      )}
                    </div>
                    <div><strong>Разделов:</strong> {generatedArticle.sections.length}</div>
                    <div><strong>Время чтения:</strong> {generatedArticle.readTimeMin} мин</div>
                    <div><strong>Статус:</strong> Сохранено в память сайта. Теперь в каталоге <strong>{articles.length} статей</strong>.</div>
                    {generatedArticle.generatedBy !== 'gemini' && (
                      <div className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 mt-2">
                        💡 <strong>Хотите генерацию напрямую через нейросеть?</strong> Введите ваш API-ключ Gemini в поле выше и нажмите «Проверить и сохранить». Статьи будут генерироваться через Gemini Flash с глубоким анализом контекста.
                      </div>
                    )}
                  </div>
                  <div className="pt-2 flex flex-wrap gap-3">
                    <button
                      onClick={() => {
                        setSelectedArticleId(generatedArticle.id);
                        setActiveTab('editor');
                      }}
                      className="px-4 py-2 bg-emerald-700 text-white rounded-lg text-xs font-bold hover:bg-emerald-800"
                    >
                      Открыть в редакторе текста и ссылок
                    </button>
                  </div>

                  {/* Refine / Regenerate with critique */}
                  <div className="mt-3 p-3.5 bg-amber-500/10 border border-amber-300 rounded-xl space-y-2">
                    <div className="text-xs font-bold text-amber-950 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        Что-то не нравится в статье? Перегенерировать с правками
                      </span>
                      <span className="text-[11px] text-amber-700 font-normal">
                        ИИ переработает текст строго по вашим указаниям
                      </span>
                    </div>
                    <textarea
                      value={refineFeedback}
                      onChange={(e) => setRefineFeedback(e.target.value)}
                      placeholder="Опишите, что не так: например «Слишком шаблонно, убрать дорогие стулья, добавить конкретный раздел про покупку местной eSIM и роуминг, расписать риски отключения света в отеле, предложить несколько вариантов стульев от 6 000 руб...»"
                      rows={3}
                      className="w-full text-xs p-2.5 rounded-lg border border-amber-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                    />
                    <div className="flex items-center justify-end">
                      <button
                        onClick={() => handleRegenerateWithFeedback(generatedArticle, refineFeedback)}
                        disabled={isRefining || !refineFeedback.trim()}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isRefining ? 'animate-spin' : ''}`} />
                        {isRefining ? 'ИИ переделывает статью...' : 'Перегенерировать с учетом замечаний'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ARTICLE & LINK EDITOR */}
          {activeTab === 'editor' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Selector (4 cols) */}
              <div className="lg:col-span-4 space-y-3 border-r border-stone-200 pr-4">
                <div className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                  Выберите статью для правки:
                </div>

                <div className="space-y-1.5 max-h-[60vh] overflow-y-auto pr-1">
                  {articles.map((art, idx) => (
                    <div
                      key={art.id}
                      className={`group flex items-center justify-between p-2.5 rounded-xl border text-xs transition-all ${
                        art.id === selectedArticleId
                          ? 'bg-amber-50/80 border-amber-400 text-amber-950 font-bold shadow-xs'
                          : 'bg-white border-stone-200 hover:border-stone-300 text-stone-700'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleSelectArticleToEdit(art.id)}
                        className="flex-1 text-left min-w-0 pr-2"
                      >
                        <div className="text-[10px] text-stone-400 mb-0.5">
                          #{idx + 1} · {art.category} · {art.publishedAt}
                        </div>
                        <div className="line-clamp-2 leading-snug">{art.title}</div>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteArticle(art.id);
                        }}
                        title="Удалить эту статью"
                        className="p-1.5 text-stone-300 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors opacity-70 group-hover:opacity-100 flex-shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Editor Form (8 cols) */}
              <div className="lg:col-span-8 space-y-5">
                {editForm ? (
                  <form onSubmit={handleSaveEditedArticle} className="space-y-4">
                    
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-bold text-stone-900 truncate">
                        Редактирование: #{editForm.id}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {saveSuccessMsg && (
                          <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            Сохранено!
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteArticle(editForm.id)}
                          className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                          title="Удалить эту статью"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Удалить
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
                        >
                          <Save className="w-3.5 h-3.5 text-amber-400" />
                          Сохранить статью
                        </button>
                      </div>
                    </div>

                    {/* AI Feedback & Regeneration bar for this article */}
                    <div className="p-3 bg-amber-500/10 border border-amber-300 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                          Перегенерировать эту статью через ИИ с вашими замечаниями
                        </span>
                        <span className="text-[10px] text-stone-500 hidden sm:inline">
                          ИИ перепишет разделы с учетом критики
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          value={refineFeedback}
                          onChange={(e) => setRefineFeedback(e.target.value)}
                          placeholder="Что исправить? (например: убрать дорогие стулья, добавить раздел про роуминг и eSIM, предложить бюджетные варианты от 6 000 руб...)"
                          className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-stone-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleRegenerateWithFeedback(editForm, refineFeedback)}
                          disabled={isRefining || !refineFeedback.trim()}
                          className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 whitespace-nowrap shadow-xs"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isRefining ? 'animate-spin' : ''}`} />
                          {isRefining ? 'ИИ переписывает...' : 'Перегенерировать'}
                        </button>
                      </div>
                    </div>

                    {/* Title */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Заголовок статьи (H1)
                      </label>
                      <input
                        type="text"
                        value={editForm.title}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm font-bold bg-white"
                      />
                    </div>

                    {/* Subtitle */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Подзаголовок
                      </label>
                      <input
                        type="text"
                        value={editForm.subtitle}
                        onChange={(e) => setEditForm({ ...editForm, subtitle: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
                      />
                    </div>

                    {/* Excerpt */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Краткое описание (лид / анонс)
                      </label>
                      <textarea
                        rows={2}
                        value={editForm.excerpt}
                        onChange={(e) => setEditForm({ ...editForm, excerpt: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
                      />
                    </div>

                    {/* Tags Management for Edited Article */}
                    <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-2.5">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                          <Tag className="w-4 h-4 text-amber-600" />
                          <span>Тэги статьи (множественный выбор и добавление новых):</span>
                        </label>
                        <span className="text-[11px] text-stone-500">
                          Тэгов: <strong>{(editForm.tags || getTagsForArticle(editForm)).length}</strong>
                        </span>
                      </div>

                      {/* Active tags on this article */}
                      <div className="flex flex-wrap items-center gap-1.5 min-h-[32px] p-2 bg-white rounded-lg border border-stone-200">
                        {(editForm.tags || getTagsForArticle(editForm)).length === 0 ? (
                          <span className="text-xs text-stone-400 italic">
                            У статьи пока нет тэгов. Добавьте свой тэг или выберите из каталога ниже.
                          </span>
                        ) : (
                          (editForm.tags || getTagsForArticle(editForm)).map(tag => (
                            <span 
                              key={tag} 
                              className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs"
                            >
                              <span className="text-amber-600 font-bold">#</span>
                              <span>{tag}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveEditTag(tag)}
                                className="hover:text-rose-600 ml-1 font-bold transition-colors cursor-pointer"
                                title="Удалить тэг"
                              >
                                ×
                              </button>
                            </span>
                          ))
                        )}
                      </div>

                      {/* Add custom tag input */}
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Hash className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={editorTagInput}
                            onChange={(e) => setEditorTagInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddCustomEditTag();
                              }
                            }}
                            placeholder="Добавить тэг к статье (Enter или через запятую)..."
                            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg outline-none focus:border-amber-500 font-medium"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAddCustomEditTag()}
                          disabled={!editorTagInput.trim()}
                          className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-40 text-white text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Добавить тэг</span>
                        </button>
                      </div>

                      {/* Quick popular tags cloud */}
                      <div className="space-y-1 pt-1">
                        <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider flex items-center justify-between">
                          <span>Каталог тэгов (нажмите для добавления/удаления):</span>
                          <span className="text-stone-400 font-normal">Всего: {allAvailableSystemTags.length}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
                          {allAvailableSystemTags.map((tag: string) => {
                            const current = editForm.tags || getTagsForArticle(editForm);
                            const isSelected = current.includes(tag);
                            return (
                              <button
                                key={tag}
                                type="button"
                                onClick={() => handleToggleEditTag(tag)}
                                className={`px-2 py-0.5 text-[11px] rounded transition-all cursor-pointer flex items-center gap-1 font-medium ${
                                  isSelected
                                    ? 'bg-amber-600 text-white font-bold shadow-xs'
                                    : 'bg-white hover:bg-stone-200 text-stone-700 border border-stone-200'
                                }`}
                              >
                                <span>#{tag}</span>
                                {isSelected && <span className="text-[9px]">✓</span>}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Category, Date & Read Time */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">
                          Категория статьи
                        </label>
                        <select
                          value={editForm.category}
                          onChange={(e) => setEditForm({ ...editForm, category: e.target.value as Category })}
                          className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white font-medium"
                        >
                          {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                            <option key={c.id} value={c.id}>{c.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">
                          Дата публикации
                        </label>
                        <input
                          type="text"
                          value={editForm.publishedAt}
                          onChange={(e) => setEditForm({ ...editForm, publishedAt: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">
                          Время чтения (мин)
                        </label>
                        <input
                          type="number"
                          value={editForm.readTimeMin}
                          onChange={(e) => setEditForm({ ...editForm, readTimeMin: Number(e.target.value) })}
                          className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
                        />
                      </div>
                    </div>

                    {/* HERO IMAGE & LOCAL ASSET SELECTOR */}
                    <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                          <Layers className="w-4 h-4 text-amber-500" />
                          Обложка статьи (фотографии и схемы без проблем с авторскими правами)
                        </label>
                        <span className="text-[11px] text-stone-500">
                          Локальные 16:9 изображения в папке сайта
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3 items-start">
                        <div className="w-32 h-20 rounded-lg overflow-hidden border border-stone-300 bg-stone-900 flex-shrink-0 flex items-center justify-center">
                          <img 
                            src={editForm.heroImage} 
                            alt="Preview" 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/images/editorial/home-office-cozy.jpg';
                            }}
                          />
                        </div>
                        <div className="flex-1 w-full space-y-2">
                          <input
                            type="text"
                            value={editForm.heroImage}
                            onChange={(e) => setEditForm({ ...editForm, heroImage: e.target.value })}
                            placeholder="/images/editorial/..."
                            className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs bg-white font-mono"
                          />
                          
                          {/* Gemini Imagen Image Generator */}
                          <div className="p-2.5 bg-amber-50/60 border border-amber-200/80 rounded-xl space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                                Сгенерировать обложку через нейросеть Gemini Imagen:
                              </span>
                              <span className="text-[10px] text-amber-700 font-medium">
                                100% авторские права, реализм 16:9
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={imagePrompt}
                                onChange={(e) => setImagePrompt(e.target.value)}
                                placeholder={editForm.title ? `Промпт: ${editForm.title}` : 'Опишите желаемое фото интерьера...'}
                                className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-amber-300 rounded-lg outline-none text-stone-800"
                              />
                              <button
                                type="button"
                                onClick={handleGenerateImageWithGemini}
                                disabled={isGeneratingImage}
                                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer flex-shrink-0"
                              >
                                {isGeneratingImage ? (
                                  <>
                                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Генерация...</span>
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="w-3 h-3" />
                                    <span>Сгенерировать</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Realistic Editorial Photos Section */}
                          <div className="space-y-1">
                            <div className="text-[10px] font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-amber-600" />
                              Готовые реалистичные студийные фото (ИИ-фотография, 16:9):
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {[
                                { label: 'Баланс и релакс', url: '/images/editorial/work-life-balance.jpg' },
                                { label: 'Скандинавский стол', url: '/images/editorial/realistic-workspace-scandinavian.jpg' },
                                { label: 'Стоячий стол и здоровье', url: '/images/editorial/standing-desk-health.jpg' },
                                { label: 'Компактный уголок', url: '/images/editorial/compact-apartment-nook.jpg' },
                                { label: 'Концентрация и тишина', url: '/images/editorial/headphones-focus.jpg' },
                                { label: 'Уютный кабинет', url: '/images/editorial/home-office-cozy.jpg' },
                                { label: 'Удаленка в поездке', url: '/images/editorial/remote-travel-work.jpg' },
                                { label: 'Работа с ребенком', url: '/images/editorial/family-remote-work.jpg' },
                                { label: 'Кресло и кронштейн', url: '/images/editorial/ergonomic-chair-desk.jpg' },
                                { label: 'Бюджетный сетап', url: '/images/editorial/budget-clean-desk.jpg' },
                                { label: 'Вечерний свет / Скринбар', url: '/images/editorial/screenbar-evening-light.jpg' },
                                { label: 'Микрофон и созвоны', url: '/images/editorial/audio-podcasting-desk.jpg' },
                              ].map(photo => (
                                <button
                                  key={photo.url}
                                  type="button"
                                  onClick={() => setEditForm({ ...editForm, heroImage: photo.url })}
                                  className={`px-2 py-0.5 rounded text-[10px] transition-colors ${
                                    editForm.heroImage === photo.url
                                      ? 'bg-amber-600 text-white font-bold'
                                      : 'bg-white border border-stone-200 text-stone-700 hover:border-amber-400 hover:text-amber-900'
                                  }`}
                                >
                                  {photo.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Technical Diagrams Section */}
                          <div className="space-y-1 pt-1">
                            <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                              Технические схемы и чертежи (SVG с параметрами):
                            </div>
                            <div className="flex flex-wrap gap-1 text-[11px]">
                              {[
                                { label: 'Кабель-менеджмент', url: '/images/cable-management.svg' },
                                { label: 'Подставки для ног', url: '/images/footrest-ergonomics.svg' },
                                { label: 'Кронштейн экрана', url: '/images/monitor-arms.svg' },
                                { label: 'Акустика и войлок', url: '/images/acoustic-panels.svg' },
                                { label: 'Схема расстановки стола', url: '/images/room-planning.svg' },
                              ].map(preset => (
                                <button
                                  key={preset.url}
                                  type="button"
                                  onClick={() => setEditForm({ ...editForm, heroImage: preset.url })}
                                  className={`px-2 py-0.5 rounded text-[10px] transition-colors ${
                                    editForm.heroImage === preset.url
                                      ? 'bg-stone-800 text-white font-bold'
                                      : 'bg-white border border-stone-200 text-stone-500 hover:border-stone-400 hover:text-stone-800'
                                  }`}
                                >
                                  {preset.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* PROVEN PRODUCT LINKS & TESTER */}
                    <div className="p-4 bg-stone-100 rounded-xl border border-stone-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-xs uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Проверка партнерских ссылок (защита от неработающих страниц)
                        </div>
                      </div>
                      <p className="text-[11px] text-stone-600 leading-relaxed">
                        Нажмите кнопку «Проверить», чтобы открыть ссылку прямо сейчас в новой вкладке и своими глазами убедиться, что она открывает реальный товар, а не авточехлы или 404.
                      </p>

                      <div className="space-y-3 pt-2">
                        {PRODUCTS_CATALOG.filter(p => editForm.featuredProductIds?.includes(p.id) || editForm.sections.some(s => s.productIds?.includes(p.id))).map(prod => (
                          <div key={prod.id} className="bg-white p-3 rounded-xl border border-stone-200 text-xs space-y-2">
                            <div className="font-bold text-stone-900 flex items-center justify-between">
                              <span>{prod.name} ({prod.priceRub.toLocaleString()} ₽)</span>
                              <span className="text-[10px] text-stone-500 font-normal">ID: {prod.id}</span>
                            </div>

                            <div className="flex flex-wrap gap-2 pt-1">
                              <a
                                href={buildPartnerUrl(prod, 'yandex')}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-3 py-1 bg-stone-900 text-white rounded-lg text-[11px] font-semibold hover:bg-stone-800"
                              >
                                Проверить Я.Маркет
                                <ExternalLink className="w-3 h-3 text-amber-400" />
                              </a>

                              {prod.ozonUrl && (
                                <a
                                  href={buildPartnerUrl(prod, 'ozon')}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-800 rounded-lg text-[11px] font-semibold hover:bg-blue-100"
                                >
                                  Проверить Ozon
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}

                              {prod.wbUrl && (
                                <a
                                  href={buildPartnerUrl(prod, 'wb')}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-800 rounded-lg text-[11px] font-semibold hover:bg-purple-100"
                                >
                                  Проверить WB
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Sections text editor */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                          Разделы статьи ({editForm.sections.length}):
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const updatedSections = editForm.sections.map(sec => ({
                              ...sec,
                              title: sec.title.replace(/^#{1,6}\s*/, '').trim(),
                              content: stripMarkdownSymbols(cleanTemplateArtifacts(sec.content))
                            }));
                            setEditForm({ ...editForm, sections: updatedSections });
                          }}
                          className="px-2.5 py-1 text-[11px] font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg flex items-center gap-1 transition-colors"
                          title="Удаляет все символы #, *, >, - и оставляет чистый русский текст"
                        >
                          <Sparkles className="w-3 h-3 text-amber-600" />
                          Очистить текст от символов (#, *, &gt;)
                        </button>
                      </div>
                      {editForm.sections.map((sec, idx) => (
                        <div key={sec.id || idx} className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
                          <input
                            type="text"
                            value={sec.title}
                            onChange={(e) => {
                              const updatedSections = [...editForm.sections];
                              updatedSections[idx].title = e.target.value;
                              setEditForm({ ...editForm, sections: updatedSections });
                            }}
                            className="w-full px-3 py-1.5 rounded-lg border border-stone-300 font-bold text-xs bg-white"
                          />
                          <textarea
                            rows={4}
                            value={sec.content}
                            onChange={(e) => {
                              const updatedSections = [...editForm.sections];
                              updatedSections[idx].content = e.target.value;
                              setEditForm({ ...editForm, sections: updatedSections });
                            }}
                            className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs bg-white leading-relaxed"
                          />
                        </div>
                      ))}
                    </div>

                  </form>
                ) : (
                  <div className="text-stone-400 py-12 text-center text-xs">
                    Выберите статью слева для начала редактирования
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: AI AUDIT & SMART UPDATER */}
          {activeTab === 'audit' && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-950 flex items-start gap-3">
                <RefreshCw className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold mb-1">Умная актуализация статей через ИИ (осень 2026)</div>
                  <div>
                    Движок Gemini анализирует текст любой статьи на актуальность моделей, цен в РФ и эргономических стандартов, выявляет устаревшие рекомендации и предлагает свежие абзацы для мгновенной вставки.
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 items-end bg-stone-50 p-4 rounded-xl border border-stone-200">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Выберите статью для проведения аудита:
                  </label>
                  <select
                    value={auditTargetId}
                    onChange={(e) => setAuditTargetId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs"
                  >
                    {articles.map((art) => (
                      <option key={art.id} value={art.id}>
                        {art.title}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleRunAiAudit}
                  disabled={isAuditing}
                  className="px-5 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition-colors flex items-center gap-2 flex-shrink-0"
                >
                  {isAuditing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                      Анализ...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      Запустить аудит Gemini
                    </>
                  )}
                </button>
              </div>

              {auditReport && (
                <div className="space-y-4 bg-white p-5 rounded-2xl border border-stone-200">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                    <div>
                      <div className="text-xs uppercase font-bold text-stone-400">Индекс актуальности контента</div>
                      <div className="text-2xl font-extrabold text-stone-900">
                        {auditReport.currencyScore} / 100
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold">
                      Осень 2026
                    </span>
                  </div>

                  <p className="text-xs text-stone-700 leading-relaxed">
                    {auditReport.summary}
                  </p>

                  <div className="space-y-2">
                    <div className="text-xs font-bold text-stone-900">Выявленные замечания и точки роста:</div>
                    <ul className="space-y-1 text-xs text-stone-600 list-disc list-inside">
                      {auditReport.outdatedPoints.map((pt, i) => (
                        <li key={i}>{pt}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2 pt-2">
                    <div className="text-xs font-bold text-stone-900">Рекомендуемые актуальные товары:</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {auditReport.freshGearRecommendations.map((gear, i) => (
                        <div key={i} className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs">
                          <div className="font-bold text-stone-900">{gear.modelName}</div>
                          <div className="text-stone-500 text-[11px]">{gear.category} · ~{gear.approxPriceRub.toLocaleString()} ₽</div>
                          <div className="text-stone-600 mt-1">{gear.reasonToInclude}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-stone-100 flex justify-end">
                    <button
                      onClick={handleApplyAuditSuggestions}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      Вставить рекомендованные дополнения в статью
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: 1-CLICK EXPORT */}
          {activeTab === 'export' && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-xs text-purple-950 flex items-start gap-3">
                <FileCode className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold mb-1">Как статьи попадают в продакшн на GitHub Pages?</div>
                  <div className="leading-relaxed">
                    На сайте статьи хранятся в виде структурированного массива данных внутри файла <strong>src/data/contentData.ts</strong>. Это защищает сайт от хаоса в разметке и гарантирует идеальное отображение на мобильных. Чтобы обновить сайт на GitHub Pages навсегда, просто скачайте готовый файл ниже и замените его в репозитории на GitHub.
                  </div>
                </div>
              </div>

              {/* SOURCE CODE ARCHIVE - FULL PROJECT SOURCES */}
              <div className="p-5 bg-gradient-to-br from-amber-50 to-stone-50 border-2 border-amber-300/80 rounded-2xl shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📁</span>
                    <div>
                      <div className="font-extrabold text-stone-900 text-sm flex items-center gap-2">
                        <span>Архив всех актуальных исходников проекта</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-200 text-amber-950 font-bold border border-amber-300">
                          v{sourcesInfo.version} ({sourcesInfo.date})
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 mt-0.5">
                        Полный код проекта: <code>src/</code>, <code>public/</code> (картинки, фавиконки, схемы), <code>scripts/</code>, конфигурации (<code>package.json</code>, <code>server.ts</code>, <code>tsconfig.json</code>, <code>vite.config.ts</code>) без <code>node_modules</code>.
                      </p>
                    </div>
                  </div>
                  <div className="text-[11px] font-mono text-stone-700 bg-white px-3 py-1.5 rounded-lg border border-amber-200 flex items-center justify-between sm:justify-end gap-2 flex-shrink-0">
                    <span className="font-semibold">{sourcesInfo.filename}</span>
                    <span className="text-amber-700 font-bold">({sourcesInfo.sizeFormatted})</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
                  <a
                    href={sourcesInfo.url}
                    download={sourcesInfo.filename}
                    className="w-full sm:flex-1 py-3 bg-stone-900 hover:bg-black text-amber-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all hover:scale-[1.01]"
                  >
                    <Download className="w-4 h-4 text-amber-400" />
                    Скачать архив исходников ({sourcesInfo.sizeFormatted})
                  </a>

                  <button
                    onClick={handleRebuildSources}
                    disabled={isBuildingSources}
                    className="w-full sm:w-auto px-4 py-3 text-xs font-semibold text-stone-700 hover:text-stone-950 hover:bg-white bg-white/80 rounded-xl flex items-center justify-center gap-1.5 border border-stone-300 transition-colors cursor-pointer flex-shrink-0"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isBuildingSources ? 'animate-spin text-amber-600' : ''}`} />
                    {isBuildingSources ? 'Упаковка исходников...' : `Пересобрать v${(sourcesInfo.version || 1) + 1}`}
                  </button>
                </div>

                {sourcesSuccessMsg && (
                  <div className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 p-2 rounded-lg font-medium text-center">
                    {sourcesSuccessMsg}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 bg-stone-50 border border-stone-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-stone-900 text-sm">Вариант 1: ZIP-архив сайта</div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-200">
                      v{archiveInfo.version} ({archiveInfo.date})
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Готовый скомпилированный сайт (dist) для GitHub Pages со всеми {articles.length} статьями, пререндерингом и разметкой.
                  </p>

                  <div className="text-[11px] font-mono text-stone-700 bg-white p-2 rounded-lg border border-stone-200 truncate flex items-center justify-between">
                    <span className="truncate">📦 {archiveInfo.filename}</span>
                    <span className="text-stone-500 font-bold flex-shrink-0 ml-1">{archiveInfo.sizeFormatted}</span>
                  </div>

                  <a
                    href={archiveInfo.url}
                    download={archiveInfo.filename}
                    className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
                  >
                    <Download className="w-4 h-4 text-white" />
                    Скачать {archiveInfo.filename}
                  </a>

                  <button
                    onClick={handleRebuildArchive}
                    disabled={isBuildingArchive}
                    className="w-full py-1.5 text-[11px] text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg flex items-center justify-center gap-1.5 border border-dashed border-stone-300 transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`w-3 h-3 ${isBuildingArchive ? 'animate-spin' : ''}`} />
                    {isBuildingArchive ? 'Упаковка новой версии...' : `Собрать v${(archiveInfo.version || 1) + 1} за сегодня`}
                  </button>

                  {archiveSuccessMsg && (
                    <div className="text-[11px] text-emerald-700 font-medium text-center">
                      {archiveSuccessMsg}
                    </div>
                  )}
                </div>

                <div className="p-5 bg-stone-50 border border-stone-200 rounded-2xl space-y-3">
                  <div className="font-bold text-stone-900 text-sm">Вариант 2: Файл contentData.ts</div>
                  <p className="text-xs text-stone-600">
                    Формирует файл со всеми <strong>{articles.length} статьями</strong> и вашими правками для папки <code>src/data/</code>.
                  </p>
                  <button
                    onClick={handleDownloadContentDataFile}
                    className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <Download className="w-4 h-4 text-amber-400" />
                    Скачать contentData.ts
                  </button>
                </div>

                <div className="p-5 bg-stone-50 border border-stone-200 rounded-2xl space-y-3">
                  <div className="font-bold text-stone-900 text-sm">Вариант 3: Скопировать код</div>
                  <p className="text-xs text-stone-600">
                    Скопируйте исходный код массива статей в буфер обмена для быстрой вставки через веб-интерфейс GitHub.
                  </p>
                  <button
                    onClick={handleCopyCode}
                    className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-stone-300 cursor-pointer transition-colors"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        Скопировано в буфер!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-stone-600" />
                        Скопировать код в буфер
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Reset option */}
              <div className="pt-4 border-t border-stone-200 flex justify-between items-center text-xs text-stone-500">
                <span>Хотите отменить локальные правки и вернуть заводские статьи?</span>
                <button
                  onClick={() => {
                    if (confirm('Сбросить статьи к заводскому состоянию?')) {
                      onResetArticles();
                    }
                  }}
                  className="px-3 py-1.5 text-rose-700 hover:bg-rose-50 rounded-lg font-medium"
                >
                  Сбросить до исходных ({articles.length} ст.)
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: AUTOMATED GITHUB AGENTS */}
          {activeTab === 'agents' && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-950 flex items-start gap-3">
                <GitBranch className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold mb-1">Сравнение двух подходов к генерации контента:</div>
                  <div className="leading-relaxed space-y-1">
                    <div>1. <strong>Ручной подход через админку (рекомендуется):</strong> полный контроль, мгновенный результат, вы сами видите и одобряете ссылки перед публикацией. Исключает риск попадания под фильтры поисковиков за AI-спам.</div>
                    <div>2. <strong>Агентный подход (по расписанию через GitHub Actions):</strong> скрипт запускается раз в неделю, запрашивает Gemini API и создает Pull Request на GitHub. Вы проверяете его с телефона и сливаете в main.</div>
                  </div>
                </div>
              </div>

              <div className="bg-stone-900 text-stone-200 p-5 rounded-2xl text-xs space-y-3 font-mono">
                <div className="text-amber-400 font-bold font-sans text-sm">
                  Пример workflow: .github/workflows/weekly-content-agent.yml
                </div>
                <pre className="overflow-x-auto text-[11px] leading-relaxed text-stone-300">
{`name: Weekly AI Article Agent
on:
  schedule:
    - cron: '0 9 * * 1' # Каждый понедельник в 09:00 МСК
  workflow_dispatch:

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - name: Run Gemini Content Pipeline
        env:
          GEMINI_API_KEY: \${{ secrets.GEMINI_API_KEY }}
        run: node scripts/generate-weekly-article.js
      - name: Create Pull Request with New Article
        uses: peter-evans/create-pull-request@v6
        with:
          title: "🤖 Новая статья от AI-редактора"
          branch: "ai-content-update"
`}
                </pre>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

function generateContentDataTypeScript(articles: Article[]): string {
  return `import { Article, CategoryInfo, LaunchChecklistItem, ProductItem, SetupPreset } from '../types';

export const CATEGORIES: CategoryInfo[] = ${JSON.stringify(CATEGORIES, null, 2)};

export const PRODUCTS_CATALOG: ProductItem[] = ${JSON.stringify(PRODUCTS_CATALOG, null, 2)};

export const EDITORIAL_AUTHOR = {
  name: 'Редакция KabinetDoma.ru',
  role: 'Экспертная коллегия по эргономике и домашнему офису',
  avatar: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=200&q=80'
};

export const ARTICLES_DATA: Article[] = ${JSON.stringify(articles, null, 2)};
`;
}
