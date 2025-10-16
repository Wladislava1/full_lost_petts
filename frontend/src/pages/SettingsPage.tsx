import { useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import { Link } from "react-router-dom";
import bg2 from '../assets/bg2.jpg';

interface UserSettings {
  name: string;
  contacts: string[];
  city: string;
  avatar?: string; 
}

const SettingsPage = () => {
  const [user, setUser] = useState<UserSettings>({
    name: "Владислава",
    contacts: ["example@mail.com", "123456789"],
    city: "Москва",
    avatar: "",
  });

  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleChange = (field: keyof UserSettings, value: string | string[]) => {
    setUser({ ...user, [field]: value });
  };

  const handleAvatarChange = (file: File) => {
    const url = URL.createObjectURL(file);
    setUser({ ...user, avatar: url });
  };

  const handleRemoveAvatar = () => {
    setUser({ ...user, avatar: "" });
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
                  Владислава
                </Link>
                <Link
                  to="/settings"
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  Настройки
                </Link>
                <p className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Выход</p>
              </div>
            )}
          </div>
        <a
            href="/"
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
          >
            На главную
          </a>
      </div>


      <div className="relative z-20 mt-8 max-w-md mx-auto bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-bold mb-4">Настройки профиля</h2>

        <div className="mb-4 flex items-center gap-4">
          {user.avatar ? (
            <img src={user.avatar} alt="Аватар" className="w-20 h-20 rounded-full object-cover" />
          ) : (
            <FaUserCircle className="w-20 h-20 text-gray-400" />
          )}
          <div className="flex flex-col gap-2">
            <input
              type="file"
              accept="image/*"
              id="avatar-file"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) handleAvatarChange(e.target.files[0]);
              }}
            />
            <label
              htmlFor="avatar-file"
              className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 cursor-pointer text-center"
            >
              Заменить
            </label>
            {user.avatar && (
              <button
                className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                onClick={handleRemoveAvatar}
              >
                Удалить
              </button>
            )}
          </div>
        </div>

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
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 w-full"
          onClick={() => alert("Сохранено!")}
        >
          Сохранить изменения
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
