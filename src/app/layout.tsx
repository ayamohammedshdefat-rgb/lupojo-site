import type { Metadata, Viewport } from 'next';
import { cairo, cairoThin } from '@/lib/fonts';
import { MotionProvider } from '@/components/motion/MotionProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'LUPO | المنيو',
  description: 'منيو LUPO — برجر، إضافات، مشروبات وصوصات.',
};

export const viewport: Viewport = {
  themeColor: '#0b0b0b',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${cairoThin.variable}`}>
      <body className="bg-canvas font-sans text-fg antialiased">
        <MotionProvider>{children}</MotionProvider>
        <div className="lupo-grain" aria-hidden="true" />
      </body>
    </html>
  );
}
