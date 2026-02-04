export interface MerchantSettings {
  [key: string]: any; // Phù hợp với $casts = ['settings' => 'array']
}

export interface Merchant {
  id: number;
  name: string;
  slug: string;
  business_name?: string;
  tax_code?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  plan_type: string;
  trial_ends_at?: string | Date;
  subscription_starts_at?: string | Date;
  subscription_ends_at?: string | Date;
  is_active: boolean;
  is_trial: boolean;
  settings: MerchantSettings;
  currency: string;
  timezone: string;
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  
  // Timestamps
  created_at?: string;
  updated_at?: string;
}
export interface MerchantFilters {
  search?: string;
  is_active?: boolean;
  status?: 'trial' | 'subscribed' | 'expired';
}