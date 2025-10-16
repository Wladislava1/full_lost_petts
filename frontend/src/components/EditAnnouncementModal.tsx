import { useState } from "react";

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

interface EditAnnouncementModalProps {
  announcement: Announcement;
  onClose: () => void;
  onSave: (updated: Announcement) => void;
  onDelete: (announcement: Announcement) => void;
}

export default function EditAnnouncementModal({
  announcement,
  onClose,
  onSave,
  onDelete,
}: EditAnnouncementModalProps) {
  const [formData, setFormData] = useState<Announcement>({ ...announcement });

  const handleChange = (field: keyof Announcement,  value: Announcement[keyof Announcement]) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleContactChange = (index: number, value: string) => {
    const updatedContacts = formData.contactInfo ? [...formData.contactInfo] : [];
    updatedContacts[index] = value;
    handleChange("contactInfo", updatedContacts);
  };

  const addContactField = () => {
    if (!formData.contactInfo) handleChange("contactInfo", [""]);
    else if (formData.contactInfo.length < 3)
      handleChange("contactInfo", [...formData.contactInfo, ""]);
  };

  const removeContactField = (index: number) => {
    if (!formData.contactInfo) return;
    const updatedContacts = [...formData.contactInfo];
    updatedContacts.splice(index, 1);
    handleChange("contactInfo", updatedContacts);
  };

  const handleDelete = () => {
    if (confirm("Вы уверены, что хотите удалить это объявление?")) {
      onDelete(announcement);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full relative overflow-y-auto max-h-[90vh]">
        <button
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
          onClick={onClose}
        >
          ✖
        </button>

        <h2 className="text-2xl font-bold mb-4">Редактирование объявления</h2>

        <input
          type="text"
          placeholder="Название"
          value={formData.title}
          onChange={(e) => handleChange("title", e.target.value)}
          className="w-full border p-2 rounded mb-2"
        />

        <input
          type="text"
          placeholder="Кличка животного"
          value={formData.animalName || ""}
          onChange={(e) => handleChange("animalName", e.target.value)}
          className="w-full border p-2 rounded mb-2"
        />

        <textarea
          placeholder="Описание"
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          className="w-full border p-2 rounded mb-2 h-20 resize-none"
        />

        <input
          type="text"
          placeholder="Владелец"
          value={formData.ownerName || ""}
          onChange={(e) => handleChange("ownerName", e.target.value)}
          className="w-full border p-2 rounded mb-2"
        />

        <input
          type="date"
          value={formData.date}
          onChange={(e) => handleChange("date", e.target.value)}
          className="w-full border p-2 rounded mb-2"
        />

        <div className="mb-2">
        <div className="flex gap-2 items-center">
            <span className="border p-2 rounded flex-1 bg-gray-100">
            {formData.image.split("/").pop() || "Файл не выбран"}
            </span>
            <input
            type="file"
            accept="image/*"
            className="hidden"
            id="replace-image-file"
            onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                handleChange("image", file.name);
                }
            }}
            />
            <label
            htmlFor="replace-image-file"
            className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 cursor-pointer"
            >
            Заменить
            </label>
        </div>
        </div>

        <div className="mb-2">
          <label className="mr-2">Статус: </label>
          <select
            value={formData.found ? "found" : "notFound"}
            onChange={(e) => handleChange("found", e.target.value === "found")}
            className="border p-2 rounded"
          >
            <option value="found">Найдено</option>
            <option value="notFound">Не найдено</option>
          </select>
        </div>

        <div className="mb-2">
          <label className="font-medium">Контакты:</label>
          {formData.contactInfo?.map((contact, index) => (
            <div key={index} className="flex gap-2 mb-1">
              <input
                type="text"
                value={contact}
                onChange={(e) => handleContactChange(index, e.target.value)}
                className="border p-2 rounded flex-1"
              />
              <button
                type="button"
                className="bg-red-500 text-white px-2 rounded hover:bg-red-600"
                onClick={() => removeContactField(index)}
              >
                ✖
              </button>
            </div>
          ))}
          {(!formData.contactInfo || formData.contactInfo.length < 3) && (
            <button
              type="button"
              onClick={addContactField}
              className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
            >
              Добавить контакт
            </button>
          )}
        </div>

        <div className="flex gap-2 mt-4">
          <button
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex-1"
            onClick={() => onSave(formData)}
          >
            Сохранить
          </button>
          <button
            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 flex-1"
            onClick={onClose}
          >
            Отменить
          </button>
          <button
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 flex-1"
            onClick={handleDelete}
          >
            Удалить
          </button>
        </div>
      </div>
    </div>
  );
}