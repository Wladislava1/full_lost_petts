export interface User {
  name: string;
  email: string;
  id: number;
  role: 'user' | 'admin';
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, passwordRepeat: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}