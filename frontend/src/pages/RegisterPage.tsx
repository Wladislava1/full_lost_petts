import { Link } from 'react-router-dom';
import bg from '../assets/bg.png';

const RegisterPage = () => {
  return (
    <div
      className="flex justify-center items-center min-h-screen bg-cover bg-center overflow-hidden"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <form className="bg-white p-6 rounded shadow-md w-80 space-y-4 text-center border border-gray-300">
        <h2 className="text-xl font-bold">Регистрация</h2>
        <input type="text" placeholder="Имя" className="w-full border p-2 rounded"/>
        <input type="email" placeholder="Email" className="w-full border p-2 rounded"/>
        <input type="password" placeholder="Пароль" className="w-full border p-2 rounded"/>
        <input type="password" placeholder="Повторите пароль" className="w-full border p-2 rounded"/>
        <button className="bg-blue-500 text-white w-full p-2 rounded hover:bg-green-600">Зарегистрироваться</button>
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
