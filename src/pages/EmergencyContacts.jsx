import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { useNavigate } from "react-router-dom";

function EmergencyContacts() {
  const [emergencyContact, setEmergencyContact] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchContact() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("user_contacts")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Error fetching emergency contact:", error.message);
        return;
      }

      if (!data) {
        console.warn("No emergency contact found.");
        setEmergencyContact(null);
      } else {
        console.log("Emergency contact loaded:", data);
        setEmergencyContact(data);
      }
    }

    fetchContact();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation Bar */}
      <header className="w-full bg-white shadow-md p-6 flex justify-between items-center">
        <h1
          className="text-2xl font-bold text-gray-900 cursor-pointer"
          onClick={() => navigate("/dashboard")}
        >
          SafeCircle
        </h1>
        <div>
          <button
            onClick={() => navigate("/dashboard")}
            className="text-gray-600 hover:text-black mr-4"
          >
            Return to Home
          </button>
          <button
            onClick={() => window.location.reload()}
            className="text-gray-600 hover:text-black"
          >
            Refresh
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md mt-12">
        <h1 className="text-3xl font-bold mb-4">Emergency Contacts</h1>
        <p className="text-gray-600 mb-6">
          Quick access to emergency services and personal emergency contacts.
        </p>

        {/* Emergency Services */}
        <div className="bg-gray-200 p-6 rounded-lg shadow-sm mb-6">
          <h2 className="text-xl font-semibold mb-2">Emergency Services</h2>
          <button
            className="w-full bg-red-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-red-700 transition"
            onClick={() => (window.location.href = "tel:999")}
          >
            🚑👮🚨 Call Emergency Services (999)
          </button>
          <button
            className="w-full mt-3 bg-blue-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-blue-700 transition"
            onClick={() => (window.location.href = "tel:111")}
          >
            🩺 Call Non-Emergency (111)
          </button>
        </div>

        {/* Personal Emergency Contact */}
        <div className="bg-gray-200 p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-2">Your Emergency Contact</h2>
          {emergencyContact ? (
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <p className="text-lg font-medium">👤 {emergencyContact.name}</p>
              <p className="text-gray-600">📞 {emergencyContact.phone}</p>
              <button
                className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700 transition"
                onClick={() =>
                  (window.location.href = `tel:${emergencyContact.phone}`)
                }
              >
                📞 Call {emergencyContact.name}
              </button>
            </div>
          ) : (
            <p className="text-gray-600">No emergency contact saved.</p>
          )}
          <button
            onClick={() => navigate("/edit-emergency-contact")}
            className="mt-4 w-full bg-black text-white py-2 rounded-lg font-bold hover:bg-gray-800 transition"
          >
            ✏️ Edit Emergency Contact
          </button>
        </div>
      </div>
    </div>
  );
}

export default EmergencyContacts;
