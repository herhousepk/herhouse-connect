import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { CustomerDashboard } from './dashboards/CustomerDashboard';
import { HostDashboard } from './dashboards/HostDashboard';
import { AdminDashboard } from './dashboards/AdminDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogIn, Loader2 } from 'lucide-react';

export function DashboardRouter() {
  const { user, loading: authLoading, signInWithGoogle } = useAuth();
  const { profile, loading: profileLoading } = useProfile();

  // Show loading while checking auth and profile
  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome to HerHouse.pk</CardTitle>
            <CardDescription>Sign in to access your dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={signInWithGoogle} className="w-full gap-2">
              <LogIn className="h-4 w-4" />
              Sign in with Google
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show loading if profile not loaded yet
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Setting up your profile...</p>
        </div>
      </div>
    );
  }

  // Route to appropriate dashboard based on user role
  switch (profile.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'her_host':
      return <HostDashboard />;
    case 'her_supplier':
      return <HostDashboard />; // Suppliers use same dashboard as hosts for now
    case 'her_customer':
    default:
      return <CustomerDashboard />;
  }
}