import { Header, Sidebar, AnnouncementBar, Footer } from '@/components/layout';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <AnnouncementBar />
      <Header />
      <Sidebar />
      <main className="ml-sidebar pt-16 flex-1">
        <div className="p-6">
          {children}
        </div>
      </main>
      <div className="ml-sidebar">
        <Footer />
      </div>
    </div>
  );
}
