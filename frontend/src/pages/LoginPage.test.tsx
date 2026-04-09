import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from './LoginPage';
import '@testing-library/jest-dom/vitest';

const mockNavigate = vi.fn();
const mockLogin = vi.fn();

vi.mock('react-router-dom', async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const actual = await vi.importActual('react-router-dom') as any;
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    login: mockLogin,
  })
}));

describe('Компонент LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Успешно рендерит форму логина', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { name: /вход/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
  });

  it('Отправляет данные формы и перенаправляет при успехе', async () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/пароль/i), { target: { value: 'password123' } });
    
    fireEvent.click(screen.getByRole('button', { name: /войти/i }));

    expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('Показывает ошибку при неудачном входе', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Auth failed'));

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'wrong@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/пароль/i), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByRole('button', { name: /войти/i }));

    const errorMessage = await screen.findByText('Неверный email или пароль');
    expect(errorMessage).toBeInTheDocument();
  });
});