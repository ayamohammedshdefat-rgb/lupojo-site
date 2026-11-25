import localFont from 'next/font/local';

/**
 * Cairo is the only font family in this project (client rule).
 * Two instances so only the four core weights are preloaded (~230 KB WOFF2).
 */
export const cairo = localFont({
  src: [
    { path: '../fonts/cairo/Cairo-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/cairo/Cairo-SemiBold.woff2', weight: '600', style: 'normal' },
    { path: '../fonts/cairo/Cairo-Bold.woff2', weight: '700', style: 'normal' },
    { path: '../fonts/cairo/Cairo-Black.woff2', weight: '900', style: 'normal' },
  ],
  variable: '--font-cairo',
  display: 'swap',
  preload: true,
});

/** Thin weights for secondary meta (300) and oversized numerals (200). Not preloaded. */
export const cairoThin = localFont({
  src: [
    { path: '../fonts/cairo/Cairo-ExtraLight.woff2', weight: '200', style: 'normal' },
    { path: '../fonts/cairo/Cairo-Light.woff2', weight: '300', style: 'normal' },
  ],
  variable: '--font-cairo-thin',
  display: 'swap',
  preload: false,
});
