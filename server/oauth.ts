export function googleOAuthOptions(appOrigin: string) {
  return {
    redirectTo: `${appOrigin}/api/auth/google/callback`,
    queryParams: { prompt: 'select_account' },
    skipBrowserRedirect: true,
  };
}

export function shouldGrantTeacherAccess(params: {
  existingAccessEnabled?: boolean | null;
  email?: string | null;
  allowedEmailsEnv?: string | undefined;
}): boolean {
  if (params.existingAccessEnabled === true) return true;
  if (params.existingAccessEnabled === false) return false;
  const email = (params.email || '').trim().toLowerCase();
  if (!email) return false;
  const allowlist = (params.allowedEmailsEnv || '')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);
  if (allowlist.length > 0) {
    return allowlist.includes(email);
  }
  return true;
}

