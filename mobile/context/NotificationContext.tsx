import React, { createContext, useContext, useState, ReactNode } from 'react';

interface NotificationState {
  message: string;
  okText: string;
  visible: boolean;
  showNotification: (message: string, okText?: string) => void;
  hideNotification: () => void;
}

const NotificationContext = createContext<NotificationState | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [message, setMessage] = useState('');
  const [okText, setOkText] = useState('OK');
  const [visible, setVisible] = useState(false);

  const showNotification = (newMessage: string, newOkText: string = 'OK') => {
    setMessage(newMessage);
    setOkText(newOkText);
    setVisible(true);
  };

  const hideNotification = () => {
    setVisible(false);
  };

  return (
    <NotificationContext.Provider value={{ message, okText, visible, showNotification, hideNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
