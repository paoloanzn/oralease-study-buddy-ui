
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Zap } from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { STRIPE_CONFIG } from '@/config/stripe';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose }) => {
  const { createCheckoutSession, isSubscribed, subscriptionTier } = useSubscription();

  const handleSubscribe = async (planType: 'CORE' | 'PRO') => {
    if (STRIPE_CONFIG.PLANS[planType].comingSoon) {
      return;
    }
    
    await createCheckoutSession(planType);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Choose Your Plan</DialogTitle>
          <DialogDescription className="text-center">
            Unlock the full potential of MedNexusOS with our subscription plans
          </DialogDescription>
        </DialogHeader>
        
        {STRIPE_CONFIG.DEVELOPMENT_MODE && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-yellow-800 font-medium">
              🚧 Development Mode: Subscriptions are simulated locally
            </p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          {/* Core Plan */}
          <div className={`border rounded-lg p-6 ${subscriptionTier === 'CORE' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Core Plan</h3>
              </div>
              {subscriptionTier === 'CORE' && (
                <Badge variant="secondary">Current Plan</Badge>
              )}
            </div>
            
            <div className="mb-4">
              <span className="text-3xl font-bold">${(STRIPE_CONFIG.PLANS.CORE.price / 100).toFixed(2)}</span>
              <span className="text-gray-600">/month</span>
            </div>
            
            <ul className="space-y-2 mb-6">
              {STRIPE_CONFIG.PLANS.CORE.features.map((feature, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
            
            <Button 
              onClick={() => handleSubscribe('CORE')}
              className="w-full"
              disabled={subscriptionTier === 'CORE'}
            >
              {subscriptionTier === 'CORE' ? 'Current Plan' : 'Subscribe to Core'}
            </Button>
          </div>

          {/* Pro Plan */}
          <div className={`border rounded-lg p-6 relative ${subscriptionTier === 'PRO' ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Crown className="h-5 w-5 text-purple-600" />
                <h3 className="text-lg font-semibold">Pro Plan</h3>
              </div>
              {subscriptionTier === 'PRO' && (
                <Badge variant="secondary">Current Plan</Badge>
              )}
              {STRIPE_CONFIG.PLANS.PRO.comingSoon && (
                <Badge variant="outline">Coming Soon</Badge>
              )}
            </div>
            
            <div className="mb-4">
              <span className="text-3xl font-bold">${(STRIPE_CONFIG.PLANS.PRO.price / 100).toFixed(2)}</span>
              <span className="text-gray-600">/month</span>
            </div>
            
            <ul className="space-y-2 mb-6">
              {STRIPE_CONFIG.PLANS.PRO.features.map((feature, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
            
            <Button 
              onClick={() => handleSubscribe('PRO')}
              className="w-full"
              disabled={STRIPE_CONFIG.PLANS.PRO.comingSoon || subscriptionTier === 'PRO'}
              variant={STRIPE_CONFIG.PLANS.PRO.comingSoon ? "outline" : "default"}
            >
              {STRIPE_CONFIG.PLANS.PRO.comingSoon 
                ? 'Coming Soon' 
                : subscriptionTier === 'PRO' 
                  ? 'Current Plan' 
                  : 'Subscribe to Pro'
              }
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
