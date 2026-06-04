// Tests for the in-memory cache utility — TTL, get, set, delete, clear
const cache = require('../../src/utils/cache');

beforeEach(() => {
  cache.clear();
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('cache.set / cache.get', () => {
  it('returns the stored value before TTL expires', () => {
    cache.set('key1', 'value1', 300);
    expect(cache.get('key1')).toBe('value1');
  });

  it('returns null for a key that was never set', () => {
    expect(cache.get('nonexistent')).toBeNull();
  });

  it('returns null after TTL has passed', () => {
    cache.set('key2', 'value2', 300);
    jest.advanceTimersByTime(301 * 1000);
    expect(cache.get('key2')).toBeNull();
  });

  it('returns value if TTL has not yet passed', () => {
    cache.set('key3', 'value3', 300);
    jest.advanceTimersByTime(299 * 1000);
    expect(cache.get('key3')).toBe('value3');
  });
});

describe('cache.delete', () => {
  it('removes the key so subsequent get returns null', () => {
    cache.set('key4', 'value4', 300);
    cache.delete('key4');
    expect(cache.get('key4')).toBeNull();
  });
});

describe('cache.clear', () => {
  it('removes all keys', () => {
    cache.set('a', 1, 300);
    cache.set('b', 2, 300);
    cache.clear();
    expect(cache.get('a')).toBeNull();
    expect(cache.get('b')).toBeNull();
  });
});
