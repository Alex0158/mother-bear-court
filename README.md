# Emorapy

**Guided reflection and repair after relationship conflict.**

Emorapy helps people turn a difficult relationship experience into something they can understand, revisit, and act on. It supports low-friction reflection, structured conversations, clear next steps, and safety-first routing when a situation should not be treated as an ordinary disagreement.

[Open the current public web app](https://emorapy.co.uk)

> Emorapy is not a medical, mental-health treatment, legal-advice, or emergency-response service.

## Product principles

- Help people feel understood without assigning winners or losers.
- Turn reflection into one practical, user-controlled next step.
- Keep private context private unless the user explicitly approves sharing it.
- Put safety ahead of invitations, joint repair, or conversion goals.

## Repository

This monorepo contains:

- `frontend/` — consumer web app
- `frontend-admin/` — permission-aware operations app
- `backend/` — API, safety policy, and product services
- `mobile/` — Expo/React Native app
- `packages/` — shared contracts and API client

The engineering and product source of truth is [`docs/核心開發文件/`](./docs/核心開發文件/README.md). Brand and external-positioning guidance lives in [`docs/核心營銷文件/`](./docs/核心營銷文件/README.md).

## Local development

Use Node.js 24, PostgreSQL/Supabase, and local Redis. After configuring the documented development environment:

```bash
npm install
./scripts/start-dev.sh
```

See the [operations runbook](./docs/核心開發文件/03-管理端與平台治理/05-運維連接與調用Runbook.md) for environment setup and verification. Do not use production credentials for local development.
