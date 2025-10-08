'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateServiceRequestPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    customer_name: '',
    customer_mobile: '',
    vehicle_type: 'car',
    vehicle_model: '',
    registration_no: '',
    issue_description: '',
    assigned_engineer_id: '',
    customer_district: '',
    customer_address: ''
  });
  const [engineers, setEngineers] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    if (!token) return router.push('/login');

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.role !== 'admin') return router.push('/unauthorized');
    } catch {
      return router.push('/login');
    }

    // Fetch engineers
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/service/engineers`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'include'
    })
      .then(async res => {
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          setEngineers(data.engineers || []);
        } catch {
          console.error('Engineer fetch failed:', text);
        }
      })
      .catch(err => console.error('Engineer fetch error:', err));
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage('');

    const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    if (!token) return setMessage('Missing token');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/service/create-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(form),
        credentials: 'include'
      });

      const text = await res.text();
      console.log('Raw response:', text);

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        setMessage('Server error');
        return;
      }

      if (res.ok) {
        setMessage(`Service request created with ID: ${data.requestId}`);
        setForm({
          customer_name: '',
          customer_mobile: '',
          vehicle_type: 'car',
          vehicle_model: '',
          registration_no: '',
          issue_description: '',
          assigned_engineer_id: '',
          customer_district: '',
          customer_address: ''
        });
      } else {
        setMessage(data.error || 'Failed to create request');
      }
    } catch (err) {
      console.error('Submit error:', err);
      setMessage('Server error');
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Create Service Request</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="customer_name"
          placeholder="Customer Name"
          value={form.customer_name}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          name="customer_mobile"
          placeholder="Mobile Number"
          value={form.customer_mobile}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />
        <select
          name="vehicle_type"
          value={form.vehicle_type}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        >
          <option value="car">Car</option>
          <option value="bike">Bike</option>
        </select>
        <input
          type="text"
          name="vehicle_model"
          placeholder="Vehicle Model"
          value={form.vehicle_model}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          name="registration_no"
          placeholder="Registration Number"
          value={form.registration_no}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />
        <textarea
          name="issue_description"
          placeholder="Issue Description"
          value={form.issue_description}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <select
          name="assigned_engineer_id"
          value={form.assigned_engineer_id}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        >
          <option value="">Select Engineer</option>
          {engineers.map(e => (
            <option key={e.id} value={e.id}>{e.name}</option>
          ))}
        </select>
        <input
          type="text"
          name="customer_district"
          placeholder="Customer District"
          value={form.customer_district}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />
        <textarea
          name="customer_address"
          placeholder="Customer Address"
          value={form.customer_address}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          Create Request
        </button>
       </form>
      {message && <p className="mt-4 text-sm text-red-600">{message}</p>}
    </div>
  );
}