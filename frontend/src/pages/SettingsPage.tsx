import { useState, useEffect } from "react";
import { FaUserCircle } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { apiService } from "../services/api";
import bg2 from '../assets/bg2.jpg';

interface UserSettings {
  name: string;
  email: string;
  contacts: string[];
  city: string;
  avatar?: string;
}

const SettingsPage = () => {
  const [user, setUser] = useState<UserSettings>({
    name: "",
    email: "",
    contacts: [""],
    city: "",
    avatar: "",
  });
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [loading, setLoading] = useState(false);

  const { user: authUser, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (authUser) {
      loadUserProfile();
    }
  }, [authUser]);

  const loadUserProfile = async () => {
    try {
      const profile = await apiService.getProfile();
      setUser({
        name: profile.name,
        email: profile.email,
        contacts: [""],
        city: "",
        avatar: ""
      });
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleChange = (field: keyof UserSettings, value: string | string[]) => {
    setUser({ ...user, [field]: value });
  };

  const handleContactChange = (index: number, value: string) => {
    const updatedContacts = [...user.contacts];
    updatedContacts[index] = value;
    handleChange("contacts", updatedContacts);
  };

  const addContactField = () => {
    if (user.contacts.length < 3) {
      handleChange("contacts", [...user.contacts, ""]);
    }
  };

  const removeContactField = (index: number) => {
    const updatedContacts = [...user.contacts];
    updatedContacts.splice(index, 1);
    handleChange("contacts", updatedContacts);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      alert("Настройки сохранены!");
    } catch (error) {
      console.error('Error saving settings:', error);
      alert("Ошибка при сохранении настроек");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!authUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Необходимо авторизоваться</div>
        <Link to="/login" className="ml-4 text-blue-500">Войти</Link>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gray-100">
      <img
        src={bg2}
        alt="фон"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black opacity-50"></div>

      <div className="sticky top-0 z-30 bg-black bg-opacity-20 p-4 flex justify-between items-center shadow">
        <div className="relative inline-block">
          <button
            className="text-white text-4xl rounded-full"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <FaUserCircle />
          </button>
          {showUserMenu && (
            <div className="absolute mt-2 right-0 md:left-0 bg-white rounded shadow-md w-48 z-50 overflow-hidden">
              <Link to="/profile" className="block px-4 py-2 hover:bg-gray-100">
                {user.name}
              </Link>
              <Link to="/settings" className="block px-4 py-2 hover:bg-gray-100">
                Настройки
              </Link>
              <button 
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 cursor-pointer"
              >
                Выход
              </button>
            </div>
          )}
        </div>
        <Link
          to="/"
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
        >
          На главную
        </Link>
      </div>

      <div className="relative z-20 mt-8 max-w-md mx-auto bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-bold mb-4">Настройки профиля</h2>

        <div className="mb-4">
          <label className="block mb-1">Имя</label>
          <input
            type="text"
            value={user.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1">Email</label>
          <input
            type="email"
            value={user.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className="w-full border p-2 rounded"
            disabled
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1">Город</label>
          <input
            type="text"
            value={user.city}
            onChange={(e) => handleChange("city", e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1">Контакты</label>
          {user.contacts.map((contact, index) => (
            <div key={index} className="flex gap-2 mb-1">
              <input
                type="text"
                value={contact}
                onChange={(e) => handleContactChange(index, e.target.value)}
                className="border p-2 rounded flex-1"
              />
              <button
                className="bg-red-500 text-white px-2 rounded hover:bg-red-600"
                onClick={() => removeContactField(index)}
              >
                ✖
              </button>
            </div>
          ))}
          {user.contacts.length < 3 && (
            <button
              className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
              onClick={addContactField}
            >
              Добавить контакт
            </button>
          )}
        </div>

        <button
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 w-full disabled:opacity-50"
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? 'Сохранение...' : 'Сохранить изменения'}
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;