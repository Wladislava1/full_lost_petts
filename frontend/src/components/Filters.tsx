const Filters = () => {
  return (
    <div className="flex space-x-2 mt-4 mb-4">
      <select className="border rounded p-2">
        <option>Все районы</option>
        <option>Центр</option>
        <option>Север</option>
        <option>Юг</option>
      </select>
      <select className="border rounded p-2">
        <option>Все виды</option>
        <option>Кошки</option>
        <option>Собаки</option>
      </select>
    </div>
  );
};

export default Filters;
