const ProfilePage = () => {
  const dummyAnnouncements = [
    { id: 1, title: "Пропал кот" },
    { id: 2, title: "Найдена собака" },
  ];

  return (
    <div>
      <main className="p-4 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Личный кабинет</h1>
        <div className="space-y-2">
          {dummyAnnouncements.map((ann) => (
            <div key={ann.id} className="flex justify-between items-center border p-2 rounded">
              <span>{ann.title}</span>
              <div className="space-x-2">
                <button className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600">Редактировать</button>
                <button className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600">Пометить как найдено</button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
