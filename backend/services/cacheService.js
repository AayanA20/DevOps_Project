/**
 * Instagram System Design - Phase 4 & 5
 * Redis Cache-Aside Service with high-performance In-Memory Fallback
 * 
 * Implements the key patterns from Section 4D:
 * - feed:{userId}          -> Sorted Set (score = timestamp, member = postId)
 * - post:{postId}          -> Hash (post metadata)
 * - user:{userId}          -> Hash (user profile)
 * - likes:count:{postId}   -> Counter
 * - session:{token}        -> String (user session)
 * - rate:{userId}:{minute} -> Sliding window rate limit counter
 */

class CacheService {
  constructor() {
    this.storage = new Map();
    this.ttls = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
    };

    // Periodic cleanup of expired keys (every 30 seconds)
    setInterval(() => this.cleanExpiredKeys(), 30000).unref();
  }

  cleanExpiredKeys() {
    const now = Date.now();
    for (const [key, expireAt] of this.ttls.entries()) {
      if (expireAt <= now) {
        this.storage.delete(key);
        this.ttls.delete(key);
      }
    }
  }

  isExpired(key) {
    const expireAt = this.ttls.get(key);
    if (!expireAt) return false;
    if (Date.now() > expireAt) {
      this.storage.delete(key);
      this.ttls.delete(key);
      return true;
    }
    return false;
  }

  // --- String & Object methods ---

  async get(key) {
    if (this.isExpired(key)) {
      this.stats.misses++;
      return null;
    }
    const val = this.storage.get(key);
    if (val !== undefined) {
      this.stats.hits++;
      try {
        return JSON.parse(val);
      } catch {
        return val;
      }
    }
    this.stats.misses++;
    return null;
  }

  async set(key, value, ttlSeconds = null) {
    this.stats.sets++;
    const serialized = typeof value === 'object' ? JSON.stringify(value) : String(value);
    this.storage.set(key, serialized);

    if (ttlSeconds && ttlSeconds > 0) {
      this.ttls.set(key, Date.now() + ttlSeconds * 1000);
    } else {
      this.ttls.delete(key);
    }
    return true;
  }

  async del(key) {
    this.stats.deletes++;
    this.ttls.delete(key);
    return this.storage.delete(key);
  }

  // --- Atomic Counter methods (Section 4D: likes:count:{postId}, rate:{userId}:{minute}) ---

  async incr(key, ttlSeconds = null) {
    if (this.isExpired(key)) {
      this.storage.delete(key);
    }
    const current = Number(this.storage.get(key)) || 0;
    const nextVal = current + 1;
    this.storage.set(key, String(nextVal));

    if (ttlSeconds && !this.ttls.has(key)) {
      this.ttls.set(key, Date.now() + ttlSeconds * 1000);
    }
    return nextVal;
  }

  async decr(key) {
    if (this.isExpired(key)) {
      this.storage.delete(key);
    }
    const current = Number(this.storage.get(key)) || 0;
    const nextVal = Math.max(0, current - 1);
    this.storage.set(key, String(nextVal));
    return nextVal;
  }

  // --- Sorted Set methods (Section 4D: feed:{userId}) ---

  async zadd(key, score, member) {
    if (this.isExpired(key)) {
      this.storage.delete(key);
    }
    let zset = this.storage.get(key);
    if (!(zset instanceof Map)) {
      zset = new Map();
      this.storage.set(key, zset);
    }
    zset.set(String(member), Number(score));
    return 1;
  }

  async zrevrange(key, start = 0, stop = -1) {
    if (this.isExpired(key)) {
      return [];
    }
    const zset = this.storage.get(key);
    if (!(zset instanceof Map)) {
      return [];
    }

    // Sort entries descending by score
    const sorted = Array.from(zset.entries()).sort((a, b) => b[1] - a[1]);
    const end = stop === -1 ? sorted.length : stop + 1;
    return sorted.slice(start, end).map(([member]) => member);
  }

  async zrem(key, member) {
    const zset = this.storage.get(key);
    if (zset instanceof Map) {
      return zset.delete(String(member));
    }
    return false;
  }

  // --- Hash methods (Section 4D: post:{postId}, user:{userId}) ---

  async hset(key, field, value, ttlSeconds = 3600) {
    if (this.isExpired(key)) {
      this.storage.delete(key);
    }
    let hash = this.storage.get(key);
    if (!(hash instanceof Map)) {
      hash = new Map();
      this.storage.set(key, hash);
    }
    const serialized = typeof value === 'object' ? JSON.stringify(value) : String(value);
    hash.set(String(field), serialized);

    if (ttlSeconds && !this.ttls.has(key)) {
      this.ttls.set(key, Date.now() + ttlSeconds * 1000);
    }
    return 1;
  }

  async hget(key, field) {
    if (this.isExpired(key)) return null;
    const hash = this.storage.get(key);
    if (hash instanceof Map) {
      const val = hash.get(String(field));
      if (!val) return null;
      try {
        return JSON.parse(val);
      } catch {
        return val;
      }
    }
    return null;
  }

  async hgetall(key) {
    if (this.isExpired(key)) return null;
    const hash = this.storage.get(key);
    if (hash instanceof Map) {
      const result = {};
      for (const [f, v] of hash.entries()) {
        try {
          result[f] = JSON.parse(v);
        } catch {
          result[f] = v;
        }
      }
      return result;
    }
    return null;
  }

  async hsetall(key, obj, ttlSeconds = 3600) {
    if (this.isExpired(key)) {
      this.storage.delete(key);
    }
    const hash = new Map();
    for (const [k, v] of Object.entries(obj)) {
      hash.set(k, typeof v === 'object' ? JSON.stringify(v) : String(v));
    }
    this.storage.set(key, hash);
    if (ttlSeconds) {
      this.ttls.set(key, Date.now() + ttlSeconds * 1000);
    }
    return true;
  }

  // --- Diagnostics & Status ---

  getStats() {
    return {
      activeKeysCount: this.storage.size,
      stats: this.stats,
      hitRatio:
        this.stats.hits + this.stats.misses > 0
          ? (this.stats.hits / (this.stats.hits + this.stats.misses)).toFixed(3)
          : '0.000',
    };
  }
}

const cacheService = new CacheService();
export default cacheService;
