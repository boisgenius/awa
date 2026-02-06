import { test, expect } from '@playwright/test';

test.describe('API Endpoints', () => {
  test.describe('Skills API', () => {
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

    test('GET /api/skills/1 should return skill details', async ({ request }) => {
      const response = await request.get('/api/skills/1');

      expect(response.status()).toBe(200);

      const skill = await response.json();
      expect(skill).toHaveProperty('id');
      expect(skill).toHaveProperty('name');
      expect(skill).toHaveProperty('price');
    });

    test('GET /api/skills/trending should return trending skills', async ({ request }) => {
      const response = await request.get('/api/skills/trending');

      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('data');
      expect(Array.isArray(data.data)).toBe(true);
    });

    test('POST /api/skills without auth should fail', async ({ request }) => {
      const response = await request.post('/api/skills', {
        data: {
          name: 'Test Skill',
          description: 'Test',
          category: 'research',
          price: 1.0,
        },
      });

      expect(response.status()).toBe(401);
    });
  });

  test.describe('Leaderboard API', () => {
    test('GET /api/leaderboard should return leaderboard data', async ({ request }) => {
      const response = await request.get('/api/leaderboard');

      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('meta');
      expect(Array.isArray(data.data)).toBe(true);
    });

    test('GET /api/leaderboard with time range', async ({ request }) => {
      const response = await request.get('/api/leaderboard?timeRange=24h');

      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data.meta.timeRange).toBe('24h');
    });
  });

  test.describe('Agents API', () => {
    test('POST /api/agents should create new agent', async ({ request }) => {
      const response = await request.post('/api/agents', {
        data: {
          name: 'Test Agent',
        },
      });

      expect(response.status()).toBe(201);

      const data = await response.json();
      expect(data).toHaveProperty('agent');
      expect(data).toHaveProperty('apiKey');
      expect(data.agent.name).toBe('Test Agent');
    });

    test('POST /api/agents without name should fail', async ({ request }) => {
      const response = await request.post('/api/agents', {
        data: {},
      });

      expect(response.status()).toBe(400);
    });

    test('GET /api/agents/me without auth should fail', async ({ request }) => {
      const response = await request.get('/api/agents/me');

      expect(response.status()).toBe(401);
    });

    test('GET /api/agents/agent-1 should return agent details', async ({ request }) => {
      const response = await request.get('/api/agents/agent-1');

      expect(response.status()).toBe(200);

      const agent = await response.json();
      expect(agent).toHaveProperty('id');
      expect(agent).toHaveProperty('name');
    });

    test('GET /api/agents/agent-1/balance should return balance', async ({ request }) => {
      const response = await request.get('/api/agents/agent-1/balance');

      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('wallet');
      expect(data.wallet).toHaveProperty('balance');
    });
  });

  test.describe('Rate Limiting', () => {
    test('should include rate limit headers', async ({ request }) => {
      const response = await request.get('/api/skills');

      expect(response.headers()['x-ratelimit-limit']).toBeDefined();
      expect(response.headers()['x-ratelimit-remaining']).toBeDefined();
    });
  });
});
