-- Gamificação - Vizinho PB
-- Execute este script no SQL Editor do Supabase APÓS o schema.sql principal

-- =====================================================
-- ADICIONAR CAMPOS NA TABELA USERS
-- =====================================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;

-- =====================================================
-- TABELA DE BADGES (DEFINIÇÃO)
-- =====================================================

CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL,
  category TEXT DEFAULT 'geral',
  points_required INTEGER DEFAULT 0,
  condition_type TEXT, -- 'points', 'requests', 'helps', 'reviews', 'first_action'
  condition_value INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABELA DE BADGES DO USUÁRIO
-- =====================================================

CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- =====================================================
-- ÍNDICES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_users_points ON users(points DESC);
CREATE INDEX IF NOT EXISTS idx_users_level ON users(level);

-- =====================================================
-- RLS
-- =====================================================

ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Badges são públicos
CREATE POLICY "Badges are viewable by everyone" ON badges FOR SELECT USING (true);

-- User badges são públicos (para exibir no perfil)
CREATE POLICY "User badges are viewable by everyone" ON user_badges FOR SELECT USING (true);

-- Apenas o sistema pode inserir badges de usuário
CREATE POLICY "System can manage user badges" ON user_badges FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);

-- =====================================================
-- BADGES INICIAIS
-- =====================================================

INSERT INTO badges (slug, name, description, icon, category, condition_type, condition_value) VALUES
  -- Primeiras ações
  ('primeiro_pedido', 'Primeiro Pedido', 'Criou seu primeiro pedido de empréstimo', '🎯', 'inicio', 'first_action', 1),
  ('primeira_ajuda', 'Primeira Ajuda', 'Ofereceu ajuda pela primeira vez', '🤝', 'inicio', 'first_action', 1),
  ('primeira_avaliacao', 'Primeira Avaliação', 'Avaliou alguém pela primeira vez', '⭐', 'inicio', 'first_action', 1),
  
  -- Volume de pedidos
  ('pedido_5', 'Solicitante Ativo', 'Criou 5 pedidos de empréstimo', '📋', 'pedidos', 'requests', 5),
  ('pedido_10', 'Solicitante Frequente', 'Criou 10 pedidos de empréstimo', '📝', 'pedidos', 'requests', 10),
  ('pedido_25', 'Solicitante Expert', 'Criou 25 pedidos de empréstimo', '🏆', 'pedidos', 'requests', 25),
  
  -- Volume de ajudas
  ('ajuda_5', 'Ajudante Iniciante', 'Ajudou 5 vizinhos', '💪', 'ajudas', 'helps', 5),
  ('ajuda_10', 'Ajudante Dedicado', 'Ajudou 10 vizinhos', '🌟', 'ajudas', 'helps', 10),
  ('ajuda_25', 'Super Ajudante', 'Ajudou 25 vizinhos', '🦸', 'ajudas', 'helps', 25),
  ('ajuda_50', 'Lenda da Vizinhança', 'Ajudou 50 vizinhos', '👑', 'ajudas', 'helps', 50),
  
  -- Pontuação
  ('pontos_100', 'Nível Vizinho', 'Alcançou 100 pontos', '🏅', 'nivel', 'points', 100),
  ('pontos_300', 'Super Vizinho', 'Alcançou 300 pontos', '🥈', 'nivel', 'points', 300),
  ('pontos_500', 'Embaixador', 'Alcançou 500 pontos', '🥇', 'nivel', 'points', 500),
  ('pontos_1000', 'Vizinho Lendário', 'Alcançou 1000 pontos', '💎', 'nivel', 'points', 1000),
  
  -- Avaliações
  ('avaliacao_5_estrelas', 'Cinco Estrelas', 'Recebeu uma avaliação 5 estrelas', '⭐⭐⭐⭐⭐', 'avaliacoes', 'reviews', 1),
  ('avaliacoes_10', 'Bem Avaliado', 'Recebeu 10 avaliações positivas', '🌟', 'avaliacoes', 'reviews', 10)
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- FUNÇÃO PARA CALCULAR NÍVEL
-- =====================================================

CREATE OR REPLACE FUNCTION calculate_user_level(user_points INTEGER)
RETURNS INTEGER AS $$
BEGIN
  IF user_points >= 500 THEN
    RETURN 4; -- Embaixador
  ELSIF user_points >= 300 THEN
    RETURN 3; -- Super Vizinho
  ELSIF user_points >= 100 THEN
    RETURN 2; -- Vizinho
  ELSE
    RETURN 1; -- Novato
  END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNÇÃO PARA ADICIONAR PONTOS
-- =====================================================

CREATE OR REPLACE FUNCTION add_user_points(target_user_id UUID, points_to_add INTEGER)
RETURNS void AS $$
DECLARE
  new_points INTEGER;
  new_level INTEGER;
BEGIN
  UPDATE users 
  SET points = points + points_to_add
  WHERE id = target_user_id
  RETURNING points INTO new_points;
  
  -- Calcular novo nível
  new_level := calculate_user_level(new_points);
  
  UPDATE users SET level = new_level WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGER: PONTOS AO CRIAR PEDIDO
-- =====================================================

CREATE OR REPLACE FUNCTION on_request_created()
RETURNS TRIGGER AS $$
BEGIN
  -- Adicionar 10 pontos
  PERFORM add_user_points(NEW.user_id, 10);
  
  -- Atualizar contador
  UPDATE users SET total_requests = total_requests + 1 WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_request_points ON requests;
CREATE TRIGGER trigger_request_points
  AFTER INSERT ON requests
  FOR EACH ROW EXECUTE FUNCTION on_request_created();

-- =====================================================
-- TRIGGER: PONTOS AO AJUDAR (OFERTA ACEITA)
-- =====================================================

CREATE OR REPLACE FUNCTION on_offer_accepted()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    -- Adicionar 15 pontos para quem ajudou
    PERFORM add_user_points(NEW.helper_id, 15);
    
    -- Atualizar contador de ajudas
    UPDATE users SET total_helps = total_helps + 1 WHERE id = NEW.helper_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_offer_accepted ON offers;
CREATE TRIGGER trigger_offer_accepted
  AFTER UPDATE ON offers
  FOR EACH ROW EXECUTE FUNCTION on_offer_accepted();

-- =====================================================
-- TRIGGER: PONTOS AO RECEBER AVALIAÇÃO
-- =====================================================

CREATE OR REPLACE FUNCTION on_review_created()
RETURNS TRIGGER AS $$
DECLARE
  points_to_add INTEGER;
BEGIN
  -- Pontos baseados na nota
  IF NEW.rating = 5 THEN
    points_to_add := 20;
  ELSIF NEW.rating = 4 THEN
    points_to_add := 15;
  ELSIF NEW.rating = 3 THEN
    points_to_add := 10;
  ELSE
    points_to_add := 5;
  END IF;
  
  -- Adicionar pontos para quem foi avaliado
  PERFORM add_user_points(NEW.reviewed_id, points_to_add);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_review_points ON reviews;
CREATE TRIGGER trigger_review_points
  AFTER INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION on_review_created();
