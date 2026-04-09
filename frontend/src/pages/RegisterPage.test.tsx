import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import RegisterPage from './RegisterPage';
import '@testing-library/jest-dom/vitest';

const mockNavigate = vi.fn();
const mockRegister = vi.fn();

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
    register: mockRegister,
  })
}));

describe('Компонент RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Показывает ошибку, если пароли не совпадают, и не отправляет запрос', async () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Имя'), { target: { value: 'Иван' } });
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'ivan@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('Пароль'), { target: { value: 'pass123' } });
    fireEvent.change(screen.getByPlaceholderText('Повторите пароль'), { target: { value: 'pass456' } });
    
    fireEvent.click(screen.getByRole('button', { name: /зарегистрироваться/i }));

    expect(await screen.findByText('Пароли не совпадают')).toBeInTheDocument();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('Отправляет данные при совпадении паролей', async () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Имя'), { target: { value: 'Иван' } });
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'ivan@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('Пароль'), { target: { value: 'pass123' } });
    fireEvent.change(screen.getByPlaceholderText('Повторите пароль'), { target: { value: 'pass123' } });
    
    fireEvent.click(screen.getByRole('button', { name: /зарегистрироваться/i }));

    expect(mockRegister).toHaveBeenCalledWith('Иван', 'ivan@test.com', 'pass123', 'pass123');

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });
});