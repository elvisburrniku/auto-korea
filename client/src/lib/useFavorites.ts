
import { useState, useEffect } from 'react';

export function useFavorites() {
  const [favorites, setFavorites] = useState<number[]>(() => {
    const saved = localStorage.getItem('favorites');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (carId: number) => {
    setFavorites(current => {
      if (current.includes(carId)) {
        return current.filter(id => id !== carId);
      }
      return [...current, carId];
    });
  };

  const isFavorite = (carId: number) => favorites.includes(carId);

  return { favorites, toggleFavorite, isFavorite };
}
