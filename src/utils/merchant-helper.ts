import type { Merchant } from '../api/merchants/types';

export const getMerchantStatus = (merchant: Merchant) => {
  const now = new Date().getTime();
  
  const isTrialActive = merchant.is_trial && 
    merchant.trial_ends_at && 
    new Date(merchant.trial_ends_at).getTime() >= now;

  const isSubActive = !merchant.is_trial && 
    merchant.subscription_ends_at && 
    new Date(merchant.subscription_ends_at).getTime() >= now;

  return {
    isValid: merchant.is_active && (isTrialActive || isSubActive),
    isTrialActive,
    isSubActive
  };
};