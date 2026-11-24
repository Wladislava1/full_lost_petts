import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const SvyazEntryPage = () => {
  const [params] = useSearchParams();
  const [error, setError] = useState('');

  useEffect(() => {
    const code = params.get('code') ?? '';
    if (!code) {
      setError('Ссылка для входа неполная. Откройте Потеряшки из каталога Связь ID ещё раз.');
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const response = await fetch('/api/auth/svyaz/consume', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ code }),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || typeof data.access_token !== 'string') {
          if (!cancelled) {
            setError(
              typeof data.detail === 'string'
                ? data.detail
                : 'Не удалось войти через Связь ID. Откройте продукт из каталога ещё раз.',
            );
          }
          return;
        }
        localStorage.setItem('access_token', data.access_token);
        window.location.replace('/');
      } catch {
        if (!cancelled) setError('Потеряшки не ответили. Проверьте, что сервер запущен.');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [params]);

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md rounded border-2 border-gray-300 bg-white p-6 text-center shadow-md">
        <h1 className="text-xl font-bold">Вход через Связь ID</h1>
        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : <p className="mt-4 text-sm">Открываем Потеряшки…</p>}
      </div>
    </div>
  );
};

export default SvyazEntryPage;
