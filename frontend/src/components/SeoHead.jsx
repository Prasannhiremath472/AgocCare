import { Helmet } from 'react-helmet-async';
import { useSeo } from '../hooks/useSeo';

/**
 * Drop-in Helmet wrapper that merges DB SEO over local defaults.
 * For dynamic pages (product detail), pass `overrides` with runtime values.
 */
export default function SeoHead({ pageKey, defaults = {}, overrides = {} }) {
  const seo = useSeo(pageKey, defaults);

  // Runtime overrides win over DB (e.g. product name in title)
  const title          = overrides.title          || seo.title          || defaults.title          || 'AgocCare';
  const description    = overrides.description    || seo.description    || defaults.description    || '';
  const keywords       = overrides.keywords       || seo.keywords       || defaults.keywords       || '';
  const robots         = seo.robots               || 'index,follow';
  const canonical      = overrides.canonical      || seo.canonical      || '';
  const og_title       = overrides.og_title       || seo.og_title       || title;
  const og_description = overrides.og_description || seo.og_description || description;
  const og_image       = overrides.og_image       || seo.og_image       || '';

  return (
    <Helmet>
      <title>{title}</title>
      {description    && <meta name="description"        content={description} />}
      {keywords       && <meta name="keywords"           content={keywords} />}
      {robots         && <meta name="robots"             content={robots} />}
      {canonical      && <link rel="canonical"           href={canonical} />}
      {og_title       && <meta property="og:title"       content={og_title} />}
      {og_description && <meta property="og:description" content={og_description} />}
      {og_image       && <meta property="og:image"       content={og_image} />}
      <meta property="og:type"    content="website" />
      <meta property="og:site_name" content="AgocCare" />
    </Helmet>
  );
}
