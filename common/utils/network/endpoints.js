export const apiMatcher = 'api/v1';
export const apiRootUrl = process.env.NEXT_PUBLIC_API_URL ?? `http://localhost:1010/${apiMatcher}`;

export const signInUrl = `${apiRootUrl}/login`;
