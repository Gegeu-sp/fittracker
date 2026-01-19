-- Script de Configuração do Storage para Avatares
-- Rodar no Editor SQL do Supabase

-- 1. Criação do bucket 'avatars' (se não existir, o Supabase ignora ou dá erro, mas o foco é garantir que existe)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Remover policies antigas para evitar conflitos (opcional, mas recomendado para limpeza)
DROP POLICY IF EXISTS "Avatars são públicos para visualização" ON storage.objects;
DROP POLICY IF EXISTS "Qualquer um pode fazer upload de avatares" ON storage.objects;
DROP POLICY IF EXISTS "Qualquer um pode atualizar avatares" ON storage.objects;

-- 3. Policy: SELECT (Leitura Pública)
CREATE POLICY "Avatars são públicos para visualização"
ON storage.objects FOR SELECT
USING ( bucket_id = 'avatars' );

-- 4. Policy: INSERT (Upload Público - Idealmente deveria ser autenticado, mas conforme regras do projeto sem login...)
CREATE POLICY "Qualquer um pode fazer upload de avatares"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'avatars' );

-- 5. Policy: UPDATE (Atualização Pública)
CREATE POLICY "Qualquer um pode atualizar avatares"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'avatars' );

-- 6. Policy: DELETE (Opcional, se quiser permitir que deletem)
CREATE POLICY "Qualquer um pode deletar avatares"
ON storage.objects FOR DELETE
USING ( bucket_id = 'avatars' );
