export default function ServiceCards() {
  const services = [
    { title: 'Car Service', description: 'Periodic maintenance, AC, battery & more', icon: '🚗' },
    { title: 'Bike Service', description: 'Engine tuning, brakes, chain & more', icon: '🏍️' },
  ];

  return (
    <section className="py-12 px-4 max-w-6xl mx-auto">
      <h3 className="text-2xl font-bold text-center mb-8">Our Services</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {services.map((s, idx) => (
          <div key={idx} className="bg-white shadow-md rounded-lg p-6 text-center hover:shadow-lg transition">
            <div className="text-5xl mb-4">{s.icon}</div>
            <h4 className="text-xl font-semibold mb-2">{s.title}</h4>
            <p className="text-gray-600">{s.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}