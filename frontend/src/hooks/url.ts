export const API_BASE_URL = 'http://localhost:8000';
export const FALLBACK_IMAGE = '/default-pet.svg';

export const markImageFallback = (image: HTMLImageElement) => {
  if (image.dataset.fallback === '1') return;
  image.dataset.fallback = '1';
  image.src = FALLBACK_IMAGE;
};

export const getImageUrl = (path?: string | null): string => {
  if (!path || path === 'null' || path === '/default-image.jpg' || path === FALLBACK_IMAGE) {
    return FALLBACK_IMAGE;
  }

  if (path.startsWith('http')) return path;
  
  if (path.startsWith('/media/')) return path;

  return `${API_BASE_URL}${path}`;
};