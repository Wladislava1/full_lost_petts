interface AnnouncementCardProps {
  animalName?: string;
  title: string;
  description?: string;
  date?: string;
  image: string;
}

function AnnouncementCard({ animalName, title, description, date, image }: AnnouncementCardProps) {
  return (
    <div className="bg-white border border-gray-300 rounded-lg shadow-md p-4 max-w-sm h-[420px] flex flex-col hover:shadow-lg transition-shadow">
      
      <div className="flex-[2]">
        <img
          src={image}
          alt="тут фотка"
          className="w-full h-full object-cover rounded"
        />
      </div>

      <div className="flex-[1] mt-2 flex flex-col justify-between">
        <h2 className="font-bold text-lg">
          {title}{animalName ? ` — ${animalName}` : " — Нет клички"}
        </h2>
        {description && <p className="text-gray-700 mt-1 line-clamp-3">{description}</p>}
        {date && <p className="text-gray-500 text-sm mt-2">{date}</p>}
      </div>
    </div>
  );
}

export default AnnouncementCard;
