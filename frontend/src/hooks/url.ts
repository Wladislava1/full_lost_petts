export const API_BASE_URL = 'http://localhost:8000';

export const getImageUrl = (path?: string | null): string => {
  if (!path || path === 'null' || path === '/default-image.jpg') {
    return '/default-image.jpg';
  }

  if (path.startsWith('http')) return path;
  
  if (path.startsWith('/media/')) return path;

  return `${API_BASE_URL}${path}`;
};