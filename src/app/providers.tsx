'use client';

import React from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  return <div className="dark text-foreground bg-[#0d1117] min-h-screen">{children}</div>;
}
