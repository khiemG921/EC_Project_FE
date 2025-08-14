import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export const useFavoriteServices = () => {
  const [user, setUser] = useState<any>(null);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });

    return () => unsubscribe();
  }, []);

  // Reset favorites when user logs out or is not authenticated
  useEffect(() => {
    if (!user) {
      setFavorites([]);
      return;
    }

    // Fetch favorites only when user is authenticated
    const fetchFavorites = async () => {
      try {
        setLoading(true);
        const token = await user.getIdToken();
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/favorite/list`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

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
  }, [user]);

  const toggleFavorite = async (serviceId: number) => {
    if (!user) {
      console.warn('User must be authenticated to toggle favorites');
      return;
    }

    try {
      const token = await user.getIdToken();
      const isFavorite = favorites.includes(serviceId);
      
      // Use add or remove endpoint based on current state
      const endpoint = isFavorite ? '/api/favorite/remove' : '/api/favorite/add';
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ serviceId }),
      });

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
