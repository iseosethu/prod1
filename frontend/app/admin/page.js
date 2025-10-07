import AdminDashboard from '../../components/AdminDashboard';
import LogoutButton from '../../components/LogoutButton';

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-800">
      <div className="flex justify-between items-center px-4 py-6">
        {/*<h1 className="text-2xl font-bold">Admin Dashboard</h1> */}
        <LogoutButton />
      </div>
      <AdminDashboard />
    </main>
  );
}