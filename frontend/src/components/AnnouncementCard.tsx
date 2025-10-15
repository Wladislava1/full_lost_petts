interface AnnouncementCardProps {
  animalName?: string;       // Имя животного
  title: string;            // Название объявления
  description: string;
  date: string;
  image: string;
}

function AnnouncementCard({ animalName, title, description, date, image }: AnnouncementCardProps) {
  return (
    <div className="bg-white border border-gray-300 rounded-lg shadow-md p-4 max-w-sm hover:shadow-lg transition-shadow">
      <img src={image} alt={"тут фотка"} className="w-full h-48 object-cover rounded" />
      <h2 className="font-bold text-lg mt-2">{animalName || "Нет клички"}</h2>
      <h3 className="text-gray-800 font-medium mt-1">{title}</h3>
      <p className="text-gray-700 mt-1">{description}</p>
      <p className="text-gray-500 text-sm mt-2">{date}</p>
    </div>
  );
}

export default AnnouncementCard;
