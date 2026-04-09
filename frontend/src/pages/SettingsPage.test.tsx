/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import SettingsPage from './SettingsPage';
import { apiService } from '../services/api';
import '@testing-library/jest-dom/vitest';

const mockNavigate = vi.fn();
const mockLogout = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom') as any;
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 1, name: 'Тестовый Пользователь', email: 'test@test.com' },
    logout: mockLogout,
  })
}));

vi.mock('../services/api', () => ({
  apiService: {
    getProfile: vi.fn(),
    updateProfile: vi.fn(),
  }
}));

describe('Компонент SettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Успешно загружает и отображает профиль (Пункт 3.2)', async () => {
    (apiService.getProfile as any).mockResolvedValueOnce({
      name: 'Иван',
      email: 'ivan@test.com',
      city: 'Москва',
      contacts: ['+79991234567']
    });

    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('Иван')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Москва')).toBeInTheDocument();
      expect(screen.getByDisplayValue('+79991234567')).toBeInTheDocument();
    });
  });

  it('Позволяет добавить и удалить контакт', async () => {
    (apiService.getProfile as any).mockResolvedValueOnce({
      name: 'Иван', email: 'ivan@test.com', city: 'Москва', contacts: []
    });

    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('Иван')).toBeInTheDocument();
    });

    const addButton = screen.getByRole('button', { name: /\+ Добавить контакт/i });
    fireEvent.click(addButton);

    const contactInputs = screen.getAllByPlaceholderText('Значение контакта');
    expect(contactInputs).toHaveLength(2);

    const removeButtons = screen.getAllByRole('button', { name: /✖/i });
    fireEvent.click(removeButtons[0]);

    expect(screen.getAllByPlaceholderText('Значение контакта')).toHaveLength(1);
  });

  it('Сохраняет изменения профиля и показывает alert', async () => {
    (apiService.getProfile as any).mockResolvedValueOnce({
      name: 'Иван', email: 'ivan@test.com', city: 'Москва', contacts: []
    });
    (apiService.updateProfile as any).mockResolvedValueOnce({});

    const originalLocation = window.location;
    const mockLocation = { ...originalLocation, href: '' };
    Object.defineProperty(window, 'location', {
      value: mockLocation,
      writable: true,
      configurable: true
    });
    window.alert = vi.fn();

    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('Иван')).toBeInTheDocument();
    });

    const cityInput = screen.getByPlaceholderText('Введите ваш город');
    fireEvent.change(cityInput, { target: { value: 'Казань' } });

    const saveButton = screen.getByRole('button', { name: /Сохранить изменения/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(apiService.updateProfile).toHaveBeenCalledWith({
        name: 'Иван',
        city: 'Казань',
        contacts: [] 
      });
      expect(window.alert).toHaveBeenCalledWith('Настройки сохранены!');
    });

    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
      configurable: true
    });
  });
});