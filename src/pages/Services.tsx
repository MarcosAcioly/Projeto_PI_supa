import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import FavoriteButton from "@/components/FavoriteButton";
import { Search, Star, MapPin, Clock, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Mock data for services
const services = [
  {
    id: "1",
    title: "Design Gráfico Profissional",
    description: "Criação de logos, identidade visual e materiais gráficos para sua empresa",
    category: "Design",
    price: 299,
    rating: 4.9,
    reviews: 127,
    provider: "Ana Silva",
    location: "São Paulo, SP",
    deliveryTime: "3-5 dias",
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=300&h=200&fit=crop"
  },
  {
    id: "2", 
    title: "Desenvolvimento de Website",
    description: "Sites responsivos e modernos com as melhores tecnologias do mercado",
    category: "Tecnologia",
    price: 1299,
    rating: 4.8,
    reviews: 89,
    provider: "Carlos Santos",
    location: "Rio de Janeiro, RJ",
    deliveryTime: "7-14 dias",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=200&fit=crop"
  },
  {
    id: "3",
    title: "Consultoria em Marketing Digital",
    description: "Estratégias personalizadas para aumentar suas vendas online",
    category: "Marketing",
    price: 499,
    rating: 4.7,
    reviews: 156,
    provider: "Mariana Costa",
    location: "Belo Horizonte, MG",
    deliveryTime: "2-3 dias",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=200&fit=crop"
  },
  {
    id: "4",
    title: "Tradução Profissional",
    description: "Tradução precisa e rápida para inglês, espanhol e francês",
    category: "Idiomas",
    price: 199,
    rating: 4.9,
    reviews: 203,
    provider: "Lucas Ferreira",
    location: "Florianópolis, SC",
    deliveryTime: "1-2 dias",
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=300&h=200&fit=crop"
  }
];

const categories = ["Todos", "Design", "Tecnologia", "Marketing", "Idiomas", "Consultoria"];

const Services = () => {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [realServices, setRealServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const SERVICES_PER_PAGE = 8;

  // Carregar serviços reais do banco
  const loadServices = async (pageNum = 1, append = false) => {
    try {
      if (pageNum === 1) setLoading(true);
      
      const startIndex = (pageNum - 1) * SERVICES_PER_PAGE;
      
      const { data, error, count } = await supabase
        .from('services')
        .select(`
          id,
          title,
          description,
          category,
          price,
          delivery_days,
          created_at,
          user_id,
          profiles!services_user_id_fkey (
            full_name
          )
        `, { count: 'exact' })
        .eq('active', true)
        .order('created_at', { ascending: false })
        .range(startIndex, startIndex + SERVICES_PER_PAGE - 1);

      if (error) {
        console.error('Erro ao carregar serviços:', error);
        toast.error('Erro ao carregar serviços');
      } else {
        const newServices = data || [];
        
        if (append) {
          setRealServices(prev => [...prev, ...newServices]);
        } else {
          setRealServices(newServices);
        }
        
        // Verificar se há mais serviços
        const totalLoaded = append ? realServices.length + newServices.length : newServices.length;
        setHasMore(totalLoaded < (count || 0));
      }
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast.error('Erro inesperado ao carregar serviços');
    } finally {
      setLoading(false);
    }
  };

  const loadMoreServices = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadServices(nextPage, true);
  };

  useEffect(() => {
    loadServices();
  }, []);

  // Filtrar serviços baseado na categoria e busca
  const filteredServices = [...services, ...realServices.map(service => ({
    ...service,
    rating: 5.0,
    reviews: 0,
    provider: service.profiles?.full_name || "Usuário",
    location: "Brasil",
    deliveryTime: `${service.delivery_days} dias`,
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=200&fit=crop"
  }))].filter(service => {
    const matchesCategory = selectedCategory === "Todos" || service.category === selectedCategory;
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="relative">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient">
              Encontre o Serviço Perfeito
            </h1>
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-lg blur opacity-30"></div>
          </div>
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
            Conecte-se com profissionais qualificados e transforme suas ideias em realidade
          </p>

          {/* Search Bar */}
          <div className="max-w-3xl mx-auto mb-12">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5 group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Pesquisar serviços, categorias, prestadores..."
                className="pl-12 h-14 text-lg shadow-2xl border-2 border-transparent focus:border-primary/50 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg -z-10 blur-sm"></div>
            </div>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-3 justify-center mb-12">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className={`transition-all duration-300 ${
                  selectedCategory === category 
                    ? "gradient-primary shadow-glow scale-105" 
                    : "hover:shadow-lg hover:scale-105 bg-white/80 backdrop-blur-sm"
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Create Service Button */}
        <div className="flex justify-end mb-12">
          <Link to="/services/new">
            <Button className="gradient-accent shadow-glow hover:shadow-xl transition-all duration-300 hover:scale-105 group">
              <Plus className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
              Criar Serviço
            </Button>
          </Link>
        </div>

        {/* Services Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary mx-auto"></div>
              <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-4 border-primary/30 mx-auto"></div>
            </div>
            <p className="mt-6 text-lg text-muted-foreground">Carregando serviços incríveis...</p>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full flex items-center justify-center">
              <Search className="h-16 w-16 text-primary/50" />
            </div>
            <h3 className="text-2xl font-semibold mb-4">Nenhum serviço encontrado</h3>
            <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
              Tente ajustar sua pesquisa ou explorar outras categorias
            </p>
            <Button 
              onClick={() => {setSearchTerm(""); setSelectedCategory("Todos");}}
              className="gradient-primary shadow-glow"
            >
              Limpar Filtros
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredServices.map((service, index) => (
              <Card key={service.id} className="group hover:shadow-elegant transition-all duration-300 hover:-translate-y-2 shadow-card relative animate-fade-in" style={{animationDelay: `${index * 0.1}s`}}>
                <Link to={`/services/${service.id}`} className="block">
                  <div className="aspect-video bg-gradient-to-br from-primary/10 to-accent/10 rounded-t-lg overflow-hidden">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </Link>
                
                {/* Favorite Button */}
                <div className="absolute top-3 right-3 z-10">
                  <FavoriteButton 
                    serviceId={service.id} 
                    size="sm" 
                    variant="outline"
                    className="bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg"
                  />
                </div>

                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">{service.category}</Badge>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                      {service.rating} ({service.reviews})
                    </div>
                  </div>
                  <Link to={`/services/${service.id}`}>
                    <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors cursor-pointer">
                      {service.title}
                    </CardTitle>
                  </Link>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="line-clamp-2 mb-4">
                    {service.description}
                  </CardDescription>
                  
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {service.provider} • {service.location}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      Entrega em {service.deliveryTime}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <span className="text-lg font-bold text-primary">
                      R$ {service.price.toLocaleString()}
                    </span>
                    <Link to={`/services/${service.id}`}>
                      <Button size="sm" className="gradient-primary">
                        Ver Detalhes
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Load More */}
        {hasMore && !loading && (
          <div className="text-center mt-16">
            <Button 
              variant="outline" 
              size="lg" 
              className="hover:shadow-elegant hover:scale-105 transition-all duration-300 bg-white/80 backdrop-blur-sm border-2 border-primary/20 hover:border-primary/50"
              onClick={loadMoreServices}
            >
              <Plus className="mr-2 h-5 w-5" />
              Carregar Mais Serviços
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Services;