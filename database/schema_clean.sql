-- CR AudioViz AI Partner Portal Database Schema
-- CLEAN INSTALL - Drops existing tables first
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables (in reverse dependency order)
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS deals CASCADE;
DROP TABLE IF EXISTS leads CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS partners CASCADE;
DROP TABLE IF EXISTS partner_applications CASCADE;

-- Drop existing functions
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;

-- ============================================
-- CREATE TABLES (in dependency order)
-- ============================================

-- 1. Partner Applications Table
CREATE TABLE partner_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name VARCHAR(255) NOT NULL,
  contact_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  website VARCHAR(500),
  business_type VARCHAR(100) NOT NULL,
  years_in_business INTEGER NOT NULL,
  sales_experience TEXT NOT NULL,
  target_markets TEXT[] NOT NULL,
  expected_monthly_sales INTEGER NOT NULL,
  how_heard_about_us VARCHAR(255) NOT NULL,
  linkedin_url VARCHAR(500),
  partner_references TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES auth.users(id),
  review_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 2. Partners Table
CREATE TABLE partners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name VARCHAR(255) NOT NULL,
  contact_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  website VARCHAR(500),
  tier VARCHAR(50) NOT NULL DEFAULT 'STARTER',
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  commission_rate DECIMAL(5,2) NOT NULL DEFAULT 15.00,
  total_sales DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_commissions DECIMAL(12,2) NOT NULL DEFAULT 0,
  leads_allocated INTEGER NOT NULL DEFAULT 0,
  leads_converted INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 3. Products Table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  tier INTEGER NOT NULL CHECK (tier BETWEEN 1 AND 4),
  difficulty VARCHAR(50) NOT NULL,
  base_price DECIMAL(10,2) NOT NULL,
  commission_year1 DECIMAL(5,2) NOT NULL,
  commission_recurring DECIMAL(5,2) NOT NULL,
  target_buyer VARCHAR(500) NOT NULL,
  sales_cycle_days INTEGER NOT NULL DEFAULT 30,
  training_required BOOLEAN NOT NULL DEFAULT false,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Leads Table (depends on partners)
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  company_name VARCHAR(255) NOT NULL,
  contact_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  source VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'new',
  estimated_value DECIMAL(12,2) NOT NULL DEFAULT 0,
  notes TEXT,
  contact_deadline TIMESTAMPTZ NOT NULL,
  close_deadline TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Deals Table (depends on partners, leads, products)
CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id),
  product_id UUID NOT NULL REFERENCES products(id),
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  deal_value DECIMAL(12,2) NOT NULL,
  commission_amount DECIMAL(12,2) NOT NULL,
  commission_rate DECIMAL(5,2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  payment_status VARCHAR(50) NOT NULL DEFAULT 'pending',
  clawback_eligible_until TIMESTAMPTZ,
  notes TEXT,
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Documents Table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  file_url TEXT NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  file_size INTEGER NOT NULL,
  partner_tier_required VARCHAR(50) NOT NULL DEFAULT 'STARTER',
  downloads INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CREATE INDEXES
-- ============================================

CREATE INDEX idx_partner_applications_user_id ON partner_applications(user_id);
CREATE INDEX idx_partner_applications_status ON partner_applications(status);
CREATE INDEX idx_partners_user_id ON partners(user_id);
CREATE INDEX idx_partners_tier ON partners(tier);
CREATE INDEX idx_leads_partner_id ON leads(partner_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_deals_partner_id ON deals(partner_id);
CREATE INDEX idx_deals_status ON deals(status);
CREATE INDEX idx_products_tier ON products(tier);
CREATE INDEX idx_products_active ON products(active);
CREATE INDEX idx_documents_category ON documents(category);

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE partner_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CREATE RLS POLICIES
-- ============================================

-- Partner Applications
CREATE POLICY "Users can view own applications" ON partner_applications
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Users can insert own applications" ON partner_applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Partners
CREATE POLICY "Users can view own partner record" ON partners
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Users can update own partner record" ON partners
  FOR UPDATE USING (auth.uid() = user_id);

-- Leads
CREATE POLICY "Partners can view own leads" ON leads
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM partners WHERE partners.id = leads.partner_id AND partners.user_id = auth.uid())
  );
  
CREATE POLICY "Partners can update own leads" ON leads
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM partners WHERE partners.id = leads.partner_id AND partners.user_id = auth.uid())
  );

-- Deals
CREATE POLICY "Partners can view own deals" ON deals
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM partners WHERE partners.id = deals.partner_id AND partners.user_id = auth.uid())
  );

-- Products (public read for active)
CREATE POLICY "Anyone can view active products" ON products
  FOR SELECT USING (active = true);

-- Documents (authenticated users can view)
CREATE POLICY "Authenticated users can view documents" ON documents
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- ============================================
-- INSERT SAMPLE PRODUCTS
-- ============================================

INSERT INTO products (name, description, tier, difficulty, base_price, commission_year1, commission_recurring, target_buyer, sales_cycle_days, training_required) VALUES
  ('Spirits App', 'AI-powered distillery and bar management solution with inventory tracking and recipe optimization', 1, 'easy', 499, 25, 10, 'Distilleries, Bars, Restaurants', 14, false),
  ('Realtor AI Suite', 'Complete real estate AI toolkit with property analysis, market predictions, and client management', 2, 'medium', 999, 20, 8, 'Real Estate Agents, Brokerages', 21, true),
  ('Market Oracle', '5 AI models compete to predict stocks and crypto - gamified investment research platform', 2, 'medium', 1499, 25, 10, 'Traders, Investment Clubs, Educators', 30, true),
  ('CRAudioViz Pro', 'Full AI platform access with 60+ tools, Javari AI assistant, and priority support', 3, 'hard', 4999, 18, 5, 'SMBs, Agencies, Consultants', 45, true),
  ('Enterprise Solution', 'White-label platform deployment with custom branding, dedicated support, and SLA', 4, 'expert', 9999, 15, 3, 'Enterprise, Government, Large Organizations', 90, true),
  ('Javariverse Social', 'Social impact platform with 20 modules for nonprofits, veterans, first responders', 3, 'hard', 2999, 22, 8, 'Nonprofits, Government, Social Enterprises', 45, true);

-- ============================================
-- CREATE TRIGGER FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================
-- CREATE TRIGGERS
-- ============================================

CREATE TRIGGER update_partner_applications_updated_at
  BEFORE UPDATE ON partner_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_partners_updated_at
  BEFORE UPDATE ON partners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deals_updated_at
  BEFORE UPDATE ON deals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- DONE! 
-- ============================================
-- Tables created: 6
-- Products inserted: 6
-- RLS enabled: All tables
-- Triggers: Auto-update timestamps
