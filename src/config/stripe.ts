
// Development mode configuration
export const STRIPE_CONFIG = {
  // Set to true to bypass Stripe and simulate subscription
  DEVELOPMENT_MODE: true,
  
  // Placeholder for Stripe API key - replace with your actual key
  STRIPE_SECRET_KEY: "sk_test_your_stripe_secret_key_here",
  
  // Subscription plans configuration
  PLANS: {
    CORE: {
      name: "Core Plan",
      price: 999, // $9.99 in cents
      features: ["Access to all current features", "Oral exam practice", "Performance dashboard"],
      comingSoon: false
    },
    PRO: {
      name: "Pro Plan", 
      price: 1999, // $19.99 in cents
      features: ["Everything in Core", "Advanced analytics", "Priority support", "Coming soon features"],
      comingSoon: true
    }
  }
} as const;
