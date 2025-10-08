'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateEngineerPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    service_area: '',
    deposit: ''
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    if (!token) return router.push('/login');

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.role !== 'admin') router.push('/unauthorized');
    } catch {
      router.push('/login');
    }
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage('');

    const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/create-engineer`, {
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
        setMessage(`Engineer created with ID: ${data.engineerId}`);
        setForm({
          name: '',
          email: '',
          phone: '',
          password: '',
          service_area: '',
          deposit: ''
        });
      } else {
        setMessage(data.error || 'Failed to create engineer');
      }
    } catch (err) {
      console.error('Submit error:', err);
      setMessage('Server error');
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Create Service Engineer</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          name="phone"
          placeholder="Phone"
          value={form.phone}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          name="service_area"
          placeholder="Service Area"
          value={form.service_area}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />
        <input
          type="number"
          name="deposit"
          placeholder="Subscription Fee"
          value={form.deposit}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Create Engineer
        </button>
      </form>
      {message && <p className="mt-4 text-sm text-red-600">{message}</p>}
    </div>
  );
}