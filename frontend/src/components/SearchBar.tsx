interface SearchBarProps {
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ placeholder = "Поиск..." }) => {
  return (
    <input
      type="text"
      placeholder={placeholder}
      className="border rounded p-2 w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  );
};

export default SearchBar;
