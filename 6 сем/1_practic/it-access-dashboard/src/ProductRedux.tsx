/* eslint-disable react-refresh/only-export-components */
import React from 'react';
import { createSlice, configureStore } from '@reduxjs/toolkit';
import { Provider, useDispatch, useSelector } from 'react-redux';

type Status = 'NONE' | 'PENDING';

const accessSlice = createSlice({
  name: 'access',
  initialState: { status: 'NONE' as Status },
  reducers: {
    requestAccess: (state) => {
      state.status = 'PENDING';
    },
  },
});


export const { requestAccess } = accessSlice.actions;
const store = configureStore({
  reducer: {
    access: accessSlice.reducer,
  },
});

const ProductCardUI = () => {
  const status = useSelector((state: { access: { status: Status } }) => state.access.status);
  const dispatch = useDispatch();

  return (
    <div className="product-card">
      <div className="product-header">
        <div className={`status-indicator status-${status}`}></div>
        <h2>AI Referent (Redux Toolkit)</h2>
      </div>
      <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
        {status === 'NONE' && 'Доступ к продукту закрыт. Требуется подписка.'}
        {status === 'PENDING' && 'Ваша заявка успешно отправлена и находится на рассмотрении.'}
      </p>
      
      {status === 'NONE' && (
        <button className="action-btn" onClick={() => dispatch(requestAccess())}>
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

export const ProductCardRedux: React.FC = () => (
  <Provider store={store}>
    <ProductCardUI />
  </Provider>
);