const LOCAL_APPLICATION_URL = 'http://localhost:3000';

interface ApplicationUrlEnvironment {
  NEXT_PUBLIC_APP_URL?: string;
  VERCEL_PROJECT_PRODUCTION_URL?: string;
  VERCEL_URL?: string;
}

function parseHttpUrl(value: string, source: string): string {
  try {
    const url = new URL(value);

    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      throw new Error('unsupported protocol');
    }

    return url.origin;
  } catch {
    throw new Error(`${source} must be an absolute HTTP(S) URL`);
  }
}

export function resolveApplicationUrl(
  environment: ApplicationUrlEnvironment = process.env,
): string {
  const configuredUrl = environment.NEXT_PUBLIC_APP_URL?.trim();

  if (configuredUrl) {
    return parseHttpUrl(configuredUrl, 'NEXT_PUBLIC_APP_URL');
  }

  const vercelHostname =
    environment.VERCEL_PROJECT_PRODUCTION_URL?.trim() || environment.VERCEL_URL?.trim();

  if (vercelHostname) {
    const vercelUrl = /^https?:\/\//i.test(vercelHostname)
      ? vercelHostname
      : `https://${vercelHostname}`;

    return parseHttpUrl(vercelUrl, 'Vercel deployment URL');
  }

  return LOCAL_APPLICATION_URL;
}
