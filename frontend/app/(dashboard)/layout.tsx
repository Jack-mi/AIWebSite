import { UserProvider } from '@auth0/nextjs-auth0/client'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <UserProvider>
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    </UserProvider>
  )
}