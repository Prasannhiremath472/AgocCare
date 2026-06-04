import { useEffect, useState } from 'react';
import { getAllSeo } from '../services/api';

// In-memory cache so we only fetch once per session
let _cache = null;
let _promise = null;

async function loadSeo() {
  if (_cache) return _cache;
  if (!_promise) {
    _promise = getAllSeo()
      .then(r => { _cache = r.data; return _cache; })
      .catch(() => { _promise = null; return {}; });
  }
  return _promise;
}

/**
 * Returns the SEO data for a given page key.
 * Merges DB values over the provided defaults.
 *
 * @param {string} pageKey   - matches seo_pages.page_key (e.g. 'home', 'products')
 * @param {object} defaults  - fallback values if DB has nothing
 */
export function useSeo(pageKey, defaults = {}) {
  const [seo, setSeo] = useState(defaults);

  useEffect(() => {
    loadSeo().then(data => {
      const row = data?.[pageKey];
      if (!row) return;
      setSeo({
        title:          row.title          || defaults.title          || '',
        description:    row.description    || defaults.description    || '',
        keywords:       row.keywords       || defaults.keywords       || '',
        og_title:       row.og_title       || row.title              || defaults.title || '',
        og_description: row.og_description || row.description        || defaults.description || '',
        og_image:       row.og_image       || defaults.og_image       || '',
        canonical:      row.canonical      || defaults.canonical      || '',
        robots:         row.robots         || 'index,follow',
      });
    });
  }, [pageKey]);

  return seo;
}

// Call this to force-refresh cache (after admin saves)
export function invalidateSeoCache() {
  _cache = null;
  _promise = null;
}
