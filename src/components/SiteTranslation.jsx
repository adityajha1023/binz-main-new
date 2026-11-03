import { useEffect } from 'react';

const languageCodes = { English: 'en', Hindi: 'hi', Marathi: 'mr' };
// Track our last write separately from new text rendered by React.
const nodeText = new WeakMap();
const translatedText = new Map();

function shouldTranslate(node) {
  const parent = node.parentElement;
  return parent && !parent.closest('script, style, noscript, textarea, [data-binz-no-translate]');
}

async function translate(value, language) {
  const key = `${language}:${value}`;
  if (translatedText.has(key)) return translatedText.get(key);
  const params = new URLSearchParams({ client: 'gtx', sl: 'en', tl: language, dt: 't', q: value });
  const response = await fetch(`https://translate.googleapis.com/translate_a/single?${params}`);
  if (!response.ok) throw new Error('Translation unavailable');
  const result = await response.json();
  const output = result[0]?.map((part) => part[0]).join('') || value;
  translatedText.set(key, output);
  return output;
}

async function translatePage(language, isCurrent) {
  const nodes = [...document.body.querySelectorAll('*')]
    .flatMap((element) => [...element.childNodes])
    .filter((node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim() && shouldTranslate(node));

  await Promise.all(nodes.map(async (node) => {
    const current = node.textContent;
    let record = nodeText.get(node);
    if (!record || current !== record.rendered) {
      record = { source: current, rendered: current };
      nodeText.set(node, record);
    }
    const source = record.source;
    if (language === 'en') {
      record.rendered = source;
      if (node.textContent !== source) node.textContent = source;
      return;
    }
    try {
      const output = await translate(source, language);
      if (!isCurrent() || !node.isConnected || nodeText.get(node) !== record || node.textContent !== record.rendered) return;
      record.rendered = output;
      if (node.textContent !== output) node.textContent = output;
    } catch {
      // Keep English visible if translation is temporarily unavailable.
    }
  }));
}

export default function SiteTranslation() {
  useEffect(() => {
    let language = languageCodes[localStorage.getItem('binz_language') || 'English'] || 'en';
    let translationTimer;
    let disposed = false;
    document.documentElement.lang = language;

    function apply() {
      window.clearTimeout(translationTimer);
      const targetLanguage = language;
      translationTimer = window.setTimeout(() => translatePage(targetLanguage, () => !disposed && language === targetLanguage), 40);
    }

    const observer = new MutationObserver(apply);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    apply();

    function handleLanguageChange(event) {
      language = languageCodes[event.detail] || 'en';
      document.documentElement.lang = language;
      apply();
    }

    window.addEventListener('binz-language-change', handleLanguageChange);
    return () => {
      disposed = true;
      window.clearTimeout(translationTimer);
      observer.disconnect();
      window.removeEventListener('binz-language-change', handleLanguageChange);
    };
  }, []);

  return null;
}
