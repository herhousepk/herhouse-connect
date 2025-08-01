import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Package, ShoppingCart, TrendingUp, CheckCircle, XCircle, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Product = Database['public']['Tables']['products']['Row'];
type Order = Database['public']['Tables']['orders']['Row'];

export function AdminDashboard() {
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingApprovals: 0,
    totalProducts: 0,
    totalOrders: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch all profiles for approval management
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      // Fetch all products for approval
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      // Fetch all orders
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      const pendingApprovals = (profilesData?.filter(p => !p.is_approved && p.role !== 'her_customer').length || 0) +
                              (productsData?.filter(p => p.status === 'pending').length || 0);

      setProfiles(profilesData || []);
      setProducts(productsData || []);
      setOrders(ordersData || []);
      setStats({
        totalUsers: profilesData?.length || 0,
        pendingApprovals,
        totalProducts: productsData?.length || 0,
        totalOrders: ordersData?.length || 0
      });
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const approveProfile = async (profileId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_approved: true })
        .eq('id', profileId);

      if (error) throw error;

      setProfiles(profiles.map(p => 
        p.id === profileId ? { ...p, is_approved: true } : p
      ));

      toast({
        title: "Approved",
        description: "Profile has been approved successfully"
      });
    } catch (error) {
      console.error('Error approving profile:', error);
      toast({
        title: "Error",
        description: "Failed to approve profile",
        variant: "destructive"
      });
    }
  };

  const approveProduct = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ status: 'approved' })
        .eq('id', productId);

      if (error) throw error;

      setProducts(products.map(p => 
        p.id === productId ? { ...p, status: 'approved' as any } : p
      ));

      toast({
        title: "Approved",
        description: "Product has been approved successfully"
      });
    } catch (error) {
      console.error('Error approving product:', error);
      toast({
        title: "Error",
        description: "Failed to approve product",
        variant: "destructive"
      });
    }
  };

  const rejectProduct = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ status: 'rejected' })
        .eq('id', productId);

      if (error) throw error;

      setProducts(products.map(p => 
        p.id === productId ? { ...p, status: 'rejected' as any } : p
      ));

      toast({
        title: "Rejected",
        description: "Product has been rejected"
      });
    } catch (error) {
      console.error('Error rejecting product:', error);
      toast({
        title: "Error",
        description: "Failed to reject product",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
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

  const pendingProfiles = profiles.filter(p => !p.is_approved && p.role !== 'her_customer');
  const pendingProducts = products.filter(p => p.status === 'pending');

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage users, products, and platform operations</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.pendingApprovals}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">{stats.totalProducts}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{stats.totalOrders}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="approvals" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="approvals">Approvals</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="approvals" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pending Profile Approvals */}
            <Card>
              <CardHeader>
                <CardTitle>Pending Profile Approvals</CardTitle>
                <CardDescription>Users waiting for approval to become hosts/suppliers</CardDescription>
              </CardHeader>
              <CardContent>
                {pendingProfiles.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No pending profile approvals</p>
                ) : (
                  <div className="space-y-4">
                    {pendingProfiles.map((profile) => (
                      <div key={profile.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{profile.full_name}</p>
                          <p className="text-sm text-muted-foreground">{profile.email}</p>
                          <Badge variant="secondary">{profile.role.replace('her_', '')}</Badge>
                        </div>
                        <Button onClick={() => approveProfile(profile.id)} size="sm">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pending Product Approvals */}
            <Card>
              <CardHeader>
                <CardTitle>Pending Product Approvals</CardTitle>
                <CardDescription>Products waiting for approval to go live</CardDescription>
              </CardHeader>
              <CardContent>
                {pendingProducts.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No pending product approvals</p>
                ) : (
                  <div className="space-y-4">
                    {pendingProducts.map((product) => (
                      <div key={product.id} className="space-y-3 p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{product.title}</p>
                          <p className="text-sm text-muted-foreground">{product.category}</p>
                          <p className="text-sm font-bold">PKR {product.price}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={() => approveProduct(product.id)} size="sm" className="flex-1">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                          <Button onClick={() => rejectProduct(product.id)} variant="destructive" size="sm" className="flex-1">
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>View and manage all platform users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {profiles.map((profile) => (
                  <div key={profile.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{profile.full_name}</p>
                      <p className="text-sm text-muted-foreground">{profile.email}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline">{profile.role.replace('her_', '')}</Badge>
                        <Badge variant={profile.is_approved ? 'default' : 'secondary'}>
                          {profile.is_approved ? 'Approved' : 'Pending'}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        Joined {new Date(profile.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Product Management</CardTitle>
              <CardDescription>View and manage all platform products</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {products.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{product.title}</p>
                      <p className="text-sm text-muted-foreground">{product.category}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge 
                          variant={
                            product.status === 'approved' ? 'default' : 
                            product.status === 'pending' ? 'secondary' : 'destructive'
                          }
                        >
                          {product.status}
                        </Badge>
                        {product.is_featured && <Badge variant="outline">Featured</Badge>}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">PKR {product.price}</p>
                      <p className="text-sm text-muted-foreground">Stock: {product.stock_quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Order Management</CardTitle>
              <CardDescription>View and track all platform orders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Order #{order.order_number}</p>
                      <p className="text-sm text-muted-foreground">{order.phone}</p>
                      <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'}>
                        {order.status}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">PKR {order.total_amount}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}