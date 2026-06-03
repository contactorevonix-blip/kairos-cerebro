// User API Keys endpoints (S2.1)
// Routes: POST/GET/DELETE /api/user/keys

const { PrismaClient } = require('@prisma/client');
const { generateKey, hashKey, getLastFourChars } = require('../lib/key-generator');

const prisma = new PrismaClient();

async function handleUserApiKeysRequest(req, res, { method, url, userId, sendJson }) {
  try {
    // POST /api/user/keys — Create new API key
    if (method === 'POST' && url === '/api/user/keys') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      const name = body.name || 'My API Key';

      const key = generateKey();
      const keyHash = await hashKey(key);
      const lastFourChars = getLastFourChars(key);

      const apiKey = await prisma.apiKey.create({
        data: {
          userId,
          name,
          keyHash,
          lastFourChars,
        },
      });

      // Return key only once — client MUST copy it immediately
      return sendJson(res, 201, {
        id: apiKey.id,
        name: apiKey.name,
        key, // Full key shown only at creation
        lastFourChars: apiKey.lastFourChars,
        createdAt: apiKey.createdAt,
      });
    }

    // GET /api/user/keys — List user's API keys
    if (method === 'GET' && url === '/api/user/keys') {
      const apiKeys = await prisma.apiKey.findMany({
        where: { userId },
        select: {
          id: true,
          name: true,
          lastFourChars: true,
          lastUsedAt: true,
          revokedAt: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return sendJson(res, 200, { keys: apiKeys });
    }

    // DELETE /api/user/keys/:id — Revoke API key
    if (method === 'DELETE' && url.startsWith('/api/user/keys/')) {
      const keyId = url.split('/').pop();

      // Verify ownership
      const apiKey = await prisma.apiKey.findUnique({
        where: { id: keyId },
      });

      if (!apiKey) {
        return sendJson(res, 404, {
          code: 'KEY_NOT_FOUND',
          message: 'API key not found',
        });
      }

      if (apiKey.userId !== userId) {
        return sendJson(res, 403, {
          code: 'FORBIDDEN',
          message: 'You do not have permission to revoke this key',
        });
      }

      // Soft delete: mark as revoked
      await prisma.apiKey.update({
        where: { id: keyId },
        data: { revokedAt: new Date() },
      });

      return sendJson(res, 200, { success: true, message: 'API key revoked' });
    }

    return sendJson(res, 404, {
      code: 'NOT_FOUND',
      message: 'Endpoint not found',
    });
  } catch (error) {
    console.error('[user-api-keys] Error:', error);
    return sendJson(res, 500, {
      code: 'INTERNAL_ERROR',
      message: 'Internal server error',
    });
  }
}

module.exports = { handleUserApiKeysRequest };
