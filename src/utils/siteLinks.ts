import { Platform } from 'react-native';

const PRODUCTION_SITE_ORIGIN = 'https://timetutor.app';

type SitePath = '/privacy' | '/support';
type SiteUrlOptions = {
  platform?: string;
  webOrigin?: string;
};

function getWebOrigin(webOrigin?: string) {
  if (webOrigin) {
    return webOrigin;
  }

  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }

  return PRODUCTION_SITE_ORIGIN;
}

export function getSiteUrl(path: SitePath, options: SiteUrlOptions = {}) {
  const platform = options.platform ?? Platform.OS;
  const origin =
    platform === 'web'
      ? getWebOrigin(options.webOrigin)
      : PRODUCTION_SITE_ORIGIN;
  return new URL(path, origin).toString();
}
