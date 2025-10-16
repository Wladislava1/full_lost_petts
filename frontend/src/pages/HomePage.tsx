import AnnouncementCard from '../components/AnnouncementCard';
import AnnouncementModal from '../components/AnnouncementModal';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import bg2 from '../assets/bg2.jpg';
import { FaUserCircle } from 'react-icons/fa';
import { dataTest } from '../../fixtures/animal';

interface Announcement {
  animalName?: string;
  title: string;
  description: string;
  date: string;
  image: string;
  found: boolean;
  ownerName?: string;
  contactInfo?: string[];
}

const HomePage = () => {
  const [search, setSearch] = useState('');
  const [foundFilter, setFoundFilter] = useState<'all' | 'found' | 'notFound'>('all');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  const dummyData = dataTest;

  const currentUser = 'Владислава';

  const filteredData = dummyData.filter(item => {
    const searchLower = search.toLowerCase();

    const combinedText = [
      item.title,
      item.description,
      item.animalName,
      item.ownerName,
      ...(item.contactInfo || [])
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchesSearch = combinedText.includes(searchLower);

    const matchesFilter =
      foundFilter === 'all' ||
      (foundFilter === 'found' && item.found) ||
      (foundFilter === 'notFound' && !item.found);

    return matchesSearch && matchesFilter;
  });

  return (
    <div
      className="min-h-screen bg-cover bg-center relative"
      style={{ backgroundImage: `url(${bg2})` }}
    >
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
                <Link to="/profile" className="block px-4 py-2 hover:bg-gray-100">
                  {currentUser}
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

          <input
            type="text"
            placeholder="Поиск объявления..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="p-2 border rounded flex-1 min-w-[200px]"
          />

          <select
            value={foundFilter}
            onChange={(e) => setFoundFilter(e.target.value as 'all' | 'found' | 'notFound')}
            className="p-2 border rounded-full bg-blue-500 text-white mt-4"
          >
            <option value="all">Все</option>
            <option value="found">Найдено</option>
            <option value="notFound">Не найдено</option>
          </select>

          <a
            href="/create"
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            Добавить объявление
          </a>
        </div>

        <div className="flex justify-center items-start py-12">
            <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredData.map((item, index) => (
                <div
                  key={index}
                  onClick={() => 
                    setSelectedAnnouncement({
                      ...item,
                      contactInfo: Array.isArray(item.contactInfo) 
                        ? item.contactInfo 
                        : item.contactInfo ? [item.contactInfo] : []
                    })
                  }
                >
                  <AnnouncementCard {...item} />
                </div>
                ))}
            </main>
        </div>
      </div>

      {selectedAnnouncement && (
        <AnnouncementModal
          announcement={selectedAnnouncement}
          onClose={() => setSelectedAnnouncement(null)}
        />
      )}
    </div>
  );
};

export default HomePage;
