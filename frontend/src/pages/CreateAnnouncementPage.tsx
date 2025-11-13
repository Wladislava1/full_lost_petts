import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/api';
import bg2 from '../assets/bg2.jpg';
import { Link } from 'react-router-dom';

type Contact = {
  type: string;
  value: string;
  is_primary: boolean;
};

const CreateAnnouncementPage = () => {
  const [type, setType] = useState<'lost' | 'found'>('lost');
  const [title, setTitle] = useState('');
  const [city, setCity] = useState('');
  const [description, setDescription] = useState('');
  const [animalName, setAnimalName] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([
    { type: 'Телефон', value: '', is_primary: true }
  ]);
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [error, setError] = useState('');

  const { user } = useAuth();
  const navigate = useNavigate();

  const contactTypes = ['Телефон', 'Телеграм', 'ВКонтакте', 'WhatsApp', 'Email'];

  // Функция автоматического определения типа контакта
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

  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
    try {
      setProfileLoading(true);
      const profile = await apiService.getProfile();
      console.log('User profile loaded:', profile);
      
      if (profile.city && profile.city.trim() !== '') {
        setCity(profile.city);
      }
      if (profile.contacts && profile.contacts.length > 0) {
        const profileContacts = profile.contacts
          .filter(contact => contact.trim() !== '')
          .map((contact, index) => ({
            type: detectContactType(contact),
            value: contact,
            is_primary: index === 0
          }));
        
        if (profileContacts.length > 0) {
          setContacts(profileContacts);
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleAddContact = () => {
    if (contacts.length < 3) {
      setContacts([...contacts, { type: 'Телефон', value: '', is_primary: false }]);
    }
  };

  const handleContactChange = (index: number, field: keyof Contact, value: string | boolean) => {
    const updated = [...contacts];
    
    if (field === 'value') {
      updated[index] = { 
        ...updated[index], 
        [field]: value as string,
        type: detectContactType(value as string)
      };
    } else if (field === 'type') {
      updated[index] = { 
        ...updated[index], 
        [field]: value as string 
      };
    } else if (field === 'is_primary') {
      updated[index] = { 
        ...updated[index], 
        [field]: value as boolean 
      };
      
      if (value === true) {
        updated.forEach((contact, i) => {
          if (i !== index) contact.is_primary = false;
        });
      }
    }
    
    setContacts(updated);
  };

  const handleRemoveContact = (index: number) => {
    const updated = [...contacts];
    updated.splice(index, 1);
    
    if (updated.length > 0 && !updated.some(contact => contact.is_primary)) {
      updated[0].is_primary = true;
    }
    
    setContacts(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!user) {
      setError('Необходимо авторизоваться');
      setLoading(false);
      return;
    }

    try {
      const announcementData = {
        type: type === 'lost' ? 'Пропажа' : 'Находка',
        title,
        city,
        description,
        animal_name: animalName,
        contact_info: contacts
          .filter(contact => contact.value.trim() !== '')
          .map((contact) => ({
            type: contact.type,
            value: contact.value.trim(),
            is_primary: contact.is_primary
          }))
      };

      console.log('Creating announcement:', announcementData);

      const newAnnouncement = await apiService.createAnnouncement(announcementData);
      console.log('Announcement created:', newAnnouncement);

      if (image && newAnnouncement.id) {
        console.log('Uploading image for announcement:', newAnnouncement.id);
        await apiService.uploadAdImage(newAnnouncement.id, image);
        console.log('Image uploaded successfully');
      }

      navigate('/');
    } catch (err: unknown) {
      setError('Ошибка при создании объявления');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Необходимо авторизоваться</div>
        <Link to="/login" className="ml-4 text-blue-500">Войти</Link>
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Загрузка...</div>
      </div>
    );
  }

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

        {error && <div className="text-red-500 text-sm mb-4 text-center">{error}</div>}

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

        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="text" 
            placeholder="Заголовок" 
            className="w-full border p-2 rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <input 
            type="text" 
            placeholder="Кличка животного" 
            className="w-full border p-2 rounded"
            value={animalName}
            onChange={(e) => setAnimalName(e.target.value)}
            required
          />

          <div>
            <label className="font-medium block mb-1">Город:</label>
            <input 
              type="text" 
              placeholder="Введите город"
              className="w-full border p-2 rounded"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
            {city && (
              <p className="text-sm text-gray-500 mt-1">
                Город предзаполнен из вашего профиля
              </p>
            )}
          </div>

          <textarea
            placeholder="Описание"
            className="w-full border p-2 rounded h-25 resize-none"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          ></textarea>

          <div>
            <label className="font-medium block mb-2">
              Контакты:
              {contacts.some(contact => contact.value.trim() !== '') && (
                <span className="text-sm text-gray-500 ml-2">
                  (предзаполнены из профиля)
                </span>
              )}
            </label>
            {contacts.map((contact, index) => (
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
                  placeholder="Значение контакта"
                  className="flex-1 border p-2 rounded"
                  value={contact.value}
                  onChange={(e) => handleContactChange(index, 'value', e.target.value)}
                />
                <div className="flex items-center gap-2">
                  <label className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={contact.is_primary}
                      onChange={(e) => handleContactChange(index, 'is_primary', e.target.checked)}
                      className="mr-1"
                    />
                    основной
                  </label>
                  {contacts.length > 1 && (
                    <button
                      type="button"
                      className="bg-red-500 text-white px-2 rounded hover:bg-red-600"
                      onClick={() => handleRemoveContact(index)}
                    >
                      ✖
                    </button>
                  )}
                </div>
              </div>
            ))}

            {contacts.length < 3 && (
              <button
                type="button"
                className="bg-gray-100 text-black px-4 py-2 rounded hover:bg-gray-400 text-sm"
                onClick={handleAddContact}
              >
                + Добавить контакт
              </button>
            )}
          </div>

          <div>
            <label className="font-medium block mb-2">Фотография:</label>
            <input 
              type="file" 
              className="w-full border p-2 rounded"
              accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
            />
          </div>

          <div className="flex gap-4">
            <Link
              to="/"
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 flex-1 text-center"
            >
              Отменить
            </Link>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex-1 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Создание...' : 'Создать объявление'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAnnouncementPage;