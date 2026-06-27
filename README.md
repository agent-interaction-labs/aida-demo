# AIDA Demo

**End-to-end demonstration of AIDA Web Agent Identity.**

An AI agent signs HTTP requests with its Ed25519 identity. A web server verifies the signature using AIDA Verify middleware. Cryptographic proof without a hosted signing authority.

## Quick Start

```bash
# Terminal 1 — Start the server
cd aida-demo
npm install
npm run server

# Terminal 2 — Run the agent
npm run agent
```

## What You'll See

**Terminal 1 (Server):**
```
🔒 AIDA Verify middleware active on port 3000
   Endpoints:
   - GET /api/status   (public — shows agent info)
   - GET /api/secret   (protected — requires alice@example.com)

   Waiting for agent requests...

→ Agent aida:CcL7R8Yx... verified ✓ (controller: alice@example.com)
→ Agent aida:CcL7R8Yx... verified ✓ (controller: alice@example.com)
→ REJECTED: No Aida-Agent header
```

**Terminal 2 (Agent):**
```
🔑 Generating Ed25519 keypair...
✅ Agent identity created:
   AIDA URI: aida:CcL7R8YxPZnJ2YqkMoF1mBvQrWtLxU9k
   Controller: alice@example.com

📤 Sending signed request to GET /api/status...
   Status: 200
   Response: {"status":"ok","agent":{"id":"aida:CcL7R8...","verified":true}}

📤 Sending signed request to GET /api/secret...
   Status: 200
   Response: {"secret":"classified data..."}

📤 Sending UNSIGNED request to GET /api/secret...
   Status: 401
   Response: {"error":"agent_identity_required"}
```

## How It Works

```
┌──────────────────┐         ┌──────────────────┐
│    Agent (you)    │         │  Website (server) │
│                    │         │                    │
│ 1. Generates       │         │                    │
│    Ed25519 keypair │         │                    │
│                    │         │                    │
│ 2. Signs HTTP      │  HTTP   │ 3. Extracts        │
│    request with    │ ──────▶ │    Aida-Agent      │
│    private key     │         │    header          │
│                    │         │                    │
│                    │         │ 4. Resolves public │
│                    │         │    key from URI    │
│                    │         │                    │
│                    │         │ 5. Verifies RFC    │
│                    │         │    9421 signature  │
│                    │         │                    │
│                    │  200    │ 6. Agent identity  │
│                    │ ◀────── │    confirmed ✓     │
└──────────────────┘         └──────────────────┘
```

No hosted signing authority. No API keys. No blockchain. Just Ed25519 + RFC 9421 + DNS.

## Related

- [aida-agent](../aida-agent) — Agent SDK for signing requests
- [aida-verify](../aida-verify) — Server SDK for verifying agent identity
- [aida-spec](../aida-spec) — Protocol specification
