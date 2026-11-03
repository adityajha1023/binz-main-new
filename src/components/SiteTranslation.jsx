import { useEffect } from 'react';
import { supportedLanguages, translateText } from '../localization';

const sourceText = new WeakMap();

function isTranslatableText(node) {
  const parent = node.parentElement;
  return parent && !parent.closest('script, style, noscript, textarea, [data-binz-no-translate]') && node.textContent.trim();
}

function translateAttributes(element, language) {
  ['aria-label', 'aria-description', 'title', 'placeholder'].forEach((attribute) => {
    const value = element.getAttribute(attribute);
    if (!value) return;
    const original = element.dataset[`binzOriginal${attribute.replace(/(^|-)(.)/g, (_, __, letter) => letter.toUpperCase())}`] || value;
    element.dataset[`binzOriginal${attribute.replace(/(^|-)(.)/g, (_, __, letter) => letter.toUpperCase())}`] = original;
    element.setAttribute(attribute, language === 'English' ? original : translateText(original, language));
  });
}

function translatePage(language) {
  document.querySelectorAll('*').forEach((element) => translateAttributes(element, language));
  Array.from(document.body.querySelectorAll('*'))
    .flatMap((element) => [...element.childNodes])
    .filter((node) => node.nodeType === Node.TEXT_NODE && isTranslatableText(node))
    .forEach((node) => {
      const current = node.textContent;
      const original = sourceText.get(node) || current;
      sourceText.set(node, original);
      const output = language === 'English' ? original : translateText(original, language);
      if (output !== current) node.textContent = output;
    });
}

export default function SiteTranslation() {
  useEffect(() => {
    let language = localStorage.getItem('binz_language') || 'English';
    if (!supportedLanguages[language]) language = 'English';
    let timer;
    let disposed = false;
    document.documentElement.lang = supportedLanguages[language];
    const apply = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => { if (!disposed) translatePage(language); }, 40);
    };
    const observer = new MutationObserver(apply);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    apply();
    function handleLanguageChange(event) {
      language = supportedLanguages[event.detail] ? event.detail : 'English';
      document.documentElement.lang = supportedLanguages[language];
      apply();
    }
    window.addEventListener('binz-language-change', handleLanguageChange);
    return () => {
      disposed = true;
      window.clearTimeout(timer);
      observer.disconnect();
      window.removeEventListener('binz-language-change', handleLanguageChange);
    };
  }, []);
  return null;
}
