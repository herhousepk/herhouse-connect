import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ShoppingCart, Heart, Share2, Package, Truck, Shield, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Product = Database['public']['Tables']['products']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [host, setHost] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .eq('status', 'approved')
        .single();

      if (productError) throw productError;

      setProduct(productData);

      // Fetch host details
      if (productData.her_host_id) {
        const { data: hostData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', productData.her_host_id)
          .single();

        setHost(hostData);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast({
        title: "Error",
        description: "Product not found",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add items to cart",
        variant: "destructive"
      });
      return;
    }

    // Future: Add to cart functionality
    toast({
      title: "Added to Cart",
      description: `${quantity}x ${product?.title} added to cart`
    });
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: product?.title,
        text: product?.description,
        url: window.location.href
      });
    } catch (error) {
      // Fallback to clipboard
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied",
        description: "Product link copied to clipboard"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded mb-8 w-32"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="aspect-square bg-muted rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-16 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Product Not Found</h1>
          <p className="text-muted-foreground mb-4">The product you're looking for doesn't exist.</p>
          <Link to="/products">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentPrice = product.sale_price && Number(product.sale_price) < Number(product.price) 
    ? Number(product.sale_price) 
    : Number(product.price);

  const isBulkPrice = quantity >= (product.bulk_quantity || 1) && product.bulk_price;
  const finalPrice = isBulkPrice ? Number(product.bulk_price) : currentPrice;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <Link to="/products" className="inline-flex items-center text-primary hover:underline mb-8">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-gradient-subtle rounded-lg overflow-hidden">
              {product.images && product.images.length > 0 ? (
                <img 
                  src={product.images[selectedImage]} 
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <Package className="h-24 w-24 text-muted-foreground" />
                </div>
              )}
            </div>
            
            {/* Image Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square w-20 rounded-md overflow-hidden border-2 transition-colors ${
                      selectedImage === index ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img src={image} alt={`${product.title} ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between gap-4 mb-2">
                <h1 className="text-3xl font-bold">{product.title}</h1>
                <Button variant="ghost" size="sm" onClick={handleShare}>
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center gap-2 mb-4">
                {product.category && (
                  <Badge variant="outline">{product.category}</Badge>
                )}
                {product.is_featured && (
                  <Badge className="bg-secondary text-secondary-foreground">Featured</Badge>
                )}
                {product.sale_price && Number(product.sale_price) < Number(product.price) && (
                  <Badge className="bg-destructive text-destructive-foreground">On Sale</Badge>
                )}
              </div>

              {product.brand && (
                <p className="text-muted-foreground mb-2">Brand: {product.brand}</p>
              )}
            </div>

            {/* Pricing */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-primary">
                  PKR {(finalPrice * quantity).toLocaleString()}
                </span>
                {product.sale_price && Number(product.sale_price) < Number(product.price) && (
                  <span className="text-xl text-muted-foreground line-through">
                    PKR {(Number(product.price) * quantity).toLocaleString()}
                  </span>
                )}
              </div>
              
              {isBulkPrice && (
                <p className="text-sm text-secondary font-medium">
                  🎉 Bulk discount applied! Save PKR {((currentPrice - Number(product.bulk_price!)) * quantity).toLocaleString()}
                </p>
              )}
              
              {product.bulk_price && product.bulk_quantity && !isBulkPrice && (
                <p className="text-sm text-muted-foreground">
                  Buy {product.bulk_quantity}+ for PKR {Number(product.bulk_price).toLocaleString()} each
                </p>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Product Details */}
            <div className="grid grid-cols-2 gap-4">
              {product.size && (
                <div>
                  <p className="font-medium">Size</p>
                  <p className="text-muted-foreground">{product.size}</p>
                </div>
              )}
              {product.color && (
                <div>
                  <p className="font-medium">Color</p>
                  <p className="text-muted-foreground">{product.color}</p>
                </div>
              )}
            </div>

            {/* Quantity & Add to Cart */}
            <div className="space-y-4">
              <div>
                <label className="font-medium mb-2 block">Quantity</label>
                <div className="flex items-center gap-3">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </Button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={product.stock_quantity !== null && quantity >= product.stock_quantity}
                  >
                    +
                  </Button>
                </div>
                {product.stock_quantity !== null && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {product.stock_quantity > 0 ? `${product.stock_quantity} available` : 'Out of stock'}
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={handleAddToCart} 
                  className="flex-1"
                  disabled={product.stock_quantity === 0}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
                <Button variant="outline" size="icon">
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t">
              <div className="text-center">
                <Shield className="h-8 w-8 mx-auto text-primary mb-2" />
                <p className="text-sm font-medium">Secure Payment</p>
              </div>
              <div className="text-center">
                <Truck className="h-8 w-8 mx-auto text-primary mb-2" />
                <p className="text-sm font-medium">Fast Delivery</p>
              </div>
              <div className="text-center">
                <Star className="h-8 w-8 mx-auto text-primary mb-2" />
                <p className="text-sm font-medium">Quality Assured</p>
              </div>
            </div>
          </div>
        </div>

        {/* Host Information */}
        {host && (
          <Card className="mt-12">
            <CardHeader>
              <CardTitle>Sold by</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {host.full_name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{host.store_name || host.full_name}</h3>
                  <p className="text-muted-foreground">{host.city && `📍 ${host.city}`}</p>
                  <Badge variant="outline" className="mt-1">Verified Host</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}