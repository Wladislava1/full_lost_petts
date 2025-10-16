import { useState } from 'react';
import bg2 from '../assets/bg2.jpg';
import { Link } from 'react-router-dom';

const CreateAnnouncementPage = () => {
  const [type, setType] = useState<'lost' | 'found'>('lost');
  const [contacts, setContacts] = useState(['']);

  const handleAddContact = () => {
    if (contacts.length < 3) {
      setContacts([...contacts, '']);
    }
  };

  const handleContactChange = (index: number, value: string) => {
    const updated = [...contacts];
    updated[index] = value;
    setContacts(updated);
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center relative flex items-center justify-center p-4"
      style={{ backgroundImage: `url(${bg2})` }}
    >
      <div className="absolute inset-0 bg-black opacity-30"></div>

      <Link
        to="/"
        className="absolute top-4 right-4 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded shadow-md z-20"
      >
        Главная
      </Link>

      <div className="relative z-10 w-full max-w-md bg-white rounded-lg border shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">Создать объявление</h1>

        <div className="mb-4">
          <label className="mr-2 font-medium">Тип объявления:</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as 'lost' | 'found')}
            className="p-2 rounded-full bg-blue-500 text-white border focus:outline-none"
          >
            <option value="lost">Пропажа</option>
            <option value="found">Находка</option>
          </select>
        </div>

        <form className="space-y-4">
          <input type="text" placeholder="Ваше имя" className="w-full border p-2 rounded" />

          {/* Контактные данные */}
          {contacts.map((contact, index) => (
            <input
              key={index}
              type="text"
              placeholder="Контактные данные"
              className="w-full border p-2 rounded"
              value={contact}
              onChange={(e) => handleContactChange(index, e.target.value)}
            />
          ))}

          {contacts.length < 3 && (
            <button
              type="button"
              className="bg-gray-100 text-black px-4 py-2 rounded hover:bg-gray-400"
              onClick={handleAddContact}
            >
              Добавить контакт
            </button>
          )}

          <input type="text" placeholder="Кличка животного (на ошейнике обычно)" className="w-full border p-2 rounded" />
          <input type="text" placeholder="Порода" className="w-full border p-2 rounded" />
          <input type="text" placeholder="Район" className="w-full border p-2 rounded" />

          <textarea
            placeholder="Описание/особенности"
            className="w-full border p-2 rounded h-25 resize-none"
          ></textarea>

          <input type="file" className="w-full" />

          <div className="flex gap-4">
            <Link
              to="/"
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 flex-1 text-center"
            >
              Отменить
            </Link>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex-1"
            >
              Создать объявление
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAnnouncementPage;
