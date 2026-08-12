import { ReactNode } from 'react';
export default function ApplicationLayout({ children }: { children: ReactNode }) {
  return <section>{children}</section>;
}
