'use strict';

/**
 * CHECK ENGINE — In-Memory Cache
 * TTL configurável por source. Zero deps.
 */

class Cache {
  constructor() { this._store = new Map(); }

  get(key) {
    const entry = this._store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expires_at) { this._store.delete(key); return null; }
    return entry.value;
  }

  set(key, value, ttlMs) {
    this._store.set(key, { value, expires_at: Date.now() + ttlMs });
  }

  delete(key) { this._store.delete(key); }

  size() { return this._store.size; }

  // TTLs padrão por source (ms)
  static TTL = {
    ip:            5 * 60 * 1000,   // 5min
    email:        24 * 60 * 60 * 1000, // 24h
    email_mx:      6 * 60 * 60 * 1000, // 6h
    phone:         1 * 60 * 60 * 1000, // 1h
    tor_list:     24 * 60 * 60 * 1000, // 24h
    cep:           7 * 24 * 60 * 60 * 1000, // 7d (endereços não mudam)
    default:       5 * 60 * 1000,
  };
}

module.exports = { Cache };
