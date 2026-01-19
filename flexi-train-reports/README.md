# Flexi-Train (Gestão de Carga/Musculação)

Sistema pessoal para planejamento, registro e análise de treinos de força, com foco em UX de Dashboard/Relatórios e integração de envio de treinos via WhatsApp. Sem autenticação/login.

## 1. Descrição do Aplicativo

- Objetivo principal:
  - Centralizar o gerenciamento de treinos de força, permitindo transformar descrições textuais em dados estruturados, registrar, revisar e enviar treinos para alunos de forma rápida.

- Funcionalidades principais (em produção):
  - Parser de Treinos (Texto → Dados) com montagem de exercícios/sets e cálculo de totais (séries/volume).
  - Gestão de Alunos (CRUD), incluindo prioridade de envio por WhatsApp e integridade entre alunos e treinos.
  - Histórico de Treinos com edição, exclusão e reutilização (copiar treino para novo dia).
  - Relatórios de Performance com métricas e gráficos agregados.
  - Envio de treinos via WhatsApp (Evolution API) com QR Code de conexão e seleção automática do número alvo (whatsapp > telefone).
  - Indicador de Conexão ao Supabase (ConnectionStatus) e modo offline gracioso para evitar travamentos.

- Tecnologias utilizadas (principais versões):
  - Vite ^5.4.19, React ^18.3.1, TypeScript ^5.8.3
  - Tailwind CSS ^3.4.17 + shadcn-ui
  - TanStack Query ^5.83.0
  - React Hook Form ^7.61.1 + Zod ^3.25.76
  - Supabase JS ^2.57.4

- Público-alvo:
  - Uso pessoal por Personal Trainer & Dev Student, sem autenticação.

## 2. Instruções de Execução

- Requisitos do sistema:
  - Node.js >= 18 (recomendado 20 LTS)
  - npm (ou pnpm/yarn)
  - Opcional para WhatsApp: Docker instalado e Evolution API disponível

- Configuração do ambiente:
  - Crie um arquivo `.env` na raiz do projeto com:
    - `VITE_SUPABASE_URL=<sua_url_supabase>`
    - `VITE_SUPABASE_ANON_KEY=<sua_anon_key>` ou `VITE_SUPABASE_PUBLISHABLE_KEY=<sua_publishable_key>`
  - Observação: o cliente se adapta caso `ANON_KEY` não exista, usando `PUBLISHABLE_KEY` automaticamente.
  - Para WhatsApp (Evolution API via Docker, porta sugerida 8082):
    - Suba o servidor Evolution API localmente (documentação oficial) e mantenha acessível em `http://localhost:8082/`.

- Execução local:
  ```bash
  npm install
  npm run dev
  ```
  - O Vite escolherá uma porta disponível (ex.: http://localhost:8083/).

- Comandos relevantes:
  - `npm run dev` — inicia o servidor de desenvolvimento.
  - `npm run build` — geração de build de produção.
  - `npm run lint` — análise de qualidade (ESLint).
  - `npm run preview` — preview do build.

## 3. Estrutura do Projeto

- Organização de diretórios (principais):
  - `src/components/` — componentes de página e UI (Dashboard, Students, Parser, History, Reports, Settings, etc.).
  - `src/services/` — serviços de dados: `apiAlunos.ts`, `apiWorkouts.ts`, `apiWhatsapp.ts`.
  - `src/integrations/supabase/` — `client.ts` e `types` tipados do banco.
  - `src/hooks/` — hooks como `useMetrics.ts`.
  - `src/lib/` — utilitários.

- Arquivos importantes:
  - `src/App.tsx` — roteamento, providers e layout principal.
  - `src/components/ConnectionStatus.tsx` — verificação periódica de conexão ao Supabase e modo offline.
  - `src/components/WorkoutParser.tsx` — parser de texto e montagem do treino.
  - `src/components/WorkoutHistory.tsx` — histórico com edição/remoção/reutilização.
  - `src/components/WorkoutReports.tsx` — métricas e relatórios.
  - `src/components/Settings.tsx` — conexão WhatsApp (Evolution API, QR Code).
  - `src/services/apiAlunos.ts` e `src/services/apiWorkouts.ts` — CRUD e consultas com integridade.

- Fluxo principal (arquitetura):
  - UI utiliza TanStack Query para buscar/atualizar dados via services (Supabase).
  - Parser recebe texto, estrutura dados (exercícios/sets), calcula totais e salva no Supabase.
  - Envio WhatsApp cria instância e conecta via Evolution API (QR), gera e envia a mensagem/imagem do treino.
  - ConnectionStatus marca estado offline em localStorage para os services evitarem chamadas quando a rede/URL está indisponível.

## 4. Funcionalidades Implementadas

- Parser de Treinos
  - Operação: leitura de texto, extração de exercícios e sets, ordenação e totais. Pronto para salvar e enviar.

- Gestão de Alunos
  - Operação: cadastro/edição/exclusão; prioridade de envio via `whatsapp` (fallback para `telefone`).
  - Integridade: exclusões consideram dependências de treinos/exercícios/sets.

- Histórico de Treinos
  - Operação: listagem, filtro por aluno, edição/remoção; reutilização de treino para novo dia.

- Relatórios de Performance
  - Operação: métricas agregadas, gráficos e período selecionável.

- Envio via WhatsApp (Evolution API)
  - Operação: criação de instância, conexão via QR Code e envio de treino para o número alvo.
  - Visual: indicador acima do botão “Enviar WhatsApp” mostrando exatamente o destino.

## 5. Informações Adicionais

- Status atual:
  - Em desenvolvimento ativo; todas as features acima estão presentes e operacionais em ambiente local.

- Roadmap (confirmado):
  - Melhoria de UX/UI no Dashboard e Relatórios.
  - Correção de bugs visuais (avatars/fotos, gráficos).
  - Otimização da exibição de dados existentes.
  - Restrições: sem módulos de cardio/fisiologia; sem autenticação/login.

- Contato (suporte técnico):
  - Projeto de uso pessoal. Para manutenção/suporte, consulte o responsável pelo repositório.
