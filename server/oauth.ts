export function googleOAuthOptions(appOrigin: string) {
  return {
    redirectTo: `${appOrigin}/api/auth/google/callback`,
    queryParams: { prompt: 'select_account' },
    skipBrowserRedirect: true,
  };
}
