-- Vizinho PB - Schema do Banco de Dados
-- Execute este script no SQL Editor do Supabase

-- =====================================================
-- ENUMS
-- =====================================================

CREATE TYPE user_role AS ENUM ('user', 'moderator', 'admin');
CREATE TYPE request_status AS ENUM ('open', 'negotiating', 'in_progress', 'completed', 'cancelled', 'expired');
CREATE TYPE urgency AS ENUM ('low', 'medium', 'high');
CREATE TYPE offer_status AS ENUM ('pending', 'accepted', 'rejected', 'borrowed', 'returned', 'cancelled');
CREATE TYPE review_type AS ENUM ('requester_to_helper', 'helper_to_requester');
CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected');

-- =====================================================
-- TABELAS
-- =====================================================

-- Usuários (perfil público)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  avatar_url TEXT,
  bio TEXT,
  neighborhood TEXT,
  city TEXT DEFAULT 'João Pessoa',
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  rating_as_requester DOUBLE PRECISION DEFAULT 0,
  rating_as_helper DOUBLE PRECISION DEFAULT 0,
  total_requests INTEGER DEFAULT 0,
  total_helps INTEGER DEFAULT 0,
  role user_role DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pedidos de empréstimo
CREATE TABLE requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  urgency urgency DEFAULT 'medium',
  status request_status DEFAULT 'open',
  needed_until DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  closed_at TIMESTAMPTZ
);

-- Imagens dos pedidos
CREATE TABLE request_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  "order" INTEGER DEFAULT 0
);

-- Ofertas de ajuda
CREATE TABLE offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  helper_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT,
  status offer_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  borrowed_at TIMESTAMPTZ,
  returned_at TIMESTAMPTZ
);

-- Avaliações
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id UUID NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reviewed_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  review_type review_type NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversas
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  helper_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(request_id, requester_id, helper_id)
);

-- Mensagens
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notificações
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  data JSONB,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categorias de empresas
CREATE TABLE business_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  "order" INTEGER DEFAULT 0
);

-- Empresas
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES business_categories(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  approved_by UUID REFERENCES users(id),
  name TEXT NOT NULL,
  description TEXT,
  phone TEXT,
  whatsapp TEXT,
  email TEXT,
  address TEXT,
  neighborhood TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  logo_url TEXT,
  cover_url TEXT,
  working_hours TEXT,
  approval_status approval_status DEFAULT 'pending',
  rejection_reason TEXT,
  verified BOOLEAN DEFAULT FALSE,
  rating DOUBLE PRECISION DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ
);

-- Avaliações de empresas
CREATE TABLE business_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(business_id, user_id)
);

-- =====================================================
-- ÍNDICES
-- =====================================================

CREATE INDEX idx_requests_user ON requests(user_id);
CREATE INDEX idx_requests_status ON requests(status);
CREATE INDEX idx_requests_category ON requests(category);
CREATE INDEX idx_requests_created ON requests(created_at DESC);

CREATE INDEX idx_offers_request ON offers(request_id);
CREATE INDEX idx_offers_helper ON offers(helper_id);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, read);

CREATE INDEX idx_businesses_category ON businesses(category_id);
CREATE INDEX idx_businesses_approval ON businesses(approval_status);
CREATE INDEX idx_businesses_neighborhood ON businesses(neighborhood);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_reviews ENABLE ROW LEVEL SECURITY;

-- Políticas para USERS
CREATE POLICY "Users are viewable by everyone" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas para REQUESTS
CREATE POLICY "Requests are viewable by everyone" ON requests FOR SELECT USING (true);
CREATE POLICY "Users can create requests" ON requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own requests" ON requests FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own requests" ON requests FOR DELETE USING (auth.uid() = user_id);

-- Políticas para REQUEST_IMAGES
CREATE POLICY "Request images are viewable by everyone" ON request_images FOR SELECT USING (true);
CREATE POLICY "Users can manage own request images" ON request_images FOR ALL USING (
  EXISTS (SELECT 1 FROM requests WHERE requests.id = request_images.request_id AND requests.user_id = auth.uid())
);

-- Políticas para OFFERS
CREATE POLICY "Offers are viewable by involved users" ON offers FOR SELECT USING (
  auth.uid() = helper_id OR 
  EXISTS (SELECT 1 FROM requests WHERE requests.id = offers.request_id AND requests.user_id = auth.uid())
);
CREATE POLICY "Users can create offers" ON offers FOR INSERT WITH CHECK (auth.uid() = helper_id);
CREATE POLICY "Helpers can update own offers" ON offers FOR UPDATE USING (auth.uid() = helper_id);
CREATE POLICY "Request owners can update offers" ON offers FOR UPDATE USING (
  EXISTS (SELECT 1 FROM requests WHERE requests.id = offers.request_id AND requests.user_id = auth.uid())
);

-- Políticas para REVIEWS
CREATE POLICY "Reviews are viewable by everyone" ON reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- Políticas para CONVERSATIONS
CREATE POLICY "Users can view own conversations" ON conversations FOR SELECT USING (
  auth.uid() = requester_id OR auth.uid() = helper_id
);
CREATE POLICY "Users can create conversations" ON conversations FOR INSERT WITH CHECK (
  auth.uid() = requester_id OR auth.uid() = helper_id
);

-- Políticas para MESSAGES
CREATE POLICY "Users can view messages in own conversations" ON messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM conversations WHERE conversations.id = messages.conversation_id AND (conversations.requester_id = auth.uid() OR conversations.helper_id = auth.uid()))
);
CREATE POLICY "Users can send messages" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can update own messages" ON messages FOR UPDATE USING (
  EXISTS (SELECT 1 FROM conversations WHERE conversations.id = messages.conversation_id AND (conversations.requester_id = auth.uid() OR conversations.helper_id = auth.uid()))
);

-- Políticas para NOTIFICATIONS
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para BUSINESS_CATEGORIES
CREATE POLICY "Business categories are viewable by everyone" ON business_categories FOR SELECT USING (true);
CREATE POLICY "Only admins can manage categories" ON business_categories FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);

-- Políticas para BUSINESSES
CREATE POLICY "Approved businesses are viewable by everyone" ON businesses FOR SELECT USING (
  approval_status = 'approved' OR
  created_by = auth.uid() OR
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'moderator'))
);
CREATE POLICY "Admins can create businesses" ON businesses FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);
CREATE POLICY "Admins can update businesses" ON businesses FOR UPDATE USING (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);
CREATE POLICY "Moderators can approve businesses" ON businesses FOR UPDATE USING (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'moderator'))
);
CREATE POLICY "Admins can delete businesses" ON businesses FOR DELETE USING (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);

-- Políticas para BUSINESS_REVIEWS
CREATE POLICY "Business reviews are viewable by everyone" ON business_reviews FOR SELECT USING (true);
CREATE POLICY "Users can create business reviews" ON business_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own business reviews" ON business_reviews FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger para criar perfil de usuário após signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_requests_updated_at
  BEFORE UPDATE ON requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_businesses_updated_at
  BEFORE UPDATE ON businesses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- DADOS INICIAIS
-- =====================================================

-- Categorias de empresas
INSERT INTO business_categories (name, icon, slug, "order") VALUES
  ('Manutenção/Reparos', '🔧', 'manutencao', 1),
  ('Eletricista', '🔌', 'eletricista', 2),
  ('Encanador', '🚿', 'encanador', 3),
  ('Limpeza', '🧹', 'limpeza', 4),
  ('Pintor', '🎨', 'pintor', 5),
  ('Pedreiro', '🏗️', 'pedreiro', 6),
  ('Mecânico', '🚗', 'mecanico', 7),
  ('Pet/Veterinário', '🐕', 'pet', 8),
  ('Alimentação', '🍕', 'alimentacao', 9),
  ('Beleza/Estética', '💇', 'beleza', 10),
  ('Outros', '📦', 'outros', 99);

-- =====================================================
-- REALTIME
-- =====================================================

-- Habilitar realtime para mensagens e notificações
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
