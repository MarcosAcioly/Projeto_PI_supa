import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, User, Save, LogOut, Heart, Star, Clock, MapPin, Trash2, ExternalLink } from "lucide-react";
import Header from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate, Link } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { favorites, loading: favoritesLoading, removeFromFavorites } = useFavorites();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    avatar_url: ""
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        avatar_url: profile.avatar_url || ""
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          avatar_url: formData.avatar_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar perfil:', error);
        toast.error('Erro ao salvar as alterações');
      } else {
        toast.success('Perfil atualizado com sucesso!');
        // Força uma atualização do contexto
        window.location.reload();
      }
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast.error('Erro inesperado ao salvar');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const handleRemoveFavorite = async (serviceId: string) => {
    await removeFromFavorites(serviceId);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header Section */}
        <div className="mb-8 text-center">
          <div className="relative inline-block">
            <Avatar className="h-24 w-24 mx-auto mb-4 ring-4 ring-primary/20 shadow-xl">
              <AvatarImage src={formData.avatar_url || undefined} />
              <AvatarFallback className="text-2xl font-bold">
                {formData.full_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full p-2 shadow-lg">
              <User className="h-4 w-4" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {formData.full_name || "Meu Perfil"}
          </h1>
          <p className="text-muted-foreground text-lg">
            Gerencie suas informações e favoritos
          </p>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:grid-cols-2">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="favorites" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Favoritos ({favorites.length})
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Profile Picture Section */}
              <Card className="hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center text-primary">
                    <User className="mr-2 h-5 w-5" />
                    Foto do Perfil
                  </CardTitle>
                  <CardDescription>
                    Atualize sua foto de perfil
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={formData.avatar_url || undefined} />
                        <AvatarFallback className="text-lg">
                          {formData.full_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-2 flex-1">
                        <Label htmlFor="avatar_url">URL da Imagem</Label>
                        <Input
                          id="avatar_url"
                          type="url"
                          placeholder="https://exemplo.com/sua-foto.jpg"
                          value={formData.avatar_url}
                          onChange={(e) => setFormData(prev => ({ ...prev, avatar_url: e.target.value }))}
                          className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                        />
                        <p className="text-xs text-muted-foreground">
                          Cole o link de uma imagem da web
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Personal Information */}
              <Card className="hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-primary">Informações Pessoais</CardTitle>
                  <CardDescription>
                    Atualize suas informações básicas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Nome Completo</Label>
                      <Input
                        id="full_name"
                        type="text"
                        value={formData.full_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                        placeholder="Seu nome completo"
                        className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail</Label>
                      <Input
                        id="email"
                        type="email"
                        value={user.email || ""}
                        disabled
                        className="bg-muted/50"
                      />
                      <p className="text-xs text-muted-foreground">
                        O e-mail não pode ser alterado
                      </p>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full gradient-primary shadow-glow hover:shadow-xl transition-all duration-300"
                      disabled={loading}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {loading ? "Salvando..." : "Salvar Alterações"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Account Actions */}
            <Card className="border-destructive/20 hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-destructive flex items-center">
                  <LogOut className="mr-2 h-5 w-5" />
                  Ações da Conta
                </CardTitle>
                <CardDescription>
                  Gerencie sua sessão
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={handleLogout}
                  variant="destructive"
                  className="w-full sm:w-auto hover:shadow-lg transition-all duration-300"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Fazer Logout
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites" className="space-y-6">
            <Card className="hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center text-primary">
                  <Heart className="mr-2 h-5 w-5" />
                  Meus Favoritos
                </CardTitle>
                <CardDescription>
                  Serviços que você favoritou ({favorites.length})
                </CardDescription>
              </CardHeader>
              <CardContent>
                {favoritesLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Carregando favoritos...</p>
                  </div>
                ) : favorites.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Nenhum favorito ainda</h3>
                    <p className="text-muted-foreground mb-4">
                      Explore os serviços e adicione seus favoritos
                    </p>
                    <Link to="/services">
                      <Button className="gradient-primary shadow-glow">
                        Explorar Serviços
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {favorites.map((favorite) => (
                      <Card key={favorite.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <Badge variant="secondary" className="text-xs">
                              {favorite.services.category}
                            </Badge>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemoveFavorite(favorite.services.id)}
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <h3 className="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                            {favorite.services.title}
                          </h3>
                          
                          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                            {favorite.services.description}
                          </p>
                          
                          <div className="space-y-1 text-xs text-muted-foreground mb-3">
                            <div className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {favorite.services.profiles?.full_name || "Usuário"}
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {favorite.services.delivery_days} dias
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-primary">
                              R$ {favorite.services.price.toLocaleString()}
                            </span>
                            <Link to={`/services/${favorite.services.id}`}>
                              <Button size="sm" className="gradient-primary">
                                <ExternalLink className="h-3 w-3 mr-1" />
                                Ver
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Profile;