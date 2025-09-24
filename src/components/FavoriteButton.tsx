import { Button } from "@/components/ui/button";
import { Heart, Loader2 } from "lucide-react";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useState } from "react";

interface FavoriteButtonProps {
  serviceId: string;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline" | "ghost";
  className?: string;
  showText?: boolean;
}

const FavoriteButton = ({ 
  serviceId, 
  size = "sm", 
  variant = "outline", 
  className = "",
  showText = false 
}: FavoriteButtonProps) => {
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites();
  const [loading, setLoading] = useState(false);

  const handleToggleFavorite = async () => {
    setLoading(true);
    try {
      if (isFavorite(serviceId)) {
        await removeFromFavorites(serviceId);
      } else {
        await addToFavorites(serviceId);
      }
    } finally {
      setLoading(false);
    }
  };

  const isFavorited = isFavorite(serviceId);

  return (
    <Button
      size={size}
      variant={variant}
      onClick={handleToggleFavorite}
      disabled={loading}
      className={`${isFavorited ? "text-red-500 hover:text-red-600" : ""} ${className}`}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
      )}
      {showText && (
        <span className="ml-2">
          {isFavorited ? "Favoritado" : "Favoritar"}
        </span>
      )}
    </Button>
  );
};

export default FavoriteButton;
