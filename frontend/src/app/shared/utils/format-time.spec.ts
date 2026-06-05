// Tests for formatTime utility — converts seconds to MM:SS
import { formatTime } from './format-time';

describe('formatTime', () => {
  it('formats 25 minutes', () => {
    expect(formatTime(1500)).toBe('25:00');
  });

  it('formats seconds with leading zero', () => {
    expect(formatTime(299)).toBe('04:59');
  });

  it('formats zero', () => {
    expect(formatTime(0)).toBe('00:00');
  });

  it('formats minute and seconds with leading zero', () => {
    expect(formatTime(65)).toBe('01:05');
  });

  it('formats extended durations', () => {
    expect(formatTime(3600)).toBe('60:00');
  });
});
