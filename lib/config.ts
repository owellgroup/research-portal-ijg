export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://ijgapis.onrender.com';

export const API_ENDPOINTS = {
  users: `${API_BASE_URL}${process.env.NEXT_PUBLIC_API_ENDPOINT_USERS || 'api/users/all'}`,
  news: `${API_BASE_URL}${process.env.NEXT_PUBLIC_API_ENDPOINT_NEWS || '/api/news'}`,
  categories: `${API_BASE_URL}${process.env.NEXT_PUBLIC_API_ENDPOINT_CATEGORIES || '/api/categories'}`,
  documents: `${API_BASE_URL}${process.env.NEXT_PUBLIC_API_ENDPOINT_DOCUMENTS || '/api/documents'}`,
  login: `${API_BASE_URL}${process.env.NEXT_PUBLIC_API_ENDPOINT_LOGIN || '/api/users/login'}`,
};