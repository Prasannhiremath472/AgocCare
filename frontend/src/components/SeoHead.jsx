import { Helmet } from 'react-helmet-async';
import { useSeo } from '../hooks/useSeo';

const BASE_URL = 'https://agoccarepvtltd.com';

export default function SeoHead({ pageKey, defaults = {}, overrides = {} }) {
  const seo = useSeo(pageKey, defaults);

  const title          = overrides.title          || seo.title          || defaults.title          || 'AgocCare';
  const description    = overrides.description    || seo.description    || defaults.description    || '';
  const keywords       = overrides.keywords       || seo.keywords       || defaults.keywords       || '';
  const robots         = seo.robots               || 'index,follow';
  const canonical      = overrides.canonical      || seo.canonical      || `${BASE_URL}/${pageKey === 'home' ? '' : pageKey}`;
  const og_title       = overrides.og_title       || seo.og_title       || title;
  const og_description = overrides.og_description || seo.og_description || description;
  const og_image       = overrides.og_image       || seo.og_image       || `${BASE_URL}/Agoccarelogo.jpeg`;

  return (
    <Helmet>
      <title>{title}</title>
      {description    && <meta name="description"          content={description} />}
      {keywords       && <meta name="keywords"             content={keywords} />}
      <meta name="robots"                                  content={robots} />
      <link rel="canonical"                                href={canonical} />

      {/* Open Graph */}
      <meta property="og:type"                            content="website" />
      <meta property="og:site_name"                       content="AgocCare" />
      <meta property="og:url"                             content={canonical} />
      {og_title       && <meta property="og:title"        content={og_title} />}
      {og_description && <meta property="og:description"  content={og_description} />}
      {og_image       && <meta property="og:image"        content={og_image} />}
      <meta property="og:locale"                          content="en_IN" />

      {/* Twitter/X Cards */}
      <meta name="twitter:card"                           content="summary_large_image" />
      {og_title       && <meta name="twitter:title"       content={og_title} />}
      {og_description && <meta name="twitter:description" content={og_description} />}
      {og_image       && <meta name="twitter:image"       content={og_image} />}
    </Helmet>
  );
}
