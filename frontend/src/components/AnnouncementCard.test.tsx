/* eslint-disable @typescript-eslint/ban-ts-comment */
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AnnouncementCard from './AnnouncementCard';

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 1, role: 'user' } })
}));

describe('Компонент AnnouncementCard', () => {
  it('Корректно рендерит заголовок и город', () => {
    render(
      <AnnouncementCard
        id={1}
        title="Пропал рыжий кот"
        city="Москва"
        image="/test-image.jpg"
        animalName="Барсик"
      />
    ); 
    expect(screen.getByText(/Пропал рыжий кот/i)).toBeInTheDocument();
    expect(screen.getByText(/Москва/i)).toBeInTheDocument();
    expect(screen.getByText(/Барсик/i)).toBeInTheDocument();
  });
});