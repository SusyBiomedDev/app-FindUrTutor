import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SavedItem {
  id: string;
  nome: string;
  area: string;
  email: string;
  doi?: string;
  pmid?: string;
}

interface SavedContextValue {
  savedItems: SavedItem[];
  toggleSaved: (item: SavedItem) => void;
  isSaved: (id: string) => boolean;
}

const SavedContext = createContext<SavedContextValue | undefined>(undefined);

export function SavedProvider({ children }: { children: ReactNode }) {
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);

  const toggleSaved = (item: SavedItem) => {
    setSavedItems((prev) => {
      const exists = prev.some((saved) => saved.id === item.id);
      if (exists) {
        return prev.filter((saved) => saved.id !== item.id);
      }
      return [...prev, item];
    });
  };

  const isSaved = (id: string) => {
    return savedItems.some((saved) => saved.id === id);
  };

  return (
    <SavedContext.Provider value={{ savedItems, toggleSaved, isSaved }}>
      {children}
    </SavedContext.Provider>
  );
}

export function useSaved() {
  const context = useContext(SavedContext);
  if (!context) {
    throw new Error('useSaved must be used within a SavedProvider');
  }
  return context;
}
