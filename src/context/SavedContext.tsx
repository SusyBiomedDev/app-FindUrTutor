
import React, { createContext, useContext, useEffect, useState, } from 'react';

// biblioteca responsável pelo armazenamento local
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@saved_items';

export interface SavedItem {
  id: string;
  title?: string;
  image?: string;
  [key: string]: any;
}

interface SavedContextData {
  savedItems: SavedItem[];

  // função para adicionar/remover favoritos
  toggleSaved: (item: SavedItem) => Promise<void>;
}


const SavedContext = createContext({} as SavedContextData);

export const SavedProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  // estado para armazenar os itens guardados
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);

  // carregar os favoritos ao iniciar app
  useEffect(() => {
    loadSavedItems();
  }, []);

  // função para carregar favoritos do AsyncStorage
  const loadSavedItems = async () => {
    try {

        // obter dados do AsyncStorage
      const storedItems = await AsyncStorage.getItem(STORAGE_KEY);

       // verificar se existem dados
      if (storedItems) {
        setSavedItems(JSON.parse(storedItems));
      }
    } catch (error) {
      console.log('Error while loading saved items:', error);
    }
  };

   // guardar favoritos no AsyncStorage
  const updateStorage = async (items: SavedItem[]) => {
    try {

       // converter array para string JSON
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(items),
      );
    } catch (error) {
      console.log('Error while saving items:', error);
    }
  };

  const toggleSaved = async (item: SavedItem) => {
    try {
      const alreadySaved = savedItems.some(
        saved => saved.id === item.id,
      );

      let updatedItems: SavedItem[];

      if (alreadySaved) {
        updatedItems = savedItems.filter(
          saved => saved.id !== item.id,
        );
      } else {
        updatedItems = [...savedItems, item];
      }

       // atualizar estado
      setSavedItems(updatedItems);

       // atualizar AsyncStorage
      await updateStorage(updatedItems);

    } catch (error) {
      console.log('Error while updating saved items:', error);
    }
  };

  return (
    <SavedContext.Provider
      value={{
        savedItems,
        toggleSaved,
      }}
    >
      {children}
    </SavedContext.Provider>
  );
};

export const useSaved = () => {
  return useContext(SavedContext);
};