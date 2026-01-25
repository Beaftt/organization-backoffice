# Checklist — Backoffice conectado ao backend

> Objetivo: entregar a base do app (login, boilerplate, temas, i18n, responsivo) conectada ao backend existente.

## 1) Integração com backend (fundação)
- [ ] Definir `NEXT_PUBLIC_API_BASE_URL` no `.env.local` (ex.: `http://localhost:3000`).
- [ ] Criar camada HTTP (client) com:
  - [ ] `Authorization: Bearer <accessToken>`.
  - [ ] `x-workspace-id` quando necessário.
  - [ ] Tratamento do envelope padrão (`statusCode`, `data`, `message`, `message_i18n`).
- [ ] Persistir tokens (`accessToken`, `refreshToken`) em storage seguro.
- [ ] Fluxo de refresh (`POST /auth/refresh`) e logout (`POST /auth/logout`).

## 2) Autenticação (tela inicial)
- [ ] Tela inicial de login (responsiva).
- [ ] Login local: `POST /auth/login`.
- [ ] Registro local: `POST /auth/register`.
- [ ] Login com Google: `POST /auth/google` (idToken).
- [ ] Mensagens de erro e sucesso (PT/EN).

## 3) Boilerplate (layout global)
- [ ] Layout global com menu lateral esquerdo + topo.
- [ ] Topo com:
  - [ ] Nome da página centralizado.
  - [ ] Alternância de tema (dark/light).
  - [ ] Perfil e configurações.
- [ ] Menu lateral:
  - [ ] Módulos visíveis conforme permissões/entitlements.
  - [ ] Link para configurações.
- [ ] Responsividade (desktop, tablet, mobile).

## 4) Workspaces & permissões
- [ ] Buscar workspaces do usuário: `GET /workspaces`.
- [ ] Selecionar workspace ativo (armazenar `workspaceId`).
- [ ] Exibir seletor de workspace no perfil quando tiver workspace business.
- [ ] Guardar permissões/módulos habilitados para montar menu:
  - [ ] Permissões: `GET /permissions` + `GET /roles/:roleId/permissions`.
  - [ ] Entitlements por workspace: `GET /workspaces/:workspaceId/entitlements`.

## 5) Configurações
- [ ] Tela de configurações com:
  - [ ] Plano atual: `GET /workspaces/:workspaceId/subscriptions`.
  - [ ] Atualização de plano: `PUT /workspaces/:workspaceId/subscriptions/:id`.
  - [ ] Seat packs (business): `GET /workspaces/:workspaceId/seat-packs`.
  - [ ] Limites: `GET /workspaces/:workspaceId/limits`.
- [ ] Área de pagamento (placeholder para integração futura).

## 6) Perfil do usuário
- [ ] Tela de perfil (foto, nome, dados básicos).
- [ ] Atualização de perfil (dependente do endpoint de user profile existente).

## 7) Módulos (layout padrão + funcionalidades)
- [ ] Definir padrão de layout de módulo (header, ações, filtros, tabela/lista, paginação).
- [ ] Módulo de Senhas:
  - [ ] CRUD de registros (senha/chave/segredo).
  - [ ] Busca por tipo, filtragem, ordenação e paginação.
- [ ] Módulo de Documentos:
  - [ ] CRUD de pastas.
  - [ ] Upload e organização de arquivos por pasta.
  - [ ] Busca, filtragem, ordenação e paginação.
- [ ] Módulo de Finanças:
  - [ ] CRUD de receitas, despesas e tipos/categorias.
  - [ ] Filtros avançados + ordenação + paginação.
  - [ ] Checklist de contas recorrentes (mensais) com múltiplos tipos.
- [ ] Módulo de RH:
  - [ ] CRUD de pessoas (currículo, notas, vaga/setor).
  - [ ] Opção de enviar eventos para o calendário.
- [ ] Calendário integrado entre módulos:
  - [ ] Eventos de lembretes e recorrências vindos de finanças/RH.
  - [ ] Ao clicar no evento, exibir histórico completo (ex.: despesa + nota fiscal).

## 8) Internacionalização (PT/EN)
- [ ] Estrutura de i18n com PT/EN.
- [ ] Alternância de idioma no UI.
- [ ] Textos do boilerplate e autenticação localizados.

## 9) UX e acessibilidade
- [ ] Navegação com foco/teclado.
- [ ] Estados de loading/empty/error.
- [ ] Componentes acessíveis (labels, aria, contraste).

---

## Endpoints do backend usados
- Auth: `POST /auth/register`, `POST /auth/login`, `POST /auth/google`, `POST /auth/refresh`, `POST /auth/logout`.
- Workspaces: `GET /workspaces`.
- Permissions/RBAC: `GET /permissions`, `GET /roles/:roleId/permissions`.
- Billing/Entitlements/Limits:
  - `GET /workspaces/:workspaceId/subscriptions`
  - `PUT /workspaces/:workspaceId/subscriptions/:id`
  - `GET /workspaces/:workspaceId/seat-packs`
  - `GET /workspaces/:workspaceId/entitlements`
  - `GET /workspaces/:workspaceId/limits`

## Definition of Done (MVP base)
- Login local e Google funcionando.
- Boilerplate com menu lateral + topo reutilizável.
- Tema dark/light persistido.
- i18n PT/EN funcional.
- Seleção de workspace e menu por permissão.
- Telas de Configurações e Perfil com dados do backend (quando aplicável).
- Layout responsivo em desktop e mobile.
