import AdminLayoutComponent from '@/components/admin/AdminLayout'

export default function AdminRouteLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutComponent>{children}</AdminLayoutComponent>
}
