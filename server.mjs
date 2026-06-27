/**
 * AIDA Demo — Server Script.
 *
 * Express server with @aida/verify middleware. Every request is checked
 * for AIDA agent identity. Protected endpoint requires verified identity.
 *
 * Usage: node server.mjs
 */

import express from 'express';
import { createMiddleware } from '../aida-typescript-sdk/packages/verify/src/index.ts';

const PORT = 3000;

// ---------------------------------------------------------------------------
// AIDA Verify Middleware
// ---------------------------------------------------------------------------

const aidaMiddleware = createMiddleware({
  required: false, // We'll enforce per-route
  clockSkew: 300,
});

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

const app = express();

// Apply AIDA middleware to all routes
app.use(aidaMiddleware);

// Public endpoint — shows agent info if provided, works without
app.get('/api/status', (req, res) => {
  const aida = req.aida;
  if (!aida) {
    return res.json({ status: 'ok', agent: null, message: 'No agent identity provided' });
  }

  if (!aida.verified) {
    return res.json({
      status: 'ok',
      agent: { id: aida.agentId, verified: false, error: aida.error },
    });
  }

  res.json({
    status: 'ok',
    agent: {
      id: aida.agentId,
      verified: true,
      controller: aida.controller,
      purpose: aida.purpose,
    },
  });
});

// Protected endpoint — requires verified agent identity
app.get('/api/secret', (req, res) => {
  const aida = req.aida;

  if (!aida || !aida.verified) {
    return res.status(401).json({
      error: 'agent_identity_required',
      message: aida?.error ?? 'A verified AIDA agent identity is required for this resource',
    });
  }

  // Controller whitelisting example
  const controllerEmail = aida.controller?.email;
  if (controllerEmail !== 'alice@example.com') {
    return res.status(403).json({
      error: 'controller_forbidden',
      message: `Agent controller "${controllerEmail ?? 'unknown'}" is not authorized`,
    });
  }

  res.json({
    secret: 'classified data accessible only to alice@example.com agents',
    agent: aida.agentId,
    verifiedBy: 'AIDA Web Agent Identity (Ed25519 + RFC 9421)',
  });
});

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------

app.listen(PORT, () => {
  console.log('╔══════════════════════════════════════════╗');
  console.log('║        AIDA Web Agent Identity           ║');
  console.log('║           SERVER TERMINAL                ║');
  console.log('╚══════════════════════════════════════════╝');
  console.log('');
  console.log(`🔒 AIDA Verify middleware active on port ${PORT}`);
  console.log(`   Endpoints:`);
  console.log(`   - GET /api/status   (public — shows agent info)`);
  console.log(`   - GET /api/secret   (protected — requires alice@example.com)`);
  console.log('');
  console.log(`   Verification: Ed25519 + RFC 9421 HTTP Message Signatures`);
  console.log(`   Key discovery: aidaUriToPublicKey (local resolution)`);
  console.log('');
  console.log('   Waiting for agent requests...');
  console.log('');
});
