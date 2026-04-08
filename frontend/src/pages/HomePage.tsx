import AnnouncementCard from '../components/AnnouncementCard';
import AnnouncementModal from '../components/AnnouncementModal';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import bg2 from '../assets/bg2.jpg';
import { FaUserCircle } from 'react-icons/fa';
import { apiService } from '../services/api';
// 1. Добавили импорт Helmet
import { Helmet } from 'react-helmet-async';

interface Announcement {
  id: number;
  type: string;
  title: string;
  city: string;
  description: string;
  image?: string;
  animal_name: string;
  contact_info?: string[];
  created_at: string;
  user_id: number;
  // 2. Добавили координаты, чтобы TypeScript их пропускал
  latitude?: number | null;
  longitude?: number | null;
}

const HomePage = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'lost' | 'found'>('all');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);
  
  const { user, logout } = useAuth();

  useEffect(() => {
    loadAnnouncements();
  }, [typeFilter, search]);

  const loadAnnouncements = async () => {
    setLoading(true);
    try {
      const filters: Record<string, string> = {};
      
      if (typeFilter === 'lost') filters.type = 'Пропажа';
      if (typeFilter === 'found') filters.type = 'Находка';
      
      if (search) filters.animal_name = search; 

      const data = await apiService.getAnnouncements(filters);
      setAnnouncements(data);
    } catch (error) {
      console.error('Error loading announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAnnouncement = async (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить это объявление?')) {
      try {
        await apiService.deleteAnnouncement(id);

        setAnnouncements(prev => prev.filter(ad => ad.id !== id));
        alert('Объявление успешно удалено');
      } catch (error) {
        console.error('Ошибка при удалении:', error);
        alert('Не удалось удалить объявление. Возможно, у вас нет прав.');
      }
    }
  };

  const filteredData = announcements.filter(item => {
    const searchLower = search.toLowerCase();
    const matchesSearch = 
      item.title.toLowerCase().includes(searchLower) ||
      item.animal_name.toLowerCase().includes(searchLower) ||
      item.description.toLowerCase().includes(searchLower) ||
      item.city.toLowerCase().includes(searchLower);

    const matchesFilter = 
      typeFilter === 'all' || 
      (typeFilter === 'lost' && item.type === 'Пропажа') ||
      (typeFilter === 'found' && item.type === 'Находка');

    return matchesSearch && matchesFilter;
  });

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Загрузка...</div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center relative"
      style={{ backgroundImage: `url(${bg2})` }}
    >
      {/* 3. Добавили Helmet для изменения названия вкладки браузера */}
      <Helmet>
        <title>Поиск питомцев | Главная</title>
        <meta name="description" content="База данных пропавших и найденных животных. Поможем питомцам вернуться домой." />
      </Helmet>

      <div className="absolute inset-0 bg-black opacity-20"></div>

      <div className="relative z-10">
        <div className="sticky top-0 z-20 bg-black bg-opacity-20 p-4 rounded-md mb-4 flex flex-wrap items-end justify-between gap-2">
          <div className="relative inline-block">
            <button
              className="text-white text-4xl rounded-full"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <FaUserCircle />
            </button>
            {showUserMenu && (
              <div className="absolute mt-2 right-0 md:left-0 bg-white rounded shadow-md w-48 z-50 overflow-hidden">
                <Link 
                  to="/profile" 
                  className="block px-4 py-2 hover:bg-gray-100"
                  onClick={() => setShowUserMenu(false)}
                >
                  {user?.name}
                </Link>
                <Link 
                  to="/settings" 
                  className="block px-4 py-2 hover:bg-gray-100"
                  onClick={() => setShowUserMenu(false)}
                >
                  Настройки
                </Link>
                {user?.role === 'admin' && (
                  <Link 
                    to="/admin" 
                    className="block px-4 py-2 hover:bg-gray-100 text-orange-600 font-semibold"
                    onClick={() => setShowUserMenu(false)}
                  >
                    Панель админа
                  </Link>
                )}
                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600 cursor-pointer"
                >
                  Выход
                </button>
              </div>
            )}
          </div>

          <input
            type="text"
            placeholder="Поиск объявления..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="p-2 border rounded flex-1 min-w-[200px]"
          />

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as 'all' | 'lost' | 'found')}
            className="p-2 border rounded-full bg-blue-500 text-white mt-4"
          >
            <option value="all">Все</option>
            <option value="lost">Пропажа</option>
            <option value="found">Находка</option>
          </select>
          <Link
            to="/create"
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            Добавить объявление
          </Link>
        </div>

        <div className="flex justify-center items-start py-12">
          <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredData.map((item) => {
              const hasUserId = user?.id !== undefined;
              const hasAuthorId = item.user_id !== undefined;
              const isAdmin = user?.role === 'admin';
              const isOwner = hasUserId && hasAuthorId && user.id === item.user_id;
              const canDelete = isAdmin || isOwner;

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedAnnouncement(item)}
                  className="cursor-pointer transform transition hover:scale-105"
                >
                  <AnnouncementCard
                    id={item.id}              
                    user_id={item.user_id}    
                    title={item.title}
                    description={item.description}
                    date={new Date(item.created_at).toLocaleDateString()}
                    image={item.image || '/default-image.jpg'}
                    animalName={item.animal_name}
                    city={item.city}
                    onDelete={canDelete ? handleDeleteAnnouncement : undefined} 
                  />
                </div>
              );
            })}
          </main>
        </div>
      </div>

      {selectedAnnouncement && (
        <AnnouncementModal
          announcement={{
            id: selectedAnnouncement.id,             
            user_id: selectedAnnouncement.user_id,   
            title: selectedAnnouncement.title,
            description: selectedAnnouncement.description,
            date: new Date(selectedAnnouncement.created_at).toLocaleDateString(),
            image: selectedAnnouncement.image || '/default-image.jpg',
            found: selectedAnnouncement.type === 'Находка',
            ownerName: 'Неизвестно',
            contactInfo: selectedAnnouncement.contact_info || [],
            city: selectedAnnouncement.city,
            // 4. ПЕРЕДАЕМ КООРДИНАТЫ В МОДАЛКУ (раньше они сюда не доходили)
            latitude: selectedAnnouncement.latitude,
            longitude: selectedAnnouncement.longitude,
          }}
          onClose={() => setSelectedAnnouncement(null)}
          onDelete={handleDeleteAnnouncement}
        />
      )}
    </div>
  );
};

export default HomePage;