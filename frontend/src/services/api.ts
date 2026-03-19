const API_BASE_URL = 'http://localhost:8000';

class ApiService {
  private getAuthHeader(): Record<string, string> {
    const token = localStorage.getItem('access_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`Making request to: ${url}`);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...this.getAuthHeader(),
    };

    const config: RequestInit = {
      headers,
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('access_token');
        window.location.href = '/login';
      }
      throw new Error(`HTTP error! status: ${response.status}`);
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
    console.log('Login attempt for:', email);
    const result = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    console.log('Login result:', result);
    return result;
  }

  async register(name: string, email: string, password: string, password_repeat: string) {
    console.log('Register attempt for:', email);
    const result = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, password_repeat }),
    });
    console.log('Register result:', result);
    return result;
  }

  async uploadAdImage(adId: number, file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const headers: Record<string, string> = this.getAuthHeader();
    const response = await fetch(`${API_BASE_URL}/announcements/${adId}/upload-image`, {
        method: 'POST',
        headers,
        body: formData,
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getAnnouncements() {
    return this.request('/announcements/');
  }

  async getAnnouncement(id: number) {
    return this.request(`/announcements/${id}`);
  }

  async createAnnouncement(announcement: unknown) {
    return this.request('/announcements/', {
      method: 'POST',
      body: JSON.stringify(announcement),
    });
  }

  async updateAnnouncement(id: number, announcement: unknown) {
    return this.request(`/announcements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(announcement),
    });
  }

  async deleteAnnouncement(id: number) {
    return this.request(`/announcements/${id}`, {
      method: 'DELETE',
    });
  }

  async uploadImage(adId: number, file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const headers: Record<string, string> = this.getAuthHeader();

    const response = await fetch(`${API_BASE_URL}/announcements/${adId}/upload-image`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getProfile(): Promise<{
    id: number;
    name: string;
    email: string;
    role: 'user' | 'admin';
    city: string;
    contacts: string[];
  }> {
    return this.request('/user/profile');
  }

  async updateProfile(data: {
    name?: string;
    city?: string;
    contacts?: string[];
  }) {
    return this.request('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getUserAnnouncements() {
    return this.request('/user/my_ads');
  }
}

export const apiService = new ApiService();
export default apiService;