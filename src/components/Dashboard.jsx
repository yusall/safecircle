import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data, error }) => {
      if (error) {
        console.error("Error fetching user:", error.message);
      } else {
        setUser(data.user);
      }
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (!user) {
    return <p className="text-center mt-20 text-lg">Loading...</p>;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar Navigation */}
      <aside className="w-72 bg-white shadow-lg h-screen p-6 flex flex-col">
        <h2
          className="text-3xl font-extrabold text-gray-900 cursor-pointer hover:text-gray-700 transition"
          onClick={() => navigate("/dashboard")}
        >
          SafeCircle
        </h2>
        <nav className="mt-8 flex flex-col space-y-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-gray-800 font-semibold py-3 px-6 rounded-md hover:bg-gray-200 transition"
          >
            🏠 Home
          </button>
          <button
            onClick={() => navigate("/report")}
            className="text-gray-800 font-semibold py-3 px-6 rounded-md hover:bg-gray-200 transition"
          >
            🚨 Report Incident
          </button>
          <button
            onClick={() => navigate("/view-incidents")}
            className="text-gray-800 font-semibold py-3 px-6 rounded-md hover:bg-gray-200 transition"
          >
            📋 View Incidents
          </button>
          <button
            onClick={() => navigate("/notifications")}
            className="text-gray-800 font-semibold py-3 px-6 rounded-md hover:bg-gray-200 transition"
          >
            🔔 Customize Notifications
          </button>
          <button
            onClick={() => navigate("/emergency-contacts")}
            className="text-gray-800 font-semibold py-3 px-6 rounded-md hover:bg-gray-200 transition"
          >
            📞 Emergency Contacts
          </button>
        </nav>
        <button
          onClick={handleLogout}
          className="mt-auto text-red-600 font-semibold py-3 px-6 rounded-md hover:bg-red-100 transition"
        >
          🚪 Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-12">
        <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2 text-lg">Welcome, {user.email}</p>

        {/* Grid Layout for Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mt-8">
          {/* Report an Incident */}
          <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center hover:shadow-xl transition">
            <h3 className="text-xl font-semibold text-gray-900">
              🚨 Report an Incident
            </h3>
            <p className="text-gray-600 mt-2 text-center">
              Report any safety incidents happening in your neighborhood.
            </p>
            <button
              onClick={() => navigate("/report")}
              className="mt-4 bg-black text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 transition"
            >
              Report Now
            </button>
          </div>

          {/* View Reported Incidents */}
          <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center hover:shadow-xl transition">
            <h3 className="text-xl font-semibold text-gray-900">
              📋 View Incidents
            </h3>
            <p className="text-gray-600 mt-2 text-center">
              Browse through the latest reported incidents in your area.
            </p>
            <button
              onClick={() => navigate("/view-incidents")}
              className="mt-4 bg-black text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 transition"
            >
              View Reports
            </button>
          </div>

          {/* Customize Notifications */}
          <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center hover:shadow-xl transition">
            <h3 className="text-xl font-semibold text-gray-900">
              🔔 Customize Notifications
            </h3>
            <p className="text-gray-600 mt-2 text-center">
              Adjust your notification preferences and alert frequency.
            </p>
            <button
              onClick={() => navigate("/notifications")}
              className="mt-4 bg-black text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 transition"
            >
              Customize
            </button>
          </div>

          {/* Emergency Contacts Section */}
          <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center hover:shadow-xl transition">
            <h3 className="text-xl font-semibold text-gray-900">
              📞 Emergency Contacts
            </h3>
            <p className="text-gray-600 mt-2 text-center">
              Quick access to emergency numbers and your personal emergency
              contact.
            </p>
            <button
              onClick={() => navigate("/emergency-contacts")}
              className="mt-4 bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 transition"
            >
              View Emergency Contacts
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
