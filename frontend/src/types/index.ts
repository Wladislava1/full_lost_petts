export interface User {
  id: number;
  name: string;
  email: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_repeat: string;
}

export interface Announcement {
  id: number;
  type: 'Пропажа' | 'Находка';
  title: string;
  city: string;
  description: string;
  image?: string;
  animal_name: string;
  contact_info?: string[];
  created_at: string;
  user_id: number;
}

export interface EditableAnnouncement {
  id: number;
  title: string;
  description: string;
  city: string;
  image: string;
  date: string;
  found: boolean;
  animalName?: string;
  ownerName?: string;
  contactInfo?: Contact[];
}

export interface Contact {
  type: string;
  value: string;
  is_primary: boolean;
}