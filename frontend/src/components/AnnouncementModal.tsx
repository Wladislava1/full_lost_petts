type Announcement = {
  title: string;
  description: string;
  date: string;
  image: string;
  found: boolean;
  ownerName?: string;
  contactInfo?: string;
};

export default function AnnouncementModal(props: { announcement: Announcement; onClose: () => void }) {
  const { announcement, onClose } = props;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full relative">
        <button
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
          onClick={onClose}
        >
          ✖
        </button>

        <img
          src={announcement.image}
          alt={announcement.title}
          className="w-full h-64 object-cover rounded mb-4"
        />

        <h2 className="text-2xl font-bold mb-2">{announcement.title}</h2>
        <p className="text-gray-700 mb-2">{announcement.description}</p>
        <p className="text-gray-500 mb-2">Дата: {announcement.date}</p>
        <p className="text-gray-500 mb-4">Статус: {announcement.found ? "Найдено" : "Не найдено"}</p>

        {announcement.ownerName && (
          <p className="text-gray-700 mb-2">Владелец: {announcement.ownerName}</p>
        )}
        {announcement.contactInfo && (
          <p className="text-gray-700 mb-4">Контакты: {announcement.contactInfo}</p>
        )}

        <div className="flex space-x-2">
          <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Поделиться
          </button>
          {!announcement.found && (
            <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
              Создать листовку
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
