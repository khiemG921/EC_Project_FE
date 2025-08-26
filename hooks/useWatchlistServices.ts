import { useState, useEffect } from 'react';
import { useUser } from '@/hooks/useUser';
import { Service } from '@/lib/servicesApi';
import { SERVICE_ID_TO_BOOKING_URL } from '@/lib/servicesApi';

export const useWatchlistServices = () => {
  const { user, loading: authLoading } = useUser();
  const [watchlistServices, setWatchlistServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setWatchlistServices([]);
      return;
    }

    const fetchWatchlist = async () => {
      try {
        setLoading(true);
  const response = await import('@/lib/apiClient').then(m => m.fetchWithAuth('/api/watchlist', { method: 'GET' }));

        if (response.ok) {
          const watchlistItems = await response.json();
          const services = watchlistItems.map((item: any) => {
            const s = item.service || {};
            const id = Number(s.id ?? s.service_id);
            return {
              id,
              name: s.name,
              description: s.description,
              type: s.type,
              status: s.status,
              image_url: s.image_url,
              // Not part of type but used by some cards; ServiceCard will also derive from map
              bookingUrl: SERVICE_ID_TO_BOOKING_URL[id],
            } as any as Service & { bookingUrl?: string };
          });
          setWatchlistServices(services);
        } else {
          console.error('Failed to fetch watchlist');
          setWatchlistServices([]);
        }
      } catch (error) {
        console.error('Error fetching watchlist:', error);
        setWatchlistServices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWatchlist();
  }, [user?.id, authLoading]);

  const removeWatchlist = async (serviceId: number) => {
  if (!user) {
      console.warn('User must be authenticated to remove from watchlist');
      return;
    }

    try {
  const response = await import('@/lib/apiClient').then(m => m.fetchWithAuth(`/api/watchlist/${serviceId}`, { method: 'DELETE' }));

      if (response.ok) {
        setWatchlistServices((prev) => prev.filter((service) => Number(service.id) !== Number(serviceId)));
      } else {
        console.error('Failed to remove from watchlist');
      }
    } catch (error) {
      console.error('Error removing from watchlist:', error);
    }
  };

  const isServiceInWatchlist = (serviceId: number) => {
    return watchlistServices.some((service) => service.id === serviceId);
  };

  const toggleWatchlist = async (serviceId: number) => {
    if (!user) {
      console.warn('User must be authenticated to modify watchlist');
      return;
    }

    try {
      if (isServiceInWatchlist(serviceId)) {
        await removeWatchlist(serviceId);
      } else {
  const response = await import('@/lib/apiClient').then(m => m.fetchWithAuth('/api/watchlist', { method: 'POST', body: JSON.stringify({ serviceId }) }));

        if (response.ok) {
          const addedItem = await response.json();
          const s = addedItem.service || {};
          const id = Number(s.id ?? s.service_id);
          const normalized = {
            id,
            name: s.name,
            description: s.description,
            type: s.type,
            status: s.status,
            image_url: s.image_url,
            bookingUrl: SERVICE_ID_TO_BOOKING_URL[id],
          } as any as Service & { bookingUrl?: string };
          setWatchlistServices((prev) => [...prev, normalized]);
        } else {
          console.error('Failed to add to watchlist');
        }
      }
    } catch (error) {
      console.error('Error toggling watchlist:', error);
    }
  };

  return {
    watchlistServices,
    watchlist: watchlistServices, // thêm alias này để component khác có thể gọi watchlist
    loading,
    removeWatchlist,
    isServiceInWatchlist,
    isAuthenticated: !!user,
    toggleWatchlist,
  };
};
