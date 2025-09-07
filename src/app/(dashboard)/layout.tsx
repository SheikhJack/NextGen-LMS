import Layout from '@/components/Layout';
import { ClerkProvider } from '@clerk/nextjs';

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <Layout>
        {children}
      </Layout>
  )
}


