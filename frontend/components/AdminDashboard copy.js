'use client';
import { useEffect, useState } from 'react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    vehicle_type: '',
    engineer_id: '',
    district: ''
  });
  const [engineerList, setEngineerList] = useState([]);
  const [districtList, setDistrictList] = useState([]);

  const limit = 10;

  const handleFilterChange = e => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setPage(1); // reset to first page on filter change
  };

  useEffect(() => {
    async function fetchStats() {
      const query = new URLSearchParams({
        page,
        limit,
        ...filters
      }).toString();

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/servicestats?${query}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        const text = await res.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch {
          console.error('Invalid JSON:', text);
          setStats({ totalRevenue: 0, requests: [], totalPages: 1 });
          return;
        }

        setStats(data);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
        setStats({ totalRevenue: 0, requests: [], totalPages: 1 });
      }
    }

    fetchStats();
  }, [page, filters]);

  useEffect(() => {
    async function fetchFilters() {
      const token = localStorage.getItem('token');
      const [engRes, distRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/engineers`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/districts`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const engData = await engRes.json();
      const distData = await distRes.json();

      setEngineerList(engData.engineers || []);
      setDistrictList(distData.districts || []);
    }

    fetchFilters();
  }, []);


  if (!stats) return <p className="text-center py-10">Loading dashboard...</p>;

  // Chart data prep
  const chartData = (stats?.requests || []).reduce((acc, r) => {
  acc[r.vehicle_type] = (acc[r.vehicle_type] || 0) + r.commission_amount;
  return acc;
  }, {});

  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      <h2 className="text-2xl font-bold mb-6">Admin Dashboard</h2>

      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <p className="text-lg font-semibold mb-2">Total Revenue: ₹{stats.totalRevenue}</p>

        <div className="flex flex-wrap gap-4">
          <select name="vehicle_type" value={filters.vehicle_type} onChange={handleFilterChange}
            className="p-2 border rounded">
            <option value="">All Vehicles</option>
            <option value="car">Car</option>
            <option value="bike">Bike</option>
          </select>
          <select name="engineer_id" value={filters.engineer_id} onChange={handleFilterChange} className="p-2 border rounded">
            <option value="">All Engineers</option>
            {engineerList.map(e => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>

          <select name="district" value={filters.district} onChange={handleFilterChange} className="p-2 border rounded">
            <option value="">All Districts</option>
            {districtList.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto mb-6">
        <table className="min-w-full bg-white shadow-md rounded-lg">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="px-4 py-2 text-left">Customer</th>
              <th className="px-4 py-2 text-left">Mobile</th>
              <th className="px-4 py-2 text-left">District</th>
              <th className="px-4 py-2 text-left">Address</th>
              <th className="px-4 py-2 text-left">Vehicle</th>
              <th className="px-4 py-2 text-left">Model</th>
              <th className="px-4 py-2 text-left">Reg. No</th>
              <th className="px-4 py-2 text-left">Issue</th>
              <th className="px-4 py-2 text-left">Engineer</th>
              <th className="px-4 py-2 text-left">Commission</th>
              <th className="px-4 py-2 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {stats?.requests?.length > 0 ? (
              stats.requests.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="px-4 py-2">{r.customer_name}</td>
                  <td className="px-4 py-2">{r.customer_mobile}</td>
                  <td className="px-4 py-2">{r.customer_district}</td>
                  <td className="px-4 py-2">{r.customer_address}</td>
                  <td className="px-4 py-2">{r.vehicle_type}</td>
                  <td className="px-4 py-2">{r.vehicle_model}</td>
                  <td className="px-4 py-2">{r.registration_no}</td>
                  <td className="px-4 py-2">{r.issue_description}</td>
                  <td className="px-4 py-2">{r.engineer_name}</td>
                  <td className="px-4 py-2">₹{r.commission_amount}</td>
                  <td className="px-4 py-2">{new Date(r.created_at).toLocaleString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="11" className="px-4 py-6 text-center text-gray-500">
                  No service requests found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center items-center gap-4 mb-10">
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
        >
          Previous
        </button>
        <span className="font-semibold">Page {page} of {stats.totalPages}</span>
        <button
          onClick={() => setPage(p => Math.min(stats.totalPages, p + 1))}
          disabled={page === stats.totalPages}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
        >
          Next
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Revenue by Vehicle Type</h3>
        <div className="flex gap-6">
          {Object.entries(chartData).map(([type, amount]) => (
            <div key={type} className="text-center">
              <div className="h-24 w-10 bg-green-500 rounded" style={{ height: `${amount / 10}px` }}></div>
              <p className="mt-2 font-medium">{type}</p>
              <p className="text-sm text-gray-600">₹{amount}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}