import { getSiteUrl } from '../src/utils/siteLinks';

describe('getSiteUrl', () => {
  it('uses the production origin on native', () => {
    expect(getSiteUrl('/support', { platform: 'ios' })).toBe(
      'https://timetutor.app/support',
    );
    expect(getSiteUrl('/privacy', { platform: 'ios' })).toBe(
      'https://timetutor.app/privacy',
    );
  });

  it('uses the current web origin in the browser', () => {
    expect(
      getSiteUrl('/support', {
        platform: 'web',
        webOrigin: 'http://localhost:4173',
      }),
    ).toBe('http://localhost:4173/support');
    expect(
      getSiteUrl('/privacy', {
        platform: 'web',
        webOrigin: 'http://localhost:4173',
      }),
    ).toBe('http://localhost:4173/privacy');
  });
});
