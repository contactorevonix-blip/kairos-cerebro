// API Key authentication middleware
const { PrismaClient } = require('@prisma/client');
const { verifyKey } = require('../lib/key-generator');

const prisma = new PrismaClient();

async function authApiKey(req, res, next) {
  // Extract key from Authorization header or ?api_key query param
  const authHeader = req.headers.authorization || '';
  const bearerKey = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  const queryKey = req.query.api_key || '';
  const key = bearerKey || queryKey;

  if (!key) {
    return res.status(401).json({
      code: 'MISSING_API_KEY',
      message: 'API key required',
      detail: 'Provide key via Authorization header (Bearer <key>) or ?api_key=<key>',
    });
  }

  try {
    // Find all keys for this user's pattern (last 4 chars)
    const lastFour = key.substring(key.length - 4);
    const dbKeys = await prisma.apiKey.findMany({
      where: {
        lastFourChars: lastFour,
        revokedAt: null, // only active keys
      },
      include: { user: true },
    });

    if (dbKeys.length === 0) {
      return res.status(401).json({
        code: 'INVALID_API_KEY',
        message: 'Invalid or revoked API key',
      });
    }

    // Try to match the full key hash
    let matchedKey = null;
    for (const dbKey of dbKeys) {
      const isValid = await verifyKey(key, dbKey.keyHash);
      if (isValid) {
        matchedKey = dbKey;
        break;
      }
    }

    if (!matchedKey) {
      return res.status(401).json({
        code: 'INVALID_API_KEY',
        message: 'Invalid or revoked API key',
      });
    }

    // Update lastUsedAt
    await prisma.apiKey.update({
      where: { id: matchedKey.id },
      data: { lastUsedAt: new Date() },
    });

    // Attach to request
    req.apiKey = {
      id: matchedKey.id,
      userId: matchedKey.userId,
      name: matchedKey.name,
    };
    req.user = {
      id: matchedKey.user.id,
      email: matchedKey.user.email,
    };

    next();
  } catch (error) {
    console.error('[auth-apikey] Error:', error);
    return res.status(500).json({
      code: 'AUTH_ERROR',
      message: 'Authentication failed',
    });
  }
}

module.exports = authApiKey;
