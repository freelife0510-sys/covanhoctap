// Validate APP_ORIGIN when deploying to Production if configured.
if (process.env.VERCEL_ENV === 'production' && process.env.APP_ORIGIN) {
  const origin = process.env.APP_ORIGIN.trim().replace(/\/+$/, '');
  if (origin !== 'https://covanhoctap.vercel.app') {
    throw new Error('Production APP_ORIGIN must match the existing owned domain.');
  }
}
