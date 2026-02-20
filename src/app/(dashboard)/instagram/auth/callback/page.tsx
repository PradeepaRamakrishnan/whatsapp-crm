'use client';

import { useEffect } from 'react';

// This page is the OAuth redirect target from Facebook.
// Facebook redirects here with: /instagram/auth/callback#access_token=xxx&...
// We extract the token, post it to the opener window, then close.
export default function InstagramAuthCallback() {
  useEffect(() => {
    const hash = window.location.hash.slice(1); // strip leading #
    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');

    if (accessToken && window.opener) {
      window.opener.postMessage(
        { type: 'INSTAGRAM_OAUTH_TOKEN', accessToken },
        window.location.origin,
      );
    }
    window.close();
  }, []);

  return (
    <div className="flex h-screen items-center justify-center text-muted-foreground text-sm">
      Connecting… you can close this window.
    </div>
  );
}
