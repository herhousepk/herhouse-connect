import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/components/ui/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            // No profile found, create one
            const { data: newProfile, error: insertError } = await supabase
              .from('profiles')
              .insert([
                {
                  user_id: user.id,
                  email: user.email || '',
                  full_name: user.user_metadata.full_name || user.email?.split('@')[0] || '',
                  role: 'her_customer'
                }
              ])
              .select()
              .single();

            if (insertError) {
              console.error('Error creating profile:', insertError);
              toast({
                title: "Profile Error",
                description: "Failed to create user profile",
                variant: "destructive"
              });
            } else {
              setProfile(newProfile);
            }
          } else {
            console.error('Error fetching profile:', error);
            toast({
              title: "Profile Error", 
              description: "Failed to fetch user profile",
              variant: "destructive"
            });
          }
        } else {
          setProfile(data);
        }
      } catch (error) {
        console.error('Error in fetchProfile:', error);
        toast({
          title: "Profile Error",
          description: "An unexpected error occurred",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, toast]);

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user || !profile) return false;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        toast({
          title: "Update Error",
          description: "Failed to update profile",
          variant: "destructive"
        });
        return false;
      }

      setProfile(data);
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully"
      });
      return true;
    } catch (error) {
      console.error('Error in updateProfile:', error);
      toast({
        title: "Update Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    profile,
    loading,
    updateProfile
  };
}