import { handleAuth, handleLogin } from '@auth0/nextjs-auth0';

export const GET = handleAuth({
  login: handleLogin((req) => {
    // Extract organization and invitation from query params
    let organization: string | null = null;
    let invitation: string | null = null;

    if (req.url) {
      const url = new URL(req.url);
      organization = url.searchParams.get('organization');
      invitation = url.searchParams.get('invitation');
    }

    // Return authorization params with organization and/or invitation if present
    return {
      authorizationParams: {
        ...(organization ? { organization } : {}),
        ...(invitation ? { invitation } : {}),
      },
    };
  }),
});
