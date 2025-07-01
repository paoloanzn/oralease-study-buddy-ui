
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { STRIPE_CONFIG } from '@/config/stripe';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionContextType {
  isSubscribed: boolean;
  subscriptionTier: string | null;
  subscriptionEnd: string | null;
  loading: boolean;
  checkSubscription: () => Promise<void>;
  createCheckoutSession: (planType: 'CORE' | 'PRO') => Promise<void>;
  manageSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState<string | null>(null);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const checkSubscription = async () => {
    if (!user) {
      setIsSubscribed(false);
      setSubscriptionTier(null);
      setSubscriptionEnd(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      if (STRIPE_CONFIG.DEVELOPMENT_MODE) {
        // In development mode, check local storage for subscription status
        const devSubscription = localStorage.getItem('dev_subscription');
        if (devSubscription) {
          const subscription = JSON.parse(devSubscription);
          setIsSubscribed(subscription.isSubscribed);
          setSubscriptionTier(subscription.tier);
          setSubscriptionEnd(subscription.end);
        } else {
          setIsSubscribed(false);
          setSubscriptionTier(null);
          setSubscriptionEnd(null);
        }
      } else {
        // In production mode, call Stripe API
        const { data, error } = await supabase.functions.invoke('check-subscription');
        
        if (error) {
          console.error('Error checking subscription:', error);
          toast({
            title: "Error",
            description: "Failed to check subscription status",
            variant: "destructive",
          });
          return;
        }

        setIsSubscribed(data.subscribed || false);
        setSubscriptionTier(data.subscription_tier || null);
        setSubscriptionEnd(data.subscription_end || null);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      toast({
        title: "Error",
        description: "Failed to check subscription status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createCheckoutSession = async (planType: 'CORE' | 'PRO') => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please sign in to subscribe",
        variant: "destructive",
      });
      return;
    }

    try {
      if (STRIPE_CONFIG.DEVELOPMENT_MODE) {
        // Simulate subscription in development mode
        const devSubscription = {
          isSubscribed: true,
          tier: planType,
          end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
        };
        localStorage.setItem('dev_subscription', JSON.stringify(devSubscription));
        
        setIsSubscribed(true);
        setSubscriptionTier(planType);
        setSubscriptionEnd(devSubscription.end);
        
        toast({
          title: "Success!",
          description: `Successfully subscribed to ${STRIPE_CONFIG.PLANS[planType].name} (Development Mode)`,
        });
      } else {
        // In production mode, create actual Stripe checkout session
        const { data, error } = await supabase.functions.invoke('create-checkout', {
          body: { planType }
        });

        if (error) {
          console.error('Error creating checkout session:', error);
          toast({
            title: "Error",
            description: "Failed to create checkout session",
            variant: "destructive",
          });
          return;
        }

        // Redirect to Stripe checkout
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: "Error",
        description: "Failed to create checkout session",
        variant: "destructive",
      });
    }
  };

  const manageSubscription = async () => {
    if (!user) return;

    try {
      if (STRIPE_CONFIG.DEVELOPMENT_MODE) {
        // In development mode, just clear the subscription
        localStorage.removeItem('dev_subscription');
        setIsSubscribed(false);
        setSubscriptionTier(null);
        setSubscriptionEnd(null);
        
        toast({
          title: "Success!",
          description: "Subscription cancelled (Development Mode)",
        });
      } else {
        // In production mode, redirect to Stripe customer portal
        const { data, error } = await supabase.functions.invoke('customer-portal');

        if (error) {
          console.error('Error accessing customer portal:', error);
          toast({
            title: "Error",
            description: "Failed to access customer portal",
            variant: "destructive",
          });
          return;
        }

        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error managing subscription:', error);
      toast({
        title: "Error",
        description: "Failed to manage subscription",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    checkSubscription();
  }, [user]);

  const value = {
    isSubscribed,
    subscriptionTier,
    subscriptionEnd,
    loading,
    checkSubscription,
    createCheckoutSession,
    manageSubscription,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};
