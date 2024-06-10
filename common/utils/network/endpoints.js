export const apiMatcher = 'api/v1';
export const apiRootUrl = process.env.NEXT_PUBLIC_API_URL ?? `http://localhost:1010/${apiMatcher}`;

export const signInUrl = `${apiRootUrl}/login`;
export const activationsUrl = `${apiRootUrl}/bookings/list?perPage=100&currentPage=1&sortBy=name&orderBy=asc&search=`;
