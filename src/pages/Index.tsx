import { useAuth } from "@/hooks/useAuth";
import HomePage from "@/components/HomePage";
import { DashboardRouter } from "@/components/DashboardRouter";

const Index = () => {
  const { user } = useAuth();
  
  // If user is logged in, show dashboard, otherwise show homepage
  return user ? <DashboardRouter /> : <HomePage />;
};

export default Index;
