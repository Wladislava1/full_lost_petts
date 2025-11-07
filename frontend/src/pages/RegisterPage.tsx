import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import bg from '../assets/bg.png';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordRepeat, setPasswordRepeat] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== passwordRepeat) {
      setError('Пароли не совпадают');
      return;
    }

    setLoading(true);

    try {
      await register(name, email, password, passwordRepeat);
      navigate('/');
    } catch {
      setError('Ошибка регистрации. Возможно, email уже используется');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex justify-center items-center min-h-screen bg-cover bg-center overflow-hidden"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-80 space-y-4 text-center border border-gray-300">
        <h2 className="text-xl font-bold">Регистрация</h2>
        
        {error && <div className="text-red-500 text-sm">{error}</div>}
        
        <input 
          type="text" 
          placeholder="Имя" 
          className="w-full border p-2 rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input 
          type="email" 
          placeholder="Email" 
          className="w-full border p-2 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input 
          type="password" 
          placeholder="Пароль" 
          className="w-full border p-2 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input 
          type="password" 
          placeholder="Повторите пароль" 
          className="w-full border p-2 rounded"
          value={passwordRepeat}
          onChange={(e) => setPasswordRepeat(e.target.value)}
          required
        />
        <button 
          type="submit" 
          className="bg-blue-500 text-white w-full p-2 rounded hover:bg-green-600 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Регистрация...' : 'Зарегистрироваться'}
        </button>
        <p className="text-sm">
          Уже есть аккаунт? <Link to="/login" className="text-blue-500 hover:underline">Войти</Link>
        </p>
        <p className="text-sm mt-2">
          <Link to="/" className="text-blue-500 hover:underline">На главную страницу</Link>
        </p>
      </form>
    </div>
  );
};

export default RegisterPage;