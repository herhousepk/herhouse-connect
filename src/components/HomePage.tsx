import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Star, Users, ShoppingBag, Gift, Crown, Heart } from "lucide-react";
import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold gradient-text">HerHouse.pk</h1>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-smooth">Features</a>
            <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-smooth">How it Works</a>
            <a href="#join" className="text-muted-foreground hover:text-foreground transition-smooth">Join Us</a>
          </nav>
          <Button className="her-button-primary">
            Sign In with Google
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="her-hero-gradient text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <Badge className="bg-white/20 text-white border-white/30 mb-6">
              Pakistan's First Women-Centric Marketplace
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Empowering Women to Build 
              <span className="block">Their Own Business Empire</span>
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Transform your home into a profitable store. Connect with suppliers, list products, and grow your business - all from the comfort of your home.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 px-8 py-4 text-lg font-semibold">
                Start Your Store Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Link to="/products">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-4 text-lg">
                  Browse Products
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">1000+</div>
              <div className="text-muted-foreground">Active HerHosts</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">5000+</div>
              <div className="text-muted-foreground">Products Listed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">50+</div>
              <div className="text-muted-foreground">Verified Suppliers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">10K+</div>
              <div className="text-muted-foreground">Happy Customers</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose HerHouse.pk?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Built specifically for Pakistani women entrepreneurs to thrive in the digital marketplace
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="her-card text-center p-6">
              <CardHeader>
                <ShoppingBag className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Your Own Digital Store</CardTitle>
                <CardDescription>
                  Get your personalized store URL like herhouse.pk/store/yourname and manage everything from one dashboard
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="her-card text-center p-6">
              <CardHeader>
                <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Connect with Suppliers</CardTitle>
                <CardDescription>
                  Access verified suppliers and list their products in your store with competitive pricing
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="her-card text-center p-6">
              <CardHeader>
                <Gift className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Referral Rewards</CardTitle>
                <CardDescription>
                  Earn rewards by referring customers and other women to join the HerHouse community
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How HerHouse Works</h2>
            <p className="text-xl text-muted-foreground">Simple steps to start your entrepreneurial journey</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Sign Up & Get Approved</h3>
              <p className="text-muted-foreground">Register with your Google account and get approval to become a HerHost</p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">List Products</h3>
              <p className="text-muted-foreground">Add your own products or list items from our verified suppliers</p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Start Selling</h3>
              <p className="text-muted-foreground">Share your store link, manage orders, and grow your business</p>
            </div>
          </div>
        </div>
      </section>

      {/* User Roles Section */}
      <section id="join" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Join Our Community</h2>
            <p className="text-xl text-muted-foreground">Choose your role and be part of Pakistan's growing women entrepreneur network</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="her-card p-6 hover:shadow-medium transition-smooth">
              <CardHeader className="text-center">
                <Crown className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Become a HerHost</CardTitle>
                <CardDescription>
                  Start your own digital store and sell products from home
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Get your own store URL</li>
                  <li>• List unlimited products</li>
                  <li>• Access to suppliers</li>
                  <li>• Referral rewards program</li>
                </ul>
                <Button className="w-full her-button-primary">
                  Apply as HerHost
                </Button>
              </CardContent>
            </Card>
            
            <Card className="her-card p-6 hover:shadow-medium transition-smooth">
              <CardHeader className="text-center">
                <ShoppingBag className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Become a HerSupplier</CardTitle>
                <CardDescription>
                  Provide products to HerHosts across Pakistan
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Reach thousands of HerHosts</li>
                  <li>• Bulk order opportunities</li>
                  <li>• Verified supplier badge</li>
                  <li>• Direct communication</li>
                </ul>
                <Button className="w-full her-button-secondary">
                  Apply as Supplier
                </Button>
              </CardContent>
            </Card>
            
            <Card className="her-card p-6 hover:shadow-medium transition-smooth md:col-span-2 lg:col-span-1">
              <CardHeader className="text-center">
                <Star className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Affiliate Partner</CardTitle>
                <CardDescription>
                  Earn rewards by referring others to HerHouse
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Custom referral links</li>
                  <li>• Track your referrals</li>
                  <li>• Milestone rewards</li>
                  <li>• Monthly payouts</li>
                </ul>
                <Button className="w-full her-button-secondary">
                  Become Affiliate
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 her-gradient text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Start Your Journey?</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of Pakistani women who are already building successful businesses with HerHouse.pk
          </p>
          <Button size="lg" className="bg-white text-primary hover:bg-white/90 px-8 py-4 text-lg font-semibold">
            Sign Up with Google
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Heart className="h-6 w-6 text-primary" />
                <span className="text-lg font-semibold">HerHouse.pk</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Empowering Pakistani women entrepreneurs to build successful businesses from home.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">Platform</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-smooth">For HerHosts</a></li>
                <li><a href="#" className="hover:text-foreground transition-smooth">For Suppliers</a></li>
                <li><a href="#" className="hover:text-foreground transition-smooth">For Customers</a></li>
                <li><a href="#" className="hover:text-foreground transition-smooth">Affiliate Program</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-smooth">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground transition-smooth">Contact Us</a></li>
                <li><a href="#" className="hover:text-foreground transition-smooth">WhatsApp Support</a></li>
                <li><a href="#" className="hover:text-foreground transition-smooth">Community</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-smooth">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-foreground transition-smooth">Terms of Service</a></li>
                <li><a href="#" className="hover:text-foreground transition-smooth">Refund Policy</a></li>
                <li><a href="#" className="hover:text-foreground transition-smooth">Guidelines</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 HerHouse.pk. All rights reserved. Made with ❤️ for Pakistani women entrepreneurs.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}