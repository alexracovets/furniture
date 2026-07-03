import type { Metadata } from 'next';
import { Geist } from 'next/font/google';

import '@styles';
import type { ChildrenType } from '@types';
import { cn } from '@utils';

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Furniture Configurator',
  description: '3D furniture configurator',
  icons: {
    icon: '/favicon.ico',
  },
};

const RootLayout = ({ children }: ChildrenType) => {
  return (
    <html lang="en" className={cn('min-h-full antialiased bg-white font-sans', geist.variable)}>
      <body className="min-h-full">{children}</body>
    </html>
  );
};

export default RootLayout;
