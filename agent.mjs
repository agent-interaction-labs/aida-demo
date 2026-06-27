/**
 * AIDA Demo — Agent Script.
 *
 * Creates an agent identity, signs an HTTP request, and sends it to a
 * website that verifies the AIDA identity via @aida/verify middleware.
 *
 * Usage: node agent.mjs
 */

import { createAgent } from '../aida-agent/src/index.ts';

const BASE_URL = 'http://localhost:3000';

async function main() {
  console.log('╔══════════════════════════════════════════╗');
  console.log('║        AIDA Web Agent Identity           ║');
  console.log('║           AGENT TERMINAL                 ║');
  console.log('╚══════════════════════════════════════════╝');
  console.log('');

  // Step 1: Create the agent identity
  console.log('🔑 Generating Ed25519 keypair...');
  const agent = await createAgent({
    controller: { email: 'alice@example.com', dns: 'alice-demo.example.com' },
    endpoints: [{ url: 'http://localhost:3001/.well-known/aida', protocol: 'mcp' }],
    capabilities: ['web-browsing', 'data-retrieval'],
    storagePath: '.aida-agent.json',
  });

  console.log(`✅ Agent identity created:`);
  console.log(`   AIDA URI: ${agent.identity.id}`);
  console.log(`   Controller: ${agent.identity.controller.email ?? 'N/A'}`);
  console.log(`   Capabilities: ${(agent.identity.capabilities ?? []).join(', ') || 'none'}`);
  console.log('');

  // Step 2: Make a signed request to a public endpoint
  console.log('📤 Sending signed request to GET /api/status...');
  {
    const req = await agent.signRequest(`${BASE_URL}/api/status`, {
      method: 'GET',
      purpose: 'inference',
    });

    const res = await fetch(req.url, { headers: req.headers });
    const data = await res.json();
    console.log(`   Status: ${res.status}`);
    console.log(`   Response: ${JSON.stringify(data, null, 2).replace(/\n/g, '\n   ')}`);
  }
  console.log('');

  // Step 3: Make a signed request to a protected endpoint
  console.log('📤 Sending signed request to GET /api/secret...');
  {
    const req = await agent.signRequest(`${BASE_URL}/api/secret`, {
      method: 'GET',
      purpose: 'task',
    });

    const res = await fetch(req.url, { headers: req.headers });
    const data = await res.json();
    console.log(`   Status: ${res.status}`);
    console.log(`   Response: ${JSON.stringify(data, null, 2).replace(/\n/g, '\n   ')}`);
  }
  console.log('');

  // Step 4: Make an unsigned request (should be rejected)
  console.log('📤 Sending UNSIGNED request to GET /api/secret...');
  {
    const res = await fetch(`${BASE_URL}/api/secret`);
    const data = await res.json();
    console.log(`   Status: ${res.status}`);
    console.log(`   Response: ${JSON.stringify(data, null, 2).replace(/\n/g, '\n   ')}`);
  }
  console.log('');

  console.log('✅ Demo complete!');
}

main().catch((err) => {
  console.error('❌ Demo failed:', err.message);
  process.exit(1);
});
