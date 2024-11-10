'use client'

import React, { createContext, useContext, useState, useEffect } from 'react';

type DataItem = {
  data: any | null;
  isLoading: boolean;
  error: Error | null;
};

type DataContextType = {
  loadData: (path: string) => Promise<DataItem>;
  getData: (path: string) => DataItem;
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [dataCache, setDataCache] = useState<Record<string, DataItem>>({});

  const loadData = async (path: string): Promise<DataItem> => {
    if (dataCache[path]) {
      return dataCache[path];
    }

    setDataCache(prev => ({
      ...prev,
      [path]: { data: null, isLoading: true, error: null }
    }));

    try {
      const response = await fetch(path);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${path}`);
      }
      const json = await response.json();
      const newDataItem = { data: json, isLoading: false, error: null };
      setDataCache(prev => ({
        ...prev,
        [path]: newDataItem
      }));
      return newDataItem;
    } catch (error) {
      const errorDataItem = { data: null, isLoading: false, error: error as Error };
      setDataCache(prev => ({
        ...prev,
        [path]: errorDataItem
      }));
      return errorDataItem;
    }
  };

  const getData = (path: string): DataItem => {
    return dataCache[path] || { data: null, isLoading: true, error: null };
  };

  return (
    <DataContext.Provider value={{ loadData, getData }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData(path: string) {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }

  const [dataItem, setDataItem] = useState<DataItem>({ data: null, isLoading: true, error: null });

  useEffect(() => {
    context.loadData(path).then(setDataItem);
  }, [context, path]);

  return dataItem;
}