import { MAX_HISTORY_ITEMS, STORAGE_KEY } from '../constants';

export interface HistoryItem {
  id: string;
  imageDataUrl: string;
  description: string | null;
}

export const getHistory = (): HistoryItem[] => {
  try {
    const historyJson = localStorage.getItem(STORAGE_KEY);
    return historyJson ? JSON.parse(historyJson) : [];
  } catch (error) {
    console.error("Failed to parse history from localStorage", error);
    localStorage.removeItem(STORAGE_KEY);
    return [];
  }
};

export const addToHistory = (newItem: Omit<HistoryItem, 'id'>): HistoryItem[] => {
  const history = getHistory();
  const fullNewItem = { ...newItem, id: crypto.randomUUID() };
  
  let updatedHistory = [...history, fullNewItem];

  if (updatedHistory.length > MAX_HISTORY_ITEMS) {
    updatedHistory = updatedHistory.slice(updatedHistory.length - MAX_HISTORY_ITEMS);
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error("Failed to save history to localStorage", error);
  }
  
  return updatedHistory;
};

export const updateHistoryItem = (id: string, newDescription: string): HistoryItem[] => {
    const history = getHistory();
    const updatedHistory = history.map(item => 
        item.id === id ? { ...item, description: newDescription } : item
    );

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
        console.error("Failed to save updated history to localStorage", error);
    }
    
    return updatedHistory;
};
