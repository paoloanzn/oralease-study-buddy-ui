
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Zap, ArrowLeft } from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { STRIPE_CONFIG } from '@/config/stripe';
import { useNavigate } from 'react-router-dom';

const Subscription = () => {
  const navigate = useNavigate();
  const { createCheckoutSession, isSubscribed, subscriptionTier, loading } = useSubscription();

  const handleSubscribe = async (planType: 'CORE' | 'PRO') => {
    if (STRIPE_CONFIG.PLANS[planType].comingSoon) {
      return;
    }
    
    await createCheckoutSession(planType);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center pt-8 pb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Choose Your Plan</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Unlock the full potential of MedNexusOS with our subscription plans
          </p>
        </div>

        {STRIPE_CONFIG.DEVELOPMENT_MODE && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8 max-w-2xl mx-auto">
            <p className="text-sm text-yellow-800 font-medium text-center">
              🚧 Development Mode: Subscriptions are simulated locally
            </p>
          </div>
        )}

        {/* Subscription Plans */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Core Plan */}
          <Card className={`shadow-lg border-2 ${subscriptionTier === 'CORE' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'} transition-all duration-200`}>
            <CardHeader className="text-center pb-4">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Zap className="h-6 w-6 text-blue-600" />
                <CardTitle className="text-2xl font-bold">Core Plan</CardTitle>
              </div>
              {subscriptionTier === 'CORE' && (
                <Badge variant="secondary" className="w-fit mx-auto">Current Plan</Badge>
              )}
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="text-center">
                <span className="text-4xl font-bold text-blue-600">
                  ${(STRIPE_CONFIG.PLANS.CORE.price / 100).toFixed(2)}
                </span>
                <span className="text-gray-600 text-lg">/month</span>
              </div>
              
              <ul className="space-y-3">
                {STRIPE_CONFIG.PLANS.CORE.features.map((feature, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button 
                onClick={() => handleSubscribe('CORE')}
                className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700"
                disabled={subscriptionTier === 'CORE'}
              >
                {subscriptionTier === 'CORE' ? 'Current Plan' : 'Subscribe to Core'}
              </Button>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className={`shadow-lg border-2 relative ${subscriptionTier === 'PRO' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'} transition-all duration-200`}>
            <CardHeader className="text-center pb-4">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Crown className="h-6 w-6 text-purple-600" />
                <CardTitle className="text-2xl font-bold">Pro Plan</CardTitle>
              </div>
              <div className="flex items-center justify-center space-x-2">
                {subscriptionTier === 'PRO' && (
                  <Badge variant="secondary">Current Plan</Badge>
                )}
                {STRIPE_CONFIG.PLANS.PRO.comingSoon && (
                  <Badge variant="outline">Coming Soon</Badge>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="text-center">
                <span className="text-4xl font-bold text-purple-600">
                  ${(STRIPE_CONFIG.PLANS.PRO.price / 100).toFixed(2)}
                </span>
                <span className="text-gray-600 text-lg">/month</span>
              </div>
              
              <ul className="space-y-3">
                {STRIPE_CONFIG.PLANS.PRO.features.map((feature, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button 
                onClick={() => handleSubscribe('PRO')}
                className="w-full h-12 text-lg bg-purple-600 hover:bg-purple-700"
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
            </CardContent>
          </Card>
        </div>

        {/* Already subscribed message */}
        {isSubscribed && (
          <div className="text-center mt-8">
            <p className="text-gray-600 mb-4">
              You're already subscribed! You can now access all features.
            </p>
            <Button 
              onClick={() => navigate('/')}
              className="bg-green-600 hover:bg-green-700"
            >
              Go to Dashboard
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Subscription;
