export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
          <h1 className="text-xl font-bold text-blue-600">AutoServ</h1>
          <p className="text-sm text-gray-600 mt-1 sm:mt-0">
            <span className="font-medium">Car Service:</span> 1800-266-0301 customer.help@mytvs.in &nbsp;|&nbsp;
            <span className="font-medium">Car Accessories:</span> 80 1024 1024 help@myTVS.com
          </p>
        </div>
        <nav className="space-x-4 mt-2 sm:mt-0">
          <a href="#" className="text-gray-700 hover:text-blue-600">Home</a>
          <a href="#" className="text-gray-700 hover:text-blue-600">Services</a>
          <a href="#" className="text-gray-700 hover:text-blue-600">Login</a>
        </nav>
      </div>
    </header>
  );
}