import AnnouncementCard from '../components/AnnouncementCard';
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import bg2 from '../assets/bg2.jpg';
import { FaUserCircle } from 'react-icons/fa';
import EditAnnouncementModal from "../components/EditAnnouncementModal";
import type { Announcement, EditableAnnouncement, Contact } from '../types/index';
type BackendContact = Contact | string;

const ProfilePage = () => {
  const [userAnnouncements, setUserAnnouncements] = useState<Announcement[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'lost' | 'found'>('all');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const normalizeContacts = (contacts: BackendContact[] | undefined): Contact[] => {
    if (!contacts) return [];
    
    return contacts.map(item => {
      if (typeof item === 'string') {
        return {
          type: 'Телефон',
          value: item,
          is_primary: false
        };
      }
      return {
        type: item.type || 'Телефон',
        value: item.value || '',
        is_primary: item.is_primary || false
      };
    });
  };

  useEffect(() => {
    if (user) {
      loadUserAnnouncements();
    }
  }, [user]);

  const loadUserAnnouncements = async () => {
    try {
      console.log('Loading user announcements...');
      const data = await apiService.getUserAnnouncements();
      console.log('Received announcements:', data);
      setUserAnnouncements(data);
    } catch (error) {
      console.error('Error loading user announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = userAnnouncements.filter(item => {
    const searchLower = search.toLowerCase();
    const matchesSearch = 
      item.title.toLowerCase().includes(searchLower) ||
      item.description.toLowerCase().includes(searchLower) ||
      item.city.toLowerCase().includes(searchLower) ||
      item.animal_name.toLowerCase().includes(searchLower);

    const matchesFilter = 
      typeFilter === 'all' || 
      (typeFilter === 'lost' && item.type === 'Пропажа') ||
      (typeFilter === 'found' && item.type === 'Находка');

    return matchesSearch && matchesFilter;
  });

  const handleUpdateAnnouncement = async (updated: EditableAnnouncement) => {
    try {
      await apiService.updateAnnouncement(updated.id, {
        type: updated.found ? 'Находка' : 'Пропажа',
        title: updated.title,
        city: updated.city,
        description: updated.description,
        animal_name: updated.animalName,
        contact_info: updated.contactInfo,
      });
      await loadUserAnnouncements();
      setSelectedAnnouncement(null);
    } catch (error) {
      console.error('Error updating announcement:', error);
    }
  };

  const handleDeleteAnnouncement = async (announcement: Announcement) => {
    if (!confirm(`Удалить объявление "${announcement.title}"?`)) return;
    
    console.log('Deleting announcement ID:', announcement.id);
    console.log('Current count before delete:', userAnnouncements.length);
  
    const previousAnnouncements = [...userAnnouncements];
    
    setUserAnnouncements(prev => prev.filter(item => item.id !== announcement.id));
    setSelectedAnnouncement(null);
    
    try {
      await apiService.deleteAnnouncement(announcement.id);
      console.log('Backend delete successful');
      
      await loadUserAnnouncements();
      console.log('Reload completed');
      
    } catch (error) {
      console.error('Error deleting announcement:', error);
      setUserAnnouncements(previousAnnouncements);
      alert('Ошибка при удалении объявления');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center gap-4">
        <div className="text-xl">Необходимо авторизоваться</div>
        <Link to="/login" className="text-blue-500 underline">Войти</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cover bg-center relative" style={{ backgroundImage: `url(${bg2})` }}>
      <div className="absolute inset-0 bg-black opacity-20"></div>

      <div className="relative z-10">
        <div className="sticky top-0 z-20 bg-black bg-opacity-20 p-4 rounded-md mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="relative">
            <button onClick={() => setShowUserMenu(!showUserMenu)} className="text-white text-4xl">
              <FaUserCircle />
            </button>
            {showUserMenu && (
              <div className="absolute mt-2 right-0 md:left-0 bg-white rounded shadow-lg w-48 z-50">
                <p className="px-4 py-2 font-medium border-b">{user.name}</p>
                <Link to="/settings" className="block px-4 py-2 hover:bg-gray-100">Настройки</Link>
                <button onClick={handleLogout} className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600">
                  Выход
                </button>
              </div>
            )}
          </div>

          <input
            type="text"
            placeholder="Поиск..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="p-2 border rounded flex-1 min-w-[200px]"
          />

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as 'all' | 'lost' | 'found')}
            className="p-2 border rounded-full bg-blue-500 text-white"
          >
            <option value="all">Все</option>
            <option value="lost">Пропажа</option>
            <option value="found">Находка</option>
          </select>

          <Link to="/create" className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">
            + Добавить
          </Link>
          <Link to="/" className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded">
            Главная
          </Link>
        </div>

        <div className="flex justify-center py-8 px-4">
          <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl w-full">
            {filteredData.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedAnnouncement(item)}
                className="cursor-pointer transform transition hover:scale-105"
              >
                <AnnouncementCard
                  title={item.title}
                  description={item.description}
                  date={new Date(item.created_at).toLocaleDateString()}
                  image={item.image || '/default-image.jpg'}
                  animalName={item.animal_name}
                  city={item.city}
                />
              </div>
            ))}
          </main>
        </div>
      </div>

      {selectedAnnouncement && (
        <EditAnnouncementModal
          announcement={{
            id: selectedAnnouncement.id,
            title: selectedAnnouncement.title,
            description: selectedAnnouncement.description,
            city: selectedAnnouncement.city,
            image: selectedAnnouncement.image || '/default-image.jpg',
            date: new Date(selectedAnnouncement.created_at).toLocaleDateString(),
            found: selectedAnnouncement.type === 'Находка',
            animalName: selectedAnnouncement.animal_name,
            contactInfo: normalizeContacts(selectedAnnouncement.contact_info)
          }}
          onClose={() => setSelectedAnnouncement(null)}
          onSave={handleUpdateAnnouncement}
          onDelete={() => handleDeleteAnnouncement(selectedAnnouncement)}
        />
      )}
    </div>
  );
};

export default ProfilePage;