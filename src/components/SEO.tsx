// SEO - React Helmet-based SEO meta tags manager for all pages
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
}

const defaultMeta = {
  title: 'SCS GO - Smart EV Charging',
  description: 'Tìm trạm sạc xe điện thông minh với AI. Đặt chỗ trước, so sánh giá, theo dõi thời gian thực.',
  image: 'https://scs-go.vercel.app/og-image.svg',
  url: 'https://scs-go.vercel.app',
};

export function SEO({ 
  title, 
  description = defaultMeta.description, 
  image = defaultMeta.image,
  url = defaultMeta.url,
  type = 'website'
}: SEOProps) {
  const fullTitle = title ? `${title} | SCS GO` : defaultMeta.title;

  return (
    <Helmet>
      {/* Basic */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      
      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content="SCS GO" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Additional */}
      <meta name="robots" content="index, follow" />
      <meta name="theme-color" content="#10b981" />
      <link rel="canonical" href={url} />
    </Helmet>
  );
}
