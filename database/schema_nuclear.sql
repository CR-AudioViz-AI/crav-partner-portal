-- CR AudioViz AI Partner Portal Database Schema
-- NUCLEAR CLEAN INSTALL - Drops EVERYTHING first
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- DROP ALL POLICIES FIRST
-- ============================================

DROP POLICY IF EXISTS "Users can view own applications" ON partner_applications;
DROP POLICY IF EXISTS "Users can insert own applications" ON partner_applications;
DROP POLICY IF EXISTS "Users can view own partner record" ON partners;
DROP POLICY IF EXISTS "Users can update own partner record" ON partners;
DROP POLICY IF EXISTS "Partners can view own leads" ON leads;
DROP POLICY IF EXISTS "Partners can update own leads" ON leads;
DROP POLICY IF EXISTS "Partners can view own deals" ON deals;
DROP POLICY IF EXISTS "Anyone can view active products" ON products;
DROP POLICY IF EXISTS "Authenticated users can view documents" ON documents;
DROP POLICY IF EXISTS "Partners can view documents for their tier" ON documents;

-- ============================================
-- DROP ALL TABLES
-- ============================================

DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS deals CASCADE;
DROP TABLE IF EXISTS leads CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS partners CASCADE;
DROP TABLE IF EXISTS partner_applications CASCADE;

-- Drop existing functions
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;

-- ============================================
-- CREATE TABLES
-- ============================================

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
-- INSERT PRODUCTS
-- ============================================

INSERT INTO products (name, description, tier, difficulty, base_price, commission_year1, commission_recurring, target_buyer, sales_cycle_days, training_required) VALUES
  ('Spirits App', 'AI-powered distillery and bar management solution', 1, 'easy', 499, 25, 10, 'Distilleries, Bars, Restaurants', 14, false),
  ('Realtor AI Suite', 'Complete real estate AI toolkit', 2, 'medium', 999, 20, 8, 'Real Estate Agents, Brokerages', 21, true),
  ('Market Oracle', '5 AI models compete to predict stocks and crypto', 2, 'medium', 1499, 25, 10, 'Traders, Investment Clubs', 30, true),
  ('CRAudioViz Pro', 'Full AI platform with 60+ tools', 3, 'hard', 4999, 18, 5, 'SMBs, Agencies', 45, true),
  ('Enterprise Solution', 'White-label platform deployment', 4, 'expert', 9999, 15, 3, 'Enterprise, Government', 90, true),
  ('CRAIverse Social', 'Social impact platform with 20 modules', 3, 'hard', 2999, 22, 8, 'Nonprofits, Government', 45, true);

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
-- DONE! RLS & POLICIES ADDED SEPARATELY
-- ============================================
