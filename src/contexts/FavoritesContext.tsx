import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';

interface Favorite {
  id: string;
  user_id: string;
  service_id: string;
  created_at: string;
  services: {
    id: string;
    title: string;
    description: string;
    category: string;
    price: number;
    delivery_days: number;
    user_id: string;
    profiles: {
      full_name: string | null;
    } | null;
  };
}

interface FavoritesContextType {
  favorites: Favorite[];
  loading: boolean;
  addToFavorites: (serviceId: string) => Promise<boolean>;
  removeFromFavorites: (serviceId: string) => Promise<boolean>;
  isFavorite: (serviceId: string) => boolean;
  refreshFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

interface FavoritesProviderProps {
  children: React.ReactNode;
}

export const FavoritesProvider = ({ children }: FavoritesProviderProps) => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchFavorites = async () => {
    if (!user) {
      setFavorites([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          id,
          user_id,
          service_id,
          created_at,
          services (
            id,
            title,
            description,
            category,
            price,
            delivery_days,
            user_id,
            profiles (
              full_name
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar favoritos:', error);
        toast.error('Erro ao carregar favoritos');
      } else {
        setFavorites(data || []);
      }
    } catch (error) {
      console.error('Erro inesperado ao buscar favoritos:', error);
      toast.error('Erro inesperado ao carregar favoritos');
    } finally {
      setLoading(false);
    }
  };

  const addToFavorites = async (serviceId: string): Promise<boolean> => {
    if (!user) {
      toast.error('Você precisa estar logado para favoritar serviços');
      return false;
    }

    try {
      const { error } = await supabase
        .from('favorites')
        .insert({
          user_id: user.id,
          service_id: serviceId
        });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast.error('Este serviço já está nos seus favoritos');
          return false;
        }
        console.error('Erro ao adicionar favorito:', error);
        toast.error('Erro ao adicionar aos favoritos');
        return false;
      }

      toast.success('Serviço adicionado aos favoritos!');
      await fetchFavorites(); // Atualizar lista
      return true;
    } catch (error) {
      console.error('Erro inesperado ao adicionar favorito:', error);
      toast.error('Erro inesperado ao adicionar aos favoritos');
      return false;
    }
  };

  const removeFromFavorites = async (serviceId: string): Promise<boolean> => {
    if (!user) {
      toast.error('Você precisa estar logado para gerenciar favoritos');
      return false;
    }

    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('service_id', serviceId);

      if (error) {
        console.error('Erro ao remover favorito:', error);
        toast.error('Erro ao remover dos favoritos');
        return false;
      }

      toast.success('Serviço removido dos favoritos');
      await fetchFavorites(); // Atualizar lista
      return true;
    } catch (error) {
      console.error('Erro inesperado ao remover favorito:', error);
      toast.error('Erro inesperado ao remover dos favoritos');
      return false;
    }
  };

  const isFavorite = (serviceId: string): boolean => {
    return favorites.some(fav => fav.service_id === serviceId);
  };

  const refreshFavorites = async () => {
    await fetchFavorites();
  };

  useEffect(() => {
    if (user) {
      fetchFavorites();
    } else {
      setFavorites([]);
    }
  }, [user]);

  const value: FavoritesContextType = {
    favorites,
    loading,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    refreshFavorites,
  };

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
};
