import { useState } from "react";
import type { EditableAnnouncement, Contact } from '../types/index';
import { apiService } from '../services/api';

interface EditAnnouncementModalProps {
  announcement: EditableAnnouncement;
  onClose: () => void;
  onSave: (updated: EditableAnnouncement) => void;
  onDelete: () => void;
}

export default function EditAnnouncementModal({
  announcement,
  onClose,
  onSave,
  onDelete,
}: EditAnnouncementModalProps) {
  const [formData, setFormData] = useState<EditableAnnouncement>({ 
    ...announcement,
    animalName: announcement.animalName || '',
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const contactTypes = ['Телефон', 'Телеграм', 'ВКонтакте', 'WhatsApp', 'Email'];

  const handleChange = <K extends keyof EditableAnnouncement>(
    field: K,
    value: EditableAnnouncement[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleContactChange = (index: number, field: keyof Contact, value: string | boolean) => {
    const currentContacts = formData.contactInfo ? [...formData.contactInfo] : [];
    const updated = [...currentContacts];
    
    if (!updated[index]) {
      updated[index] = { type: 'Телефон', value: '', is_primary: false };
    }
    
    updated[index] = { ...updated[index], [field]: value };
    
    if (field === 'is_primary' && value === true) {
      updated.forEach((contact, i) => {
        if (i !== index) contact.is_primary = false;
      });
    }
    
    handleChange("contactInfo", updated);
  };

  const addContactField = () => {
    const current = formData.contactInfo || [];
    if (current.length < 3) {
      handleChange("contactInfo", [...current, { type: 'Телефон', value: '', is_primary: false }]);
    }
  };

  const removeContactField = (index: number) => {
    const current = formData.contactInfo || [];
    const updated = current.filter((_, i) => i !== index);
    
    if (updated.length > 0 && !updated.some(contact => contact.is_primary)) {
      updated[0].is_primary = true;
    }
    
    handleChange("contactInfo", updated.length > 0 ? updated : []);
  };

  const handleFileUpload = async (file: File) => {
    setUploadingImage(true);
    try {
      console.log('Uploading image for announcement:', formData.id);
      const response = await apiService.uploadAdImage(formData.id, file);
      console.log('Image upload response:', response);
      
      // Обновляем изображение в состоянии (используем URL с сервера)
      if (response.url) {
        handleChange("image", response.url);
        setSelectedFile(null); // Сбрасываем выбранный файл после успешной загрузки
        alert('Изображение успешно загружено!');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Ошибка при загрузке изображения');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async () => {
    try {
      // Сначала сохраняем данные объявления
      onSave(formData);
      
      // Если есть выбранный файл, загружаем его
      if (selectedFile) {
        await handleFileUpload(selectedFile);
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving announcement:', error);
    }
  };

  const contacts = formData.contactInfo || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl">
          ✖
        </button>

        <h2 className="text-2xl font-bold mb-4">Редактирование</h2>

        <div className="space-y-3">
          <div>
            <label className="font-medium block mb-1">Тип объявления:</label>
            <select
              value={formData.found ? "found" : "lost"}
              onChange={e => handleChange("found", e.target.value === "found")}
              className="w-full border p-2 rounded"
            >
              <option value="found">Находка</option>
              <option value="lost">Пропажа</option>
            </select>
          </div>

          <input
            type="text"
            placeholder="Заголовок"
            value={formData.title}
            onChange={e => handleChange("title", e.target.value)}
            className="w-full border p-2 rounded"
          />

          <input
            type="text"
            placeholder="Кличка животного"
            value={formData.animalName || ""}
            onChange={e => handleChange("animalName", e.target.value)}
            className="w-full border p-2 rounded"
          />

          <input
            type="text"
            placeholder="Город"
            value={formData.city}
            onChange={e => handleChange("city", e.target.value)}
            className="w-full border p-2 rounded"
          />

          <textarea
            placeholder="Описание"
            value={formData.description}
            onChange={e => handleChange("description", e.target.value)}
            className="w-full border p-2 rounded h-24 resize-none"
          />

          <div>
            <label className="font-medium block mb-2">Фотография:</label>
            <div className="flex gap-2 items-center">
              <div className="flex-1 border p-2 rounded bg-gray-50 text-sm">
                {selectedFile 
                  ? `Новый файл: ${selectedFile.name}`
                  : formData.image?.split("/").pop() || "Файл не выбран"}
              </div>
              <label className={`bg-blue-500 text-white px-3 py-1 rounded cursor-pointer hover:bg-blue-600 ${uploadingImage ? 'opacity-50 cursor-not-allowed' : ''}`}>
                {uploadingImage ? 'Загрузка...' : 'Заменить'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploadingImage}
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setSelectedFile(file);
                      // Создаем preview, но не загружаем сразу
                      const preview = URL.createObjectURL(file);
                      handleChange("image", preview);
                    }
                  }}
                />
              </label>
            </div>
            {selectedFile && (
              <p className="text-sm text-gray-600 mt-1">
                Файл будет загружен при сохранении объявления
              </p>
            )}
          </div>

          <div>
            <label className="font-medium block mb-2">Контакты:</label>
            {contacts.map((contact, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <select
                  value={contact.type}
                  onChange={(e) => handleContactChange(i, 'type', e.target.value)}
                  className="border p-2 rounded w-1/3"
                >
                  {contactTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={contact.value}
                  onChange={e => handleContactChange(i, 'value', e.target.value)}
                  className="flex-1 border p-2 rounded"
                  placeholder="Значение контакта"
                />
                <div className="flex items-center gap-2">
                  <label className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={contact.is_primary}
                      onChange={(e) => handleContactChange(i, 'is_primary', e.target.checked)}
                      className="mr-1"
                    />
                    основной
                  </label>
                  {contacts.length > 1 && (
                    <button
                      onClick={() => removeContactField(i)}
                      className="bg-red-500 text-white px-2 rounded hover:bg-red-600"
                    >
                      ✖
                    </button>
                  )}
                </div>
              </div>
            ))}
            {contacts.length < 3 && (
              <button
                onClick={addContactField}
                className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
              >
                + Добавить контакт
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button 
            onClick={handleSubmit} 
            className="flex-1 bg-green-500 text-white py-2 rounded hover:bg-green-600"
            disabled={uploadingImage}
          >
            {uploadingImage ? 'Сохранение...' : 'Сохранить'}
          </button>
          <button 
            onClick={onClose} 
            className="flex-1 bg-gray-400 text-white py-2 rounded hover:bg-gray-500"
            disabled={uploadingImage}
          >
            Отмена
          </button>
          <button 
            onClick={onDelete} 
            className="flex-1 bg-red-500 text-white py-2 rounded hover:bg-red-600"
            disabled={uploadingImage}
          >
            Удалить
          </button>
        </div>
      </div>
    </div>
  );
}