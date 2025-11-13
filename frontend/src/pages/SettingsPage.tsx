import { useState, useEffect } from "react";
import { FaUserCircle } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { apiService } from "../services/api";
import bg2 from '../assets/bg2.jpg';

interface Contact {
  type: string;
  value: string;
}

interface UserSettings {
  id?: number;
  name: string;
  email: string;
  contacts: Contact[];
  city: string;
}

const SettingsPage = () => {
  const [user, setUser] = useState<UserSettings>({
    name: "",
    email: "",
    contacts: [{ type: 'Телефон', value: "" }],
    city: "",
  });
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const contactTypes = ['Телефон', 'Телеграм', 'ВКонтакте', 'WhatsApp', 'Email'];
  const { user: authUser, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (authUser) {
      loadUserProfile();
    }
  }, [authUser]);

  const detectContactType = (value: string): string => {
    const trimmed = value.trim();
    
    if (/^[+]?[0-9\s\-()]+$/.test(trimmed)) {
      return 'Телефон';
    } else if (trimmed.includes('@') && !trimmed.includes('t.me') && !trimmed.includes('vk.com')) {
      return 'Email';
    } else if (trimmed.includes('t.me') || trimmed.startsWith('@')) {
      return 'Телеграм';
    } else if (trimmed.includes('vk.com')) {
      return 'ВКонтакте';
    } else if (trimmed.includes('wa.me') || trimmed.includes('whatsapp')) {
      return 'WhatsApp';
    }
    
    return 'Телефон';
  };

  const loadUserProfile = async () => {
    try {
      const profile = await apiService.getProfile();
      console.log('Profile data:', profile);
      
      let userContacts: Contact[] = [{ type: 'Телефон', value: "" }];
      
      if (profile.contacts && profile.contacts.length > 0) {
        userContacts = (profile.contacts as string[])
          .filter(contact => contact.trim() !== '')
          .map(contact => ({ 
            type: detectContactType(contact),
            value: contact 
          }));
      }
      
      setUser({
        name: profile.name || "",
        email: profile.email || "",
        city: profile.city || "",
        contacts: userContacts,
      });
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleChange = (field: keyof Omit<UserSettings, 'contacts'>, value: string) => {
    setUser(prev => ({ ...prev, [field]: value }));
  };

  const handleContactChange = (index: number, field: 'type' | 'value', newValue: string) => {
    const updatedContacts = [...user.contacts];
    updatedContacts[index] = { ...updatedContacts[index], [field]: newValue };
    setUser(prev => ({ ...prev, contacts: updatedContacts }));
  };

  const addContactField = () => {
    if (user.contacts.length < 3) {
      setUser(prev => ({
        ...prev,
        contacts: [...prev.contacts, { type: 'Телефон', value: "" }]
      }));
    }
  };

  const removeContactField = (index: number) => {
    const updatedContacts = [...user.contacts];
    updatedContacts.splice(index, 1);
    setUser(prev => ({
      ...prev,
      contacts: updatedContacts.length > 0 ? updatedContacts : [{ type: 'Телефон', value: "" }]
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Преобразуем контакты в массив строк для бэкенда
      const contactsForBackend = user.contacts
        .filter(c => c.value.trim() !== '')
        .map(c => c.value.trim());

      await apiService.updateProfile({
        name: user.name,
        city: user.city.trim() === "" ? undefined : user.city,
        contacts: contactsForBackend,
      });
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
                {user.name || authUser.name}
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
          <p className="text-sm text-gray-500 mt-1">Email нельзя изменить</p>
        </div>

        <div className="mb-4">
          <label className="block mb-1">Город</label>
          <input
            type="text"
            value={user.city}
            onChange={(e) => handleChange("city", e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="Введите ваш город"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1">Контакты</label>
          {user.contacts.map((contact, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <select
                value={contact.type}
                onChange={(e) => handleContactChange(index, 'type', e.target.value)}
                className="border p-2 rounded w-1/3"
              >
                {contactTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <input
                type="text"
                value={contact.value}
                onChange={(e) => handleContactChange(index, 'value', e.target.value)}
                className="border p-2 rounded flex-1"
                placeholder="Значение контакта"
              />
              {user.contacts.length > 1 && (
                <button
                  className="bg-red-500 text-white px-3 rounded hover:bg-red-600"
                  onClick={() => removeContactField(index)}
                >
                  ✖
                </button>
              )}
            </div>
          ))}
          {user.contacts.length < 3 && (
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm"
              onClick={addContactField}
            >
              + Добавить контакт
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