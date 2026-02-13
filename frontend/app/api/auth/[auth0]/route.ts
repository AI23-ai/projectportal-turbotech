import { handleAuth, handleLogin } from '@auth0/nextjs-auth0';

export const GET = handleAuth({
  login: handleLogin((req) => {
    // Extract organization from query params
    // Handle both NextRequest (App Router) and NextApiRequest (Pages Router)
    let organization: string | null = null;

    if (req.url) {
      const url = new URL(req.url);
      organization = url.searchParams.get('organization');
    }

    // Return authorization params with organization if present
    return {
      authorizationParams: organization ? { organization } : {},
    };
  }),
});
