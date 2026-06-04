// Singleton in-memory cache with TTL — avoids GitHub API rate limits
const store = new Map();

const cache = {
  set(key, value, ttlSeconds) {
    store.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
  },

  get(key) {
    const entry = store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      store.delete(key);
      return null;
    }
    return entry.value;
  },

  delete(key) {
    store.delete(key);
  },

  clear() {
    store.clear();
  },
};

module.exports = cache;
