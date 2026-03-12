// useSearchHistory - Search term persistence in localStorage
import { useState, useEffect } from 'react';

const STORAGE_KEY = 'scs_search_history';
const MAX_HISTORY = 10;

interface SearchHistoryItem {
  query: string;
  timestamp: number;
  filters?: string[];
}

export function useSearchHistory() {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);

  // Load history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading search history:', error);
    }
  }, []);

  // Save to localStorage
  const saveHistory = (items: SearchHistoryItem[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      setHistory(items);
    } catch (error) {
      console.error('Error saving search history:', error);
    }
  };

  // Add search to history
  const addSearch = (query: string, filters?: string[]) => {
    if (!query.trim()) return;

    const newItem: SearchHistoryItem = {
      query: query.trim(),
      timestamp: Date.now(),
      filters,
    };

    // Remove duplicate and add to front
    const filtered = history.filter(item => item.query.toLowerCase() !== query.toLowerCase());
    const updated = [newItem, ...filtered].slice(0, MAX_HISTORY);
    
    saveHistory(updated);
  };

  // Remove item from history
  const removeSearch = (query: string) => {
    const updated = history.filter(item => item.query !== query);
    saveHistory(updated);
  };

  // Clear all history
  const clearHistory = () => {
    saveHistory([]);
  };

  // Get recent searches (last 5)
  const recentSearches = history.slice(0, 5);

  return {
    history,
    recentSearches,
    addSearch,
    removeSearch,
    clearHistory,
  };
}
