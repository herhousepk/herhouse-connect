import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingBag, Gift, Users, Copy, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/components/ui/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Order = Database['public']['Tables']['orders']['Row'];
type Product = Database['public']['Tables']['products']['Row'];

export function CustomerDashboard() {
  const { profile } = useProfile();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [referralStats, setReferralStats] = useState({ count: 0, earnings: 0 });
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    if (!profile) return;

    const fetchData = async () => {
      try {
        // Fetch orders
        const { data: ordersData } = await supabase
          .from('orders')
          .select('*')
          .eq('customer_id', profile.id)
          .order('created_at', { ascending: false });

        // Fetch featured products
        const { data: productsData } = await supabase
          .from('products')
          .select('*')
          .eq('status', 'approved')
          .eq('is_featured', true)
          .limit(6);

        // Fetch referral stats
        const { data: referralsData } = await supabase
          .from('referrals')
          .select('*')
          .eq('referrer_id', profile.id);

        setOrders(ordersData || []);
        setProducts(productsData || []);
        setReferralStats({
          count: referralsData?.length || 0,
          earnings: (referralsData?.length || 0) * 100 // Example calculation
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [profile]);

  const copyReferralCode = async () => {
    if (!profile?.referral_code) return;
    
    await navigator.clipboard.writeText(profile.referral_code);
    setCopiedCode(true);
    toast({
      title: "Copied!",
      description: "Referral code copied to clipboard"
    });
    
    setTimeout(() => setCopiedCode(false), 2000);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-8 bg-muted rounded"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Welcome back, {profile?.full_name}</h1>
          <p className="text-muted-foreground">Manage your orders and earn rewards</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{orders.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Referrals</CardTitle>
            <Users className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">{referralStats.count}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reward Earnings</CardTitle>
            <Gift className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">PKR {referralStats.earnings}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-subtle border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Referral Code</CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={copyReferralCode}
              className="h-8 w-8 p-0"
            >
              {copiedCode ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-primary">{profile?.referral_code || 'N/A'}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="orders" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="orders">My Orders</TabsTrigger>
          <TabsTrigger value="products">Browse Products</TabsTrigger>
          <TabsTrigger value="referrals">Referral Program</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Track your recent purchases and order status</CardDescription>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
                  <p className="text-muted-foreground mb-4">Start shopping to see your orders here</p>
                  <Button>Browse Products</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Order #{order.order_number}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">PKR {order.total_amount}</p>
                        <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'}>
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Featured Products</CardTitle>
              <CardDescription>Discover trending products from our verified hosts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-square bg-muted"></div>
                    <CardHeader className="p-4">
                      <CardTitle className="text-lg">{product.title}</CardTitle>
                      <CardDescription className="text-sm line-clamp-2">
                        {product.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-lg font-bold text-primary">PKR {product.price}</p>
                          {product.sale_price && (
                            <p className="text-sm text-muted-foreground line-through">
                              PKR {product.sale_price}
                            </p>
                          )}
                        </div>
                        <Button size="sm">Add to Cart</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="referrals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Referral Program</CardTitle>
              <CardDescription>Share your code and earn rewards for every successful referral</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center p-6 bg-gradient-primary rounded-lg text-white">
                <h3 className="text-xl font-bold mb-2">Your Referral Code</h3>
                <div className="text-3xl font-bold mb-4">{profile?.referral_code}</div>
                <Button 
                  variant="secondary" 
                  onClick={copyReferralCode}
                  className="bg-white text-primary hover:bg-white/90"
                >
                  {copiedCode ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Code
                    </>
                  )}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Total Referrals</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary">{referralStats.count}</div>
                    <p className="text-sm text-muted-foreground">People you've referred</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Earned Rewards</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-secondary">PKR {referralStats.earnings}</div>
                    <p className="text-sm text-muted-foreground">From successful referrals</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}