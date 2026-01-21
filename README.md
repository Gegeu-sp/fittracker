# 🏋️‍♂️ Flexi-Train (Gestão de Carga/Musculação)

![Status](https://img.shields.io/badge/Status-Em_Desenvolvimento-yellow?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.3.1-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-v2-3ECF8E?style=for-the-badge&logo=supabase)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)

> **Sistema pessoal para planejamento, registro e análise de treinos de força, com foco em UX de Dashboard/Relatórios e integração de envio de treinos via WhatsApp.**  
> *Sem autenticação/login.*

---

## 1. 📝 Descrição do Aplicativo

### Objetivo Principal
- **Centralizar o gerenciamento de treinos de força**, permitindo transformar descrições textuais em dados estruturados, registrar, revisar e enviar treinos para alunos de forma rápida.

### Funcionalidades Principais (Em Produção)
- ⚡ **Parser de Treinos (Texto → Dados):** Com montagem de exercícios/sets e cálculo de totais (séries/volume).
- 👥 **Gestão de Alunos (CRUD):** Incluindo prioridade de envio por WhatsApp e integridade entre alunos e treinos.
- 🔄 **Histórico de Treinos:** Com edição, exclusão e reutilização (copiar treino para novo dia).
- 📊 **Relatórios de Performance:** Com métricas e gráficos agregados.
- 📱 **Envio de treinos via WhatsApp (Evolution API):** Com QR Code de conexão e seleção automática do número alvo (whatsapp > telefone).
- 🛡️ **Indicador de Conexão ao Supabase (`ConnectionStatus`):** E modo offline gracioso para evitar travamentos.

### Tecnologias Utilizadas

| Categoria      | Versões Principais                          |
|----------------|---------------------------------------------|
| **Core**       | Vite ^5.4.19, React ^18.3.1, TypeScript ^5.8.3 |
| **Estilo**     | Tailwind CSS ^3.4.17 + shadcn-ui            |
| **Dados**      | TanStack Query ^5.83.0, Supabase JS ^2.57.4 |
| **Forms**      | React Hook Form ^7.61.1 + Zod ^3.25.76      |

### Público-alvo
- Uso pessoal por **Personal Trainer & Dev Student**, sem autenticação.

---

## 2. ⚙️ Instruções de Execução

### Requisitos do Sistema
- **Node.js**: >= 18 (recomendado 20 LTS)
- **npm** (ou pnpm/yarn)
- *(Opcional para WhatsApp)*: Docker instalado e Evolution API disponível

### Configuração do Ambiente
1. Crie um arquivo `.env` na raiz do projeto com:
   ```env
   VITE_SUPABASE_URL=<sua_url_supabase>
   VITE_SUPABASE_ANON_KEY=<sua_anon_key>
   # ou VITE_SUPABASE_PUBLISHABLE_KEY=<sua_publishable_key>

   > **Observação:** O cliente se adapta caso `ANON_KEY` não exista, usando `PUBLISHABLE_KEY` automaticamente.

### Para WhatsApp (Evolution API via Docker, porta sugerida 8082):
- Suba o servidor Evolution API localmente (documentação oficial) e mantenha acessível em `http://localhost:8082/`.

### Execução Local
```bash
npm install
npm run dev

### Comandos Relevantes
- `npm run dev` — Inicia o servidor de desenvolvimento.
- `npm run build` — Geração de build de produção.
- `npm run lint` — Análise de qualidade (ESLint).
- `npm run preview` — Preview do build.

```
---

### 3. 📂 Estrutura do Projeto

### Organização de Diretórios (Principais)
- `src/components/` — Componentes de página e UI (Dashboard, Students, Parser, History, Reports, Settings, etc.).
- `src/services/` — Serviços de dados: `apiAlunos.ts`, `apiWorkouts.ts`, `apiWhatsapp.ts`.
- `src/integrations/supabase/` — `client.ts` e types tipados do banco.
- `src/hooks/` — Hooks como `useMetrics.ts`.
- `src/lib/` — Utilitários.

### Arquivos Importantes
- `src/App.tsx` — Roteamento, providers e layout principal.
- `src/components/ConnectionStatus.tsx` — Verificação periódica de conexão ao Supabase e modo offline.
- `src/components/WorkoutParser.tsx` — Parser de texto e montagem do treino.
- `src/components/WorkoutHistory.tsx` — Histórico com edição/remoção/reutilização.
- `src/components/WorkoutReports.tsx` — Métricas e relatórios.
- `src/components/Settings.tsx` — Conexão WhatsApp (Evolution API, QR Code).
- `src/services/apiAlunos.ts` e `src/services/apiWorkouts.ts` — CRUD e consultas com integridade.

### Fluxo Principal (Arquitetura)
- UI utiliza **TanStack Query** para buscar/atualizar dados via services (Supabase).
- Parser recebe texto, estrutura dados (exercícios/sets), calcula totais e salva no Supabase.
- Envio WhatsApp cria instância e conecta via Evolution API (QR), gera e envia a mensagem/imagem do treino.
- `ConnectionStatus` marca estado offline em `localStorage` para os services evitarem chamadas quando a rede/URL está indisponível.

---

## 4. ✨ Funcionalidades Implementadas

### Parser de Treinos
- **Operação:** Leitura de texto, extração de exercícios e sets, ordenação e totais. Pronto para salvar e enviar.

### Gestão de Alunos
- **Operação:** Cadastro/edição/exclusão; prioridade de envio via WhatsApp (fallback para telefone).
- **Integridade:** Exclusões consideram dependências de treinos/exercícios/sets.

### Histórico de Treinos
- **Operação:** Listagem, filtro por aluno, edição/remoção; reutilização de treino para novo dia.

### Relatórios de Performance
- **Operação:** Métricas agregadas, gráficos e período selecionável.

### Envio via WhatsApp (Evolution API)
- **Operação:** Criação de instância, conexão via QR Code e envio de treino para o número alvo.
- **Visual:** Indicador acima do botão “Enviar WhatsApp” mostrando exatamente o destino.

---

## 5. 🔒 Segurança e Boas Práticas

Este projeto segue rigorosos padrões de segurança para proteger o código e os dados.

### Configuração de Acesso
- **Permissões:** O acesso ao repositório é restrito e gerenciado com base no princípio do menor privilégio.
- **2FA:** A autenticação de dois fatores (2FA) é obrigatória para todos os colaboradores e administradores da organização no GitHub.
- **Recuperação:** Configure métodos de recuperação seguros (códigos de backup) nas configurações da sua conta GitHub.

### Gestão de Segredos
- **GitHub Secrets:** Nenhuma credencial (chaves de API, senhas de banco) deve ser commitada no código. Utilize o GitHub Secrets para armazenar variáveis sensíveis usadas em CI/CD.
- **Rotação:** Recomenda-se a rotação periódica das chaves de acesso do Supabase e tokens de API.

### Code Review e Qualidade
- **Branch Protection:** A branch `main` é protegida. Alterações diretas são bloqueadas; é necessário criar um Pull Request (PR).

#### Checklist de Revisão:
- [ ] O código segue o estilo do projeto?
- [ ] Não há credenciais expostas?
- [ ] Funcionalidades críticas foram testadas?
- [ ] Nenhuma dependência insegura foi introduzida?

### Ferramentas Automatizadas
- **Dependabot:** Configurado para verificar atualizações de dependências semanalmente.
- **CodeQL:** Análise estática de segurança configurada via GitHub Actions.

> Para reportar vulnerabilidades, consulte o arquivo `SECURITY.md`.

---

## 6. ℹ️ Informações Adicionais

- **Status atual:** Em desenvolvimento ativo; todas as features acima estão presentes e operacionais em ambiente local.
- **Roadmap (confirmado):**
  - Melhoria de UX/UI no Dashboard e Relatórios.
  - Correção de bugs visuais (avatars/fotos, gráficos).
  - Otimização da exibição de dados existentes.
- **Restrições:** sem módulos de cardio/fisiologia; sem autenticação/login.
- **Contato (suporte técnico):** Projeto de uso pessoal. Para manutenção/suporte, consulte o responsável pelo repositório.

<div align="center">

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Gegeu-sp)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](www.linkedin.com/in/argeu-rodrigues-9a6b7174)

**Projeto desenvolvido por Argeu Rodrigues**  
🎓 3º semestre de ADS na Faculdade Anhembi Morumbi  
🏋️‍♂️ Personal Trainer | CREF: 158814-G/SP

</div>
