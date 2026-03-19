import React, { createContext, useContext, useState } from 'react';

type Status = 'NONE' | 'PENDING';
interface AccessContextType {
  status: Status;
  requestAccess: () => void;
}

const AccessContext = createContext<AccessContextType | undefined>(undefined);

export const ContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [status, setStatus] = useState<Status>('NONE');

  const requestAccess = () => {
    setStatus('PENDING');
  };

  return (
    <AccessContext.Provider value={{ status, requestAccess }}>
      {children}
    </AccessContext.Provider>
  );
};

export const ProductCardContext = () => {
  const context = useContext(AccessContext);
  if (!context) throw new Error("Must be used within ContextProvider");

  const { status, requestAccess } = context;

  return (
    <div className="product-card">
      <div className="product-header">
        <div className={`status-indicator status-${status}`}></div>
        <h2>AI Referent (Context API)</h2>
      </div>
      <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
        {status === 'NONE' && 'Доступ к продукту закрыт. Требуется подписка.'}
        {status === 'PENDING' && 'Ваша заявка успешно отправлена и находится на рассмотрении.'}
      </p>
      
      {status === 'NONE' && (
        <button className="action-btn" onClick={requestAccess}>
          Отправить заявку
        </button>
      )}
      {status === 'PENDING' && (
        <button className="action-btn" disabled>
          Ожидание ответа...
        </button>
      )}
    </div>
  );
};