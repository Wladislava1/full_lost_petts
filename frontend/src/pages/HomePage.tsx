import AnnouncementCard from '../components/AnnouncementCard';
import AnnouncementModal from '../components/AnnouncementModal';
import { useState } from 'react';
import bg2 from '../assets/bg2.jpg';
import { FaUserCircle } from 'react-icons/fa';

interface Announcement {
  title: string;
  description: string;
  date: string;
  image: string;
  found: boolean;
  ownerName?: string;
  contactInfo?: string;
}

const HomePage = () => {
  const [search, setSearch] = useState('');
  const [foundFilter, setFoundFilter] = useState<'all' | 'found' | 'notFound'>('all');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  const dummyData = [
  { animalName: "Барсик", title: "Пропал кот", description: "Черный кот, очень дружелюбный", date: "2025-10-15", image: "/static/cat.jpg", found: false },
  { animalName: "Жора", title: "Найдена собака", description: "Собака белая с коричневыми пятнами", date: "2025-10-14", image: "/static/dog.jpg", found: true },
  { animalName: "Гена", title: "Пропала попугай", description: "Зеленый попугай с красным клювом", date: "2025-10-12", image: "/static/parrot.jpg", found: false },
  { animalName: "", title: "Найдена кошка", description: "Серая кошка с белой лапкой", date: "2025-10-13", image: "/static/graycat.jpg", found: true },
  { animalName: "Наташа", title: "Пропала черепаха", description: "Маленькая красноухая черепаха", date: "2025-10-10", image: "/static/turtle.jpg", found: false },
  { animalName: "Ватрушка", title: "Найдена собака", description: "Коричневая собака с черными ушами", date: "2025-10-09", image: "/static/browndog.jpg", found: true },
  { animalName: "", title: "Пропала кошка", description: "Белая кошка с голубыми глазами", date: "2025-10-08", image: "/static/whitecat.jpg", found: false },
  { animalName: "Хвост", title: "Найдена собака", description: "Черная собака с длинной шерстью", date: "2025-10-07", image: "/static/blackdog.jpg", found: true },
  { animalName: "", title: "Пропала морская свинка", description: "Белая с рыжим пятном", date: "2025-10-06", image: "/static/guinea.jpg", found: false },
  { animalName: "Лапка", title: "Найдена кошка", description: "Черная кошка с белым носиком", date: "2025-10-05", image: "/static/blackcat.jpg", found: true },
  { animalName: "Шурик", title: "Пропала собака", description: "Рыжая собака с короткой шерстью", date: "2025-10-04", image: "/static/reddog.jpg", found: false },
  { animalName: "", title: "Найдена попугай", description: "Синий попугай с желтым животиком", date: "2025-10-03", image: "/static/blueparrot.jpg", found: true },
];


  const filteredData = dummyData.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase());
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
                <p className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Имя пользователя</p>
                <p className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Настройки</p>
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
                <div key={index} onClick={() => setSelectedAnnouncement(item)}>
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
