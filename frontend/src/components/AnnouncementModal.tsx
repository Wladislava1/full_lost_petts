import { useState } from "react";
import { FaVk, FaTelegramPlane, FaWhatsapp } from "react-icons/fa";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import type { Contact } from '../types/index';
import { getImageUrl } from '../hooks/url';

type Announcement = {
  title: string;
  description: string;
  date: string;
  image: string;
  found: boolean;
  animalName?: string;
  ownerName?: string;
  contactInfo?: Contact[] | string[];
};

export default function AnnouncementModal({ announcement, onClose }: { announcement: Announcement; onClose: () => void }) {
  const [shareOpen, setShareOpen] = useState(false);

  const imageUrl = getImageUrl(announcement.image);

  const contacts: Contact[] = (() => {
    if (!announcement.contactInfo) return [];
    
    if (Array.isArray(announcement.contactInfo)) {
      if (announcement.contactInfo.length > 0 && typeof announcement.contactInfo[0] === 'string') {
        return (announcement.contactInfo as string[]).map((value, index) => ({
          type: 'Телефон',
          value: value,
          is_primary: index === 0
        }));
      }
      return announcement.contactInfo as Contact[];
    }
    
    return [];
  })();

  const handleDownloadPDF = async () => {
    const element = document.getElementById("leaflet");
    if (!element) return;

    const images = element.querySelectorAll("img");
    await Promise.all(
      Array.from(images).map((img) => {
        if (img.complete && img.naturalHeight !== 0) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      })
    );

    images.forEach((img) => {
      if (img.src) img.crossOrigin = "anonymous";
    });

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${announcement.title.replace(/\s/g, "_")}.pdf`);
  };

  const shareText = `${announcement.title}`;
  const shareUrl = encodeURIComponent(shareText);

  const socialLinks = {
    vk: `https://vk.com/share.php?url=${shareUrl}`,
    telegram: `https://t.me/share/url?url=${shareUrl}&text=${shareUrl}`,
    whatsapp: `https://api.whatsapp.com/send?text=${shareUrl}`,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto relative">
        <button
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 text-xl"
          onClick={onClose}
        >
          X
        </button>

        <div id="leaflet" className="p-4 space-y-3">
          <div className="w-full h-64 bg-gray-200 rounded flex items-center justify-center">
            <img
              src={imageUrl}
              alt={announcement.title}
              className="w-full h-full object-cover rounded"
              onError={(e) => {
                e.currentTarget.src = '/default-image.jpg';
                console.error('Error loading image:', imageUrl);
              }}
              onLoad={() => console.log('Image loaded successfully:', imageUrl)}
            />
          </div>

          <h2 className="text-2xl font-bold">
            {announcement.title}
          </h2>

          {announcement.animalName && (
            <p className="text-gray-700 font-medium">Кличка: {announcement.animalName}</p>
          )}

          <p className="text-gray-700">{announcement.description}</p>

          <p className="text-gray-500 text-sm">Дата: {announcement.date}</p>

          <p className="text-sm">
            Статус: <span className={announcement.found ? 'text-green-600' : 'text-red-600'}>
              {announcement.found ? 'Найдено' : 'Пропажа'}
            </span>
          </p>

          <div>
            <p className="font-medium">Контакты:</p>
            {contacts.length > 0 ? (
              <ul className="list-disc list-inside mt-1 space-y-1">
                {contacts.map((contact, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">({contact.type})</span>
                    <span>{contact.value}</span>
                    {contact.is_primary && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                        основной
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">Нет контактов</p>
            )}
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <div className="relative">
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center gap-2"
              onClick={() => setShareOpen(!shareOpen)}
            >
              Поделиться
            </button>
            {shareOpen && (
              <div className="absolute bottom-full mb-2 left-0 bg-white border rounded shadow-lg flex gap-3 p-3 z-10">
                <a href={socialLinks.vk} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-2xl hover:scale-110 transition">
                  <FaVk />
                </a>
                <a href={socialLinks.telegram} target="_blank" rel="noopener noreferrer" className="text-blue-400 text-2xl hover:scale-110 transition">
                  <FaTelegramPlane />
                </a>
                <a href={socialLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="text-green-500 text-2xl hover:scale-110 transition">
                  <FaWhatsapp />
                </a>
              </div>
            )}
          </div>

          {!announcement.found && (
            <button
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              onClick={handleDownloadPDF}
            >
              Создать листовку
            </button>
          )}
        </div>
      </div>
    </div>
  );
}