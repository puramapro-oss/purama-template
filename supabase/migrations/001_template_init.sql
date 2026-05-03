-- =============================================================================
-- {{APP_NAME}} — Migration 001 : Schéma initial Supabase
-- =============================================================================
-- Cible : VPS Hostinger Supabase self-hosted (auth.purama.dev)
-- Schéma : `{{SLUG}}` (isolé de `public`)
--
-- Pré-requis VPS (à exécuter avant cette migration) :
--   1. CREATE SCHEMA IF NOT EXISTS {{SLUG}};
--   2. PGRST_DB_SCHEMAS contient `{{SLUG}}` dans /opt/supabase/docker/.env
--   3. docker compose up -d --force-recreate rest  (NOT restart — cf MOKSHA error)
--
-- Règles bloquantes (cf ERRORS.md historique Purama) :
--   - gen_random_uuid() — JAMAIS uuid_generate_v4() (YATRA 2026-04-25)
--   - GRANT USAGE + ALL TABLES + ALTER DEFAULT PRIVILEGES nécessaires
--   - profiles.id = auth.users.id direct (1:1, pas de auth_user_id séparé)
--   - RLS DO $$ BEGIN ... EXCEPTION blocks pour idempotence
-- =============================================================================

CREATE SCHEMA IF NOT EXISTS {{SLUG}};
SET search_path = {{SLUG}}, public;

-- pgcrypto fournit gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;

-- Permissions PostgREST
GRANT USAGE ON SCHEMA {{SLUG}} TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA {{SLUG}} TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA {{SLUG}} TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA {{SLUG}} TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA {{SLUG}} GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA {{SLUG}} GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA {{SLUG}} GRANT ALL ON FUNCTIONS TO postgres, anon, authenticated, service_role;

-- =============================================================================
-- TABLE : profiles (1:1 avec auth.users)
-- =============================================================================
CREATE TABLE IF NOT EXISTS {{SLUG}}.profiles (
  id                     UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email                  TEXT UNIQUE NOT NULL,
  full_name              TEXT,
  avatar_url             TEXT,
  role                   TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user','admin','super_admin')),
  plan                   TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free','standard','premium')),
  trial_ends_at          TIMESTAMPTZ,
  stripe_customer_id     TEXT,
  stripe_subscription_id TEXT,
  referral_code          TEXT UNIQUE NOT NULL DEFAULT substr(md5(random()::text), 1, 8),
  referred_by_code       TEXT,
  wallet_balance         INTEGER NOT NULL DEFAULT 0,  -- en centimes
  tier                   TEXT NOT NULL DEFAULT 'bronze',
  xp                     INTEGER NOT NULL DEFAULT 0,
  level                  INTEGER NOT NULL DEFAULT 1,
  streak_days            INTEGER NOT NULL DEFAULT 0,
  last_active_at         TIMESTAMPTZ,
  theme                  TEXT NOT NULL DEFAULT 'dark' CHECK (theme IN ('light','dark','system')),
  locale                 TEXT NOT NULL DEFAULT 'fr',
  notifs_enabled         BOOLEAN NOT NULL DEFAULT true,
  tutorial_completed     BOOLEAN NOT NULL DEFAULT false,
  metadata               JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON {{SLUG}}.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON {{SLUG}}.profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer ON {{SLUG}}.profiles(stripe_customer_id);

-- =============================================================================
-- TABLE : consents (RGPD audit trail)
-- =============================================================================
CREATE TABLE IF NOT EXISTS {{SLUG}}.consents (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES {{SLUG}}.profiles(id) ON DELETE CASCADE,
  consent_type  TEXT NOT NULL CHECK (consent_type IN (
    'ai_personalization','community_visibility','marketing_email','analytics_cookies'
  )),
  granted       BOOLEAN NOT NULL,
  granted_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at    TIMESTAMPTZ,
  source        TEXT NOT NULL DEFAULT 'onboarding' CHECK (source IN ('onboarding','settings','rgpd_request')),
  ip_address    INET,
  user_agent    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_consents_user_type ON {{SLUG}}.consents(user_id, consent_type, granted_at DESC);

-- =============================================================================
-- TABLE : subscriptions (1 ligne par abonnement Stripe)
-- =============================================================================
CREATE TABLE IF NOT EXISTS {{SLUG}}.subscriptions (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID NOT NULL REFERENCES {{SLUG}}.profiles(id) ON DELETE CASCADE,
  stripe_subscription_id  TEXT UNIQUE NOT NULL,
  stripe_customer_id      TEXT NOT NULL,
  plan                    TEXT NOT NULL CHECK (plan IN ('standard','premium')),
  status                  TEXT NOT NULL,  -- trialing, active, past_due, canceled, etc.
  trial_end               TIMESTAMPTZ,
  current_period_start    TIMESTAMPTZ NOT NULL,
  current_period_end      TIMESTAMPTZ NOT NULL,
  cancel_at_period_end    BOOLEAN NOT NULL DEFAULT false,
  canceled_at             TIMESTAMPTZ,
  metadata                JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON {{SLUG}}.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON {{SLUG}}.subscriptions(status);

-- =============================================================================
-- TABLE : payments + invoices
-- =============================================================================
CREATE TABLE IF NOT EXISTS {{SLUG}}.payments (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  UUID NOT NULL REFERENCES {{SLUG}}.profiles(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_invoice_id        TEXT UNIQUE,
  amount_cents             INTEGER NOT NULL,
  currency                 TEXT NOT NULL DEFAULT 'eur',
  status                   TEXT NOT NULL CHECK (status IN ('pending','succeeded','failed','refunded')),
  plan                     TEXT,
  metadata                 JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_payments_user ON {{SLUG}}.payments(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS {{SLUG}}.invoices (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id      UUID NOT NULL REFERENCES {{SLUG}}.payments(id) ON DELETE CASCADE,
  invoice_number  TEXT UNIQUE NOT NULL,
  pdf_url         TEXT,
  issued_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  legal_mention   TEXT NOT NULL DEFAULT 'TVA non applicable, art. 293B du CGI'
);

-- Idempotence webhooks Stripe
CREATE TABLE IF NOT EXISTS {{SLUG}}.stripe_events (
  event_id    TEXT PRIMARY KEY,
  event_type  TEXT NOT NULL,
  payload     JSONB NOT NULL,
  status      TEXT NOT NULL DEFAULT 'processed' CHECK (status IN ('processed','failed','skipped')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================================
-- TABLE : referrals + commissions (parrainage V4 — 50% premier paiement)
-- =============================================================================
CREATE TABLE IF NOT EXISTS {{SLUG}}.referrals (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_user_id  UUID NOT NULL REFERENCES {{SLUG}}.profiles(id) ON DELETE CASCADE,
  referred_user_id  UUID NOT NULL REFERENCES {{SLUG}}.profiles(id) ON DELETE CASCADE,
  status            TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','converted','expired')),
  converted_at      TIMESTAMPTZ,
  level             INTEGER NOT NULL DEFAULT 1 CHECK (level IN (1,2)),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(referrer_user_id, referred_user_id)
);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON {{SLUG}}.referrals(referrer_user_id);

CREATE TABLE IF NOT EXISTS {{SLUG}}.commissions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_id   UUID NOT NULL REFERENCES {{SLUG}}.referrals(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES {{SLUG}}.profiles(id) ON DELETE CASCADE,
  amount_cents  INTEGER NOT NULL,
  currency      TEXT NOT NULL DEFAULT 'eur',
  type          TEXT NOT NULL CHECK (type IN ('subscription_first','subscription_recurring','milestone')),
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','cancelled')),
  paid_at       TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_commissions_user ON {{SLUG}}.commissions(user_id, status);

-- =============================================================================
-- TABLE : wallets + wallet_transactions + withdrawals
-- =============================================================================
CREATE TABLE IF NOT EXISTS {{SLUG}}.wallets (
  user_id            UUID PRIMARY KEY REFERENCES {{SLUG}}.profiles(id) ON DELETE CASCADE,
  points_balance     INTEGER NOT NULL DEFAULT 0,
  cash_balance_cents INTEGER NOT NULL DEFAULT 0,
  total_earned_cents INTEGER NOT NULL DEFAULT 0,
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS {{SLUG}}.wallet_transactions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES {{SLUG}}.profiles(id) ON DELETE CASCADE,
  type        TEXT NOT NULL CHECK (type IN ('credit_points','debit_points','credit_cash','debit_cash','withdraw','refund')),
  amount      INTEGER NOT NULL,
  currency    TEXT NOT NULL DEFAULT 'points' CHECK (currency IN ('points','eur')),
  reason      TEXT,
  metadata    JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_user ON {{SLUG}}.wallet_transactions(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS {{SLUG}}.withdrawals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES {{SLUG}}.profiles(id) ON DELETE CASCADE,
  amount_cents    INTEGER NOT NULL CHECK (amount_cents >= 500),
  iban_encrypted  TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','completed','failed')),
  requested_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at    TIMESTAMPTZ
);

-- =============================================================================
-- TABLE : KARMA pools (CLAUDE.md §35.1 — split 50/10/40)
-- =============================================================================
DO $$ BEGIN
  CREATE TYPE {{SLUG}}.pool_type_enum AS ENUM ('users','asso','sasu');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS {{SLUG}}.karma_pools (
  pool_type        {{SLUG}}.pool_type_enum PRIMARY KEY,
  balance_cents    BIGINT NOT NULL DEFAULT 0 CHECK (balance_cents >= 0),
  total_in_cents   BIGINT NOT NULL DEFAULT 0,
  total_out_cents  BIGINT NOT NULL DEFAULT 0,
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO {{SLUG}}.karma_pools (pool_type) VALUES ('users'), ('asso'), ('sasu')
  ON CONFLICT (pool_type) DO NOTHING;

CREATE TABLE IF NOT EXISTS {{SLUG}}.pool_transactions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_type       {{SLUG}}.pool_type_enum NOT NULL,
  amount_cents    INTEGER NOT NULL CHECK (amount_cents > 0),
  direction       TEXT NOT NULL CHECK (direction IN ('in','out')),
  reason          TEXT NOT NULL CHECK (reason IN (
    'ca_split','aide_deposit','contest_payout','lottery_payout','mission_payout','asso_transfer','partner_deposit'
  )),
  ref_payment_id  UUID REFERENCES {{SLUG}}.payments(id) ON DELETE SET NULL,
  ref_user_id     UUID REFERENCES {{SLUG}}.profiles(id) ON DELETE SET NULL,
  source_label    TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_pool_tx_payment ON {{SLUG}}.pool_transactions(ref_payment_id);
CREATE INDEX IF NOT EXISTS idx_pool_tx_pool_date ON {{SLUG}}.pool_transactions(pool_type, created_at DESC);

-- RPC pour crédit atomique d'un pool (utilisé par lib/karma.ts)
CREATE OR REPLACE FUNCTION {{SLUG}}.karma_credit_pool(p_pool_type {{SLUG}}.pool_type_enum, p_amount_cents BIGINT)
RETURNS VOID AS $$
BEGIN
  UPDATE {{SLUG}}.karma_pools
  SET balance_cents = balance_cents + p_amount_cents,
      total_in_cents = total_in_cents + p_amount_cents,
      updated_at = now()
  WHERE pool_type = p_pool_type;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION {{SLUG}}.karma_debit_pool(p_pool_type {{SLUG}}.pool_type_enum, p_amount_cents BIGINT)
RETURNS VOID AS $$
BEGIN
  UPDATE {{SLUG}}.karma_pools
  SET balance_cents = balance_cents - p_amount_cents,
      total_out_cents = total_out_cents + p_amount_cents,
      updated_at = now()
  WHERE pool_type = p_pool_type AND balance_cents >= p_amount_cents;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pool % insuffisant pour débit de %', p_pool_type, p_amount_cents;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- TABLE : conversations + messages (IA générique)
-- =============================================================================
CREATE TABLE IF NOT EXISTS {{SLUG}}.conversations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES {{SLUG}}.profiles(id) ON DELETE CASCADE,
  title       TEXT,
  context     TEXT NOT NULL DEFAULT 'main',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_conversations_user ON {{SLUG}}.conversations(user_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS {{SLUG}}.messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES {{SLUG}}.conversations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES {{SLUG}}.profiles(id) ON DELETE CASCADE,
  role            TEXT NOT NULL CHECK (role IN ('user','assistant','system')),
  content         TEXT NOT NULL,
  model_used      TEXT,
  tokens_input    INTEGER,
  tokens_output   INTEGER,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON {{SLUG}}.messages(conversation_id, created_at);

-- =============================================================================
-- TABLE : push_tokens (mobile)
-- =============================================================================
CREATE TABLE IF NOT EXISTS {{SLUG}}.push_tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES {{SLUG}}.profiles(id) ON DELETE CASCADE,
  token       TEXT UNIQUE NOT NULL,
  platform    TEXT NOT NULL CHECK (platform IN ('ios','android','web')),
  enabled     BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_push_tokens_user ON {{SLUG}}.push_tokens(user_id);

-- =============================================================================
-- TABLE : account_deletion_requests (RGPD art. 17)
-- =============================================================================
CREATE TABLE IF NOT EXISTS {{SLUG}}.account_deletion_requests (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID UNIQUE NOT NULL REFERENCES {{SLUG}}.profiles(id) ON DELETE CASCADE,
  requested_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  scheduled_for  TIMESTAMPTZ NOT NULL,
  reason         TEXT,
  status         TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','executing','completed','cancelled')),
  cancelled_at   TIMESTAMPTZ,
  completed_at   TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_deletion_status ON {{SLUG}}.account_deletion_requests(status, scheduled_for);

-- =============================================================================
-- TRIGGERS : auto-create profile + wallet à l'inscription auth.users
-- =============================================================================
CREATE OR REPLACE FUNCTION {{SLUG}}.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO {{SLUG}}.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO {{SLUG}}.wallets (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_{{SLUG}} ON auth.users;
CREATE TRIGGER on_auth_user_created_{{SLUG}}
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION {{SLUG}}.handle_new_user();

-- Trigger updated_at
CREATE OR REPLACE FUNCTION {{SLUG}}.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON {{SLUG}}.profiles
    FOR EACH ROW EXECUTE FUNCTION {{SLUG}}.set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER subscriptions_updated_at BEFORE UPDATE ON {{SLUG}}.subscriptions
    FOR EACH ROW EXECUTE FUNCTION {{SLUG}}.set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER conversations_updated_at BEFORE UPDATE ON {{SLUG}}.conversations
    FOR EACH ROW EXECUTE FUNCTION {{SLUG}}.set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =============================================================================
-- RLS — Row Level Security (bloquer accès cross-user)
-- =============================================================================
ALTER TABLE {{SLUG}}.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE {{SLUG}}.consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE {{SLUG}}.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE {{SLUG}}.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE {{SLUG}}.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE {{SLUG}}.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE {{SLUG}}.commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE {{SLUG}}.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE {{SLUG}}.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE {{SLUG}}.withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE {{SLUG}}.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE {{SLUG}}.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE {{SLUG}}.push_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE {{SLUG}}.account_deletion_requests ENABLE ROW LEVEL SECURITY;
-- karma_pools + pool_transactions = lecture publique anon (transparence), écriture service_role only
ALTER TABLE {{SLUG}}.karma_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE {{SLUG}}.pool_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE {{SLUG}}.stripe_events ENABLE ROW LEVEL SECURITY;

-- Helper macro : "owner reads + writes own row"
DO $$ BEGIN
  CREATE POLICY "own_profile_select" ON {{SLUG}}.profiles FOR SELECT USING (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "own_profile_update" ON {{SLUG}}.profiles FOR UPDATE USING (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "own_consents_all" ON {{SLUG}}.consents FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "own_subscriptions_select" ON {{SLUG}}.subscriptions FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "own_payments_select" ON {{SLUG}}.payments FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "own_invoices_select" ON {{SLUG}}.invoices FOR SELECT
    USING (EXISTS (SELECT 1 FROM {{SLUG}}.payments p WHERE p.id = payment_id AND p.user_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "own_referrals_select" ON {{SLUG}}.referrals FOR SELECT
    USING (auth.uid() IN (referrer_user_id, referred_user_id));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "own_commissions_select" ON {{SLUG}}.commissions FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "own_wallet_select" ON {{SLUG}}.wallets FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "own_wallet_tx_select" ON {{SLUG}}.wallet_transactions FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "own_withdrawals_all" ON {{SLUG}}.withdrawals FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "own_conversations_all" ON {{SLUG}}.conversations FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "own_messages_all" ON {{SLUG}}.messages FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "own_push_tokens_all" ON {{SLUG}}.push_tokens FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "own_deletion_requests_all" ON {{SLUG}}.account_deletion_requests FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- KARMA pools : lecture publique (transparence), écriture service_role uniquement
DO $$ BEGIN
  CREATE POLICY "karma_pools_public_read" ON {{SLUG}}.karma_pools FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "pool_transactions_public_read" ON {{SLUG}}.pool_transactions FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- stripe_events : service_role only (pas de policy = bloqué pour anon/authenticated)

-- =============================================================================
-- SEED : super admin (matiss.frasne@gmail.com)
-- (Le profile sera créé par le trigger handle_new_user au signup. Cette UPDATE
--  s'applique si le compte existe déjà.)
-- =============================================================================
UPDATE {{SLUG}}.profiles
SET role = 'super_admin', plan = 'premium'
WHERE email = 'matiss.frasne@gmail.com';

-- =============================================================================
-- DONE.
-- =============================================================================
