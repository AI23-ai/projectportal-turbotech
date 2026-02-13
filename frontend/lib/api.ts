const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Fetch the access token from the Auth0 session
 */
async function getAccessToken(): Promise<string | null> {
  try {
    const response = await fetch('/api/auth/token');
    if (!response.ok) {
      console.error('Failed to get access token:', response.status);
      return null;
    }
    const data = await response.json();
    return data.accessToken;
  } catch (error) {
    console.error('Error fetching access token:', error);
    return null;
  }
}

/**
 * Make an authenticated API call to the backend
 */
export async function authenticatedFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getAccessToken();

  if (!token) {
    throw new Error('No access token available');
  }

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  return fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });
}
