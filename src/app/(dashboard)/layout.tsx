import { Header, Sidebar, AnnouncementBar } from '@/components/layout';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg-primary">
      <AnnouncementBar />
      <Header />
      <Sidebar />
      <main className="ml-sidebar pt-16 min-h-[calc(100vh-4rem)]">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
