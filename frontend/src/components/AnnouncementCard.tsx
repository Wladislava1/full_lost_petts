import { getImageUrl } from '../hooks/url';

interface AnnouncementCardProps {
  animalName?: string;
  title: string;
  description?: string;
  date?: string;
  image: string;
}

function AnnouncementCard({
  animalName,
  title,
  description,
  date,
  image,
}: AnnouncementCardProps) {
  const imageUrl = getImageUrl(image);

  return (
    <div className="bg-white border border-gray-300 rounded-lg shadow-md p-4 max-w-sm h-[420px] flex flex-col hover:shadow-lg transition-shadow">
      <div className="flex-[2] overflow-hidden rounded">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = '/default-image.jpg';
          }}
        />
      </div>

      <div className="flex-1 mt-3 flex flex-col justify-between overflow-hidden">
        <h2 className="font-bold text-lg leading-tight">
          {title}
          {animalName && <span> - {animalName}</span>}
        </h2>

        {description && (
          <p className="text-gray-700 mt-1 text-sm line-clamp-3">
            {description}
          </p>
        )}

        {date && (
          <p className="text-gray-500 text-xs mt-2 self-start">
            {date}
          </p>
        )}
      </div>
    </div>
  );
}

export default AnnouncementCard;