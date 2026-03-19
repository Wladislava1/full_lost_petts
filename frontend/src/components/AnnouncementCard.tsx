import { getImageUrl } from '../hooks/url';
import { useAuth } from '../hooks/useAuth';

interface AnnouncementCardProps {
  id?: number;         
  user_id?: number;    
  animalName?: string;
  title: string;
  description?: string;
  date?: string;
  image: string;
  city: string;
  onDelete?: (id: number) => void;
}

function AnnouncementCard({
  id,
  user_id,
  animalName,
  title,
  description,
  date,
  image,
  city,
  onDelete
}: AnnouncementCardProps) {
  const imageUrl = getImageUrl(image);
  const { user } = useAuth();
  
  // Проверка прав: Пользователь — админ ИЛИ это его объявление

  const isOwner = user?.id !== undefined && user_id !== undefined && user.id === user_id;
  const isAdmin = user?.role === 'admin';
  
  const canEditOrDelete = user && id && Boolean(user && id && (isAdmin || isOwner));

  return (
    <div className="bg-white border border-gray-300 rounded-lg shadow-md p-4 max-w-sm h-[420px] flex flex-col hover:shadow-lg transition-shadow relative group">
      
      {canEditOrDelete && onDelete && (
        <button 
          onClick={(e) => { 
            e.stopPropagation(); 
            onDelete(id); 
          }}
          className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity z-10"
        >
          Удалить
        </button>
      )}

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
          <p className="text-gray-600 text-sm mt-1">{city}</p>
        {description && (
          <p className="text-gray-700 mt-1 text-sm line-clamp-1">
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