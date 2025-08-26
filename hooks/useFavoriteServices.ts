import { useState, useEffect } from 'react';
import { useUser } from '@/hooks/useUser';

export const useFavoriteServices = () => {
  const { user, loading: authLoading } = useUser();
  const [favorites, setFavorites] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  // Reset favorites when user logs out or is not authenticated
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setFavorites([]);
      return;
    }

    // Fetch favorites only when user is authenticated
    const fetchFavorites = async () => {
      try {
        setLoading(true);
  const response = await import('@/lib/apiClient').then(m => m.fetchWithAuth('/api/favorite/list', { method: 'GET' }));

        if (response.ok) {
          const data = await response.json();
          // Backend returns array of objects with id property
          const favoriteIds = data.map((item: any) => Number(item.id));
          setFavorites(favoriteIds);
        } else {
          console.error('Failed to fetch favorites');
          setFavorites([]);
        }
      } catch (error) {
        console.error('Error fetching favorites:', error);
        setFavorites([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [user?.id, authLoading]);

  const toggleFavorite = async (serviceId: number) => {
  if (!user) {
      console.warn('User must be authenticated to toggle favorites');
      return;
    }

    try {
      const isFavorite = favorites.includes(serviceId);
      
      // Use add or remove endpoint based on current state
      const endpoint = isFavorite ? '/api/favorite/remove' : '/api/favorite/add';
      
  const response = await import('@/lib/apiClient').then(m => m.fetchWithAuth(endpoint, {
        method: 'POST',
        body: JSON.stringify({ serviceId }),
      }));

      if (response.ok) {
        setFavorites(prev => 
          isFavorite 
            ? prev.filter(id => id !== serviceId)
            : [...prev, serviceId]
        );
      } else {
        console.error('Failed to toggle favorite');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  return {
    favorites,
    loading,
    toggleFavorite,
    isAuthenticated: !!user,
  };
};
