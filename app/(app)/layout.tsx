import { verifySession } from "@/lib/auth/dal";
import { AppHeader } from "@/components/AppHeader";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await verifySession();

  return (
    <div className="flex flex-1 flex-col">
      <AppHeader />
      <main className="flex-1 w-full max-w-2xl mx-auto p-4">{children}</main>
    </div>
  );
}
