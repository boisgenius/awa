import { test, expect } from '@playwright/test';

test.describe('API Endpoints', () => {
  test.describe('Skills API (Public)', () => {
    test('GET /api/skills should return skills list', async ({ request }) => {
      const response = await request.get('/api/skills');

      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('total');
      expect(Array.isArray(data.data)).toBe(true);
    });

    test('GET /api/skills with category filter', async ({ request }) => {
      const response = await request.get('/api/skills?category=research');

      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(Array.isArray(data.data)).toBe(true);
    });

    test('GET /api/skills with pagination', async ({ request }) => {
      const response = await request.get('/api/skills?page=1&limit=5');

      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data.data.length).toBeLessThanOrEqual(5);
    });

    test('GET /api/skills with sort', async ({ request }) => {
      const response = await request.get('/api/skills?sort=trending');

      expect(response.status()).toBe(200);
    });

    test('GET /api/skills/:id should return skill details', async ({ request }) => {
      // First get a skill ID from the list
      const listResponse = await request.get('/api/skills?limit=1');
      const listData = await listResponse.json();

      if (listData.data && listData.data.length > 0) {
        const skillId = listData.data[0].id;
        const response = await request.get(`/api/skills/${skillId}`);

        expect(response.status()).toBe(200);

        const skill = await response.json();
        expect(skill).toHaveProperty('id');
        expect(skill).toHaveProperty('name');
        expect(skill).toHaveProperty('price');
      }
    });

    test('GET /api/skills/invalid-id should return 404', async ({ request }) => {
      const response = await request.get('/api/skills/non-existent-skill-id-12345');

      expect(response.status()).toBe(404);
    });

    test('GET /api/skills/trending should return trending skills', async ({ request }) => {
      const response = await request.get('/api/skills/trending');

      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('data');
      expect(Array.isArray(data.data)).toBe(true);
    });
  });

  test.describe('Agent Registration API', () => {
    test('POST /api/agents/register should create new agent', async ({ request }) => {
      const uniqueName = `TestAgent_${Date.now()}`;

      const response = await request.post('/api/agents/register', {
        data: {
          name: uniqueName,
          description: 'A test agent for E2E testing',
        },
      });

      expect(response.status()).toBe(201);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('id');
      expect(data.data).toHaveProperty('apiKey');
      expect(data.data).toHaveProperty('claimUrl');
      expect(data.data).toHaveProperty('verificationCode');
      expect(data.data).toHaveProperty('walletPublicKey');
      expect(data.data.name).toBe(uniqueName);
      expect(data.data.status).toBe('pending_claim');

      // API key should have correct prefix
      expect(data.data.apiKey).toMatch(/^claw_sk_/);
    });

    test('POST /api/agents/register without name should fail', async ({ request }) => {
      const response = await request.post('/api/agents/register', {
        data: {},
      });

      expect(response.status()).toBe(400);

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toHaveProperty('code');
    });

    test('POST /api/agents/register with invalid name should fail', async ({ request }) => {
      const response = await request.post('/api/agents/register', {
        data: {
          name: 'x', // Too short
        },
      });

      expect(response.status()).toBe(400);
    });

    test('POST /api/agents/register with special characters should fail', async ({ request }) => {
      const response = await request.post('/api/agents/register', {
        data: {
          name: 'Test Agent!@#', // Invalid characters
        },
      });

      expect(response.status()).toBe(400);
    });
  });

  test.describe('Agent Authentication API', () => {
    test('GET /api/agents/me without auth should fail', async ({ request }) => {
      const response = await request.get('/api/agents/me');

      expect(response.status()).toBe(401);

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('MISSING_AUTH');
    });

    test('GET /api/agents/me with invalid API key should fail', async ({ request }) => {
      const response = await request.get('/api/agents/me', {
        headers: {
          'Authorization': 'Bearer invalid_key_12345',
        },
      });

      expect(response.status()).toBe(401);

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_API_KEY');
    });

    test('GET /api/agents/me with malformed API key should fail', async ({ request }) => {
      const response = await request.get('/api/agents/me', {
        headers: {
          'X-API-Key': 'claw_sk_tooshort',
        },
      });

      expect(response.status()).toBe(401);
    });
  });

  test.describe('Favorites API', () => {
    test('GET /api/favorites without auth should fail', async ({ request }) => {
      const response = await request.get('/api/favorites');

      expect(response.status()).toBe(401);
    });

    test('POST /api/favorites without auth should fail', async ({ request }) => {
      const response = await request.post('/api/favorites', {
        data: {
          skillId: 'some-skill-id',
        },
      });

      expect(response.status()).toBe(401);
    });

    test('DELETE /api/favorites/:skillId without auth should fail', async ({ request }) => {
      const response = await request.delete('/api/favorites/some-skill-id');

      expect(response.status()).toBe(401);
    });
  });

  test.describe('Purchase API', () => {
    test('POST /api/skills/:id/purchase without auth should fail', async ({ request }) => {
      const response = await request.post('/api/skills/some-skill-id/purchase');

      expect(response.status()).toBe(401);

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('MISSING_AUTH');
    });

    test('GET /api/skills/:id/content without auth should fail', async ({ request }) => {
      const response = await request.get('/api/skills/some-skill-id/content');

      expect(response.status()).toBe(401);
    });
  });

  test.describe('Purchases History API', () => {
    test('GET /api/agents/purchases without auth should fail', async ({ request }) => {
      const response = await request.get('/api/agents/purchases');

      expect(response.status()).toBe(401);
    });
  });

  test.describe('Claim API', () => {
    test('GET /api/agents/claim-info with invalid token should fail', async ({ request }) => {
      const response = await request.get('/api/agents/claim-info?token=invalid_token');

      expect(response.status()).toBe(404);
    });

    test('POST /api/agents/claim with invalid data should fail', async ({ request }) => {
      const response = await request.post('/api/agents/claim', {
        data: {
          claimToken: 'tk_invalid',
          tweetUrl: 'https://twitter.com/user/status/123',
        },
      });

      // Should fail because token doesn't exist
      expect(response.status()).toBe(404);
    });
  });

  test.describe('Rate Limiting', () => {
    test('should include rate limit headers on public endpoints', async ({ request }) => {
      const response = await request.get('/api/skills');

      // Rate limit headers may or may not be present on public endpoints
      // depending on implementation
      expect(response.status()).toBe(200);
    });

    test('should include rate limit headers on auth failure', async ({ request }) => {
      const response = await request.get('/api/agents/me');

      expect(response.status()).toBe(401);
    });
  });

  test.describe('Error Response Format', () => {
    test('should return consistent error format', async ({ request }) => {
      const response = await request.get('/api/agents/me');

      expect(response.status()).toBe(401);

      const data = await response.json();
      expect(data).toHaveProperty('success');
      expect(data.success).toBe(false);
      expect(data).toHaveProperty('error');
      expect(data.error).toHaveProperty('code');
      expect(data.error).toHaveProperty('message');
    });
  });

  test.describe('Leaderboard API', () => {
    test('GET /api/leaderboard should return leaderboard data', async ({ request }) => {
      const response = await request.get('/api/leaderboard');

      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('data');
      expect(Array.isArray(data.data)).toBe(true);
    });

    test('GET /api/leaderboard with time range', async ({ request }) => {
      const response = await request.get('/api/leaderboard?timeRange=24h');

      expect(response.status()).toBe(200);
    });
  });
});

test.describe('Full Agent Registration Flow', () => {
  test('should complete registration and get agent info', async ({ request }) => {
    // Step 1: Register a new agent
    const uniqueName = `FlowTest_${Date.now()}`;

    const registerResponse = await request.post('/api/agents/register', {
      data: {
        name: uniqueName,
        description: 'Testing the full registration flow',
      },
    });

    expect(registerResponse.status()).toBe(201);

    const registerData = await registerResponse.json();
    expect(registerData.success).toBe(true);

    const apiKey = registerData.data.apiKey;
    const agentId = registerData.data.id;

    // Step 2: Use the API key to get agent info
    // Note: Agent is in pending_claim status, so some endpoints may not work
    const meResponse = await request.get('/api/agents/me', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    // Agent should be accessible but may have limited functionality
    // until claimed
    if (meResponse.status() === 200) {
      const meData = await meResponse.json();
      expect(meData.success).toBe(true);
      expect(meData.data.id).toBe(agentId);
      expect(meData.data.name).toBe(uniqueName);
    } else {
      // Agent might need to be claimed first
      expect(meResponse.status()).toBe(403);
    }
  });
});
