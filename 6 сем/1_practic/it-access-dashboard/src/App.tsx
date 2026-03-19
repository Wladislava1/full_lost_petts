import { useState } from 'react';
import { ContextProvider, ProductCardContext } from './ProductContext';
import { ProductCardRedux } from './ProductRedux';
import './index.css';

function App() {
  const [useRedux, setUseRedux] = useState(false);

  return (
    <div className="dashboard-container">
      <div className="header">
        <h1>Каталог продуктов</h1>
        <button 
          className="toggle-btn"
          onClick={() => setUseRedux(!useRedux)}
        >
          Переключить на {useRedux ? 'Context API' : 'Redux'}
        </button>
      </div>

      {useRedux ? (
        <ProductCardRedux />
      ) : (
        <ContextProvider>
          <ProductCardContext />
        </ContextProvider>
      )}
    </div>
  );
}

export default App;