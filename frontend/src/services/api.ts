/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
const API_BASE_URL = 'http://127.0.0.1:8000';

class ApiService {
  private getAuthHeader(): Record<string, string> {
    const token = localStorage.getItem('access_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  private async fetchWithConfig(url: string, config: RequestInit) {
    config.credentials = 'include';
    return await fetch(url, config);
  }

  async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...this.getAuthHeader(),
      ...(options.headers as Record<string, string> || {})
    };

    let config: RequestInit = { ...options, headers };
    let response = await this.fetchWithConfig(url, config);

    if (response.status === 401 && endpoint !== '/auth/login' && endpoint !== '/auth/refresh') {
      try {
        console.log('Access token expired, attempting to refresh...');
        const refreshResponse = await this.fetchWithConfig(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST'
        });

        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          localStorage.setItem('access_token', data.access_token);
          
          headers['Authorization'] = `Bearer ${data.access_token}`;
          config = { ...options, headers };
          response = await this.fetchWithConfig(url, config);
        } else {
          throw new Error('Refresh failed');
        }
      } catch (error) {
        localStorage.removeItem('access_token');
        window.location.href = '/login';
        throw new Error('Session expired. Please login again.');
      }
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return null;
    }

    return response.json();
  }

  async get(endpoint: string) {
    return this.request(endpoint);
  }

  async patch(endpoint: string, body: unknown) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  async login(email: string, password: string) {
    const result = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (result && result.access_token) {
        localStorage.setItem('access_token', result.access_token);
    }
    return result;
  }

  async register(name: string, email: string, password: string, password_repeat: string) {
    const result = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, password_repeat }),
    });
    if (result && result.access_token) {
        localStorage.setItem('access_token', result.access_token);
    }
    return result;
  }

  async logout() {
    try {
        await this.request('/auth/logout', { method: 'POST' });
    } catch (e) {
        console.error('Logout error', e);
    } finally {
        localStorage.removeItem('access_token');
        window.location.href = '/login';
    }
  }

  async uploadImage(adId: number, file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const headers: Record<string, string> = this.getAuthHeader();

    const response = await fetch(`${API_BASE_URL}/announcements/${adId}/upload-image`, {
      method: 'POST',
      headers,
      body: formData,
      credentials: 'include'
    });

    if (!response.ok) {
      if (response.status === 401) {
          window.location.href = '/login';
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getAnnouncements() { return this.request('/announcements/'); }
  async getAnnouncement(id: number) { return this.request(`/announcements/${id}`); }
  async createAnnouncement(announcement: unknown) {
    return this.request('/announcements/', { method: 'POST', body: JSON.stringify(announcement) });
  }
  async updateAnnouncement(id: number, announcement: unknown) {
    return this.request(`/announcements/${id}`, { method: 'PUT', body: JSON.stringify(announcement) });
  }
  async deleteAnnouncement(id: number) {
    return this.request(`/announcements/${id}`, { method: 'DELETE' });
  }
  async getProfile(): Promise<any> { return this.request('/user/profile'); }
  async updateProfile(data: any) {
    return this.request('/user/profile', { method: 'PUT', body: JSON.stringify(data) });
  }
  async getUserAnnouncements() { return this.request('/user/my_ads'); }
}

export const apiService = new ApiService();
export default apiService;