import { useState } from "react";
import { FaVk, FaTelegramPlane, FaWhatsapp } from "react-icons/fa";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

type Announcement = {
  animalName?: string; 
  title: string;
  description: string;
  date: string;
  image: string;
  found: boolean;
  ownerName?: string;
  contactInfo?: string[];
};

export default function AnnouncementModal(props: { announcement: Announcement; onClose: () => void }) {
  const { announcement, onClose } = props;
  const [shareOpen, setShareOpen] = useState(false);

  const handleDownloadPDF = async () => {
    const element = document.getElementById("leaflet");
    if (!element) return;

    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${announcement.title.replace(/\s/g, "_")}.pdf`);
  };

  const shareUrl = encodeURIComponent(`Потеряно животное: ${announcement.title}${announcement.animalName ? ` — ${announcement.animalName}` : ""}`);

  const socialLinks = {
    vk: `https://vk.com/share.php?url=${shareUrl}`,
    telegram: `https://t.me/share/url?url=${shareUrl}&text=${shareUrl}`,
    whatsapp: `https://api.whatsapp.com/send?text=${shareUrl}`,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full relative">
        <button className="absolute top-2 right-2 text-gray-600 hover:text-gray-900" onClick={onClose}>
          ✖
        </button>

        <div id="leaflet" className="p-4">
          <img src={announcement.image} alt={announcement.title} className="w-full h-64 object-cover rounded mb-4" />
          <h2 className="text-2xl font-bold mb-2">
            {announcement.title}{announcement.animalName && ` — ${announcement.animalName}`}
          </h2>
          <p className="text-gray-700 mb-2">{announcement.description}</p>
          <p className="text-gray-500 mb-2">Дата: {announcement.date}</p>
          <p className="text-gray-500 mb-2">Статус: {announcement.found ? "Найдено" : "Не найдено"}</p>
          <p className="text-gray-700 mb-2">Владелец: {announcement.ownerName || "Нет данных"}</p>
          <p className="text-gray-700 mb-1">
            Контакты: {announcement.contactInfo && announcement.contactInfo.length > 0 ? (
              <ul className="list-disc list-inside">
                {announcement.contactInfo.map((contact, index) => <li key={index}>{contact}</li>)}
              </ul>
            ) : "Нет данных"}
          </p>
        </div>

        <div className="flex space-x-2 mt-4 px-4 relative">
          <div className="relative">
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              onClick={() => setShareOpen(!shareOpen)}
            >
              Поделиться
            </button>
            {shareOpen && (
              <div className="absolute mt-2 bg-white border rounded shadow-md flex space-x-2 p-2">
                <a href={socialLinks.vk} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-xl"><FaVk /></a>
                <a href={socialLinks.telegram} target="_blank" rel="noopener noreferrer" className="text-blue-400 text-xl"><FaTelegramPlane /></a>
                <a href={socialLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="text-green-500 text-xl"><FaWhatsapp /></a>
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
