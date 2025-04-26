import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { useNavigate } from "react-router-dom";

function Notifications() {
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [alertFrequency, setAlertFrequency] = useState(2);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchPreferences() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      let { data, error } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!error && data) {
        setSelectedTypes(data.types);
        setAlertFrequency(
          data.frequency === "low" ? 1 : data.frequency === "medium" ? 2 : 3
        );
      }
    }
    fetchPreferences();
  }, []);

  const handleTypeToggle = (type) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleSave = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const frequency =
      alertFrequency === 1 ? "low" : alertFrequency === 2 ? "medium" : "high";

    const { error } = await supabase
      .from("notification_preferences")
      .upsert({ user_id: user.id, types: selectedTypes, frequency });

    if (error) {
      console.error("Failed to save preferences:", error);
    } else {
      alert("Preferences saved!");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Top Navigation */}
      <header className="w-full flex justify-between items-center bg-white shadow-md p-6">
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
      <div className="flex flex-col items-center justify-center p-8">
        <h1 className="text-3xl font-bold mb-6">🔔 Customize Notifications</h1>

        <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-lg">
          {/* Notification Type */}
          <h2 className="text-lg font-semibold mb-4">
            Select Notification Type
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {["Theft", "Assault", "Vandalism", "Other"].map((type) => (
              <button
                key={type}
                onClick={() => handleTypeToggle(type)}
                className={`px-4 py-3 text-sm rounded-lg font-semibold text-center border transition-all
                  ${
                    selectedTypes.includes(type)
                      ? "bg-black text-white"
                      : "border-gray-300 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Alert Frequency */}
          <h2 className="text-lg font-semibold mt-6 mb-3">
            Set Alert Frequency
          </h2>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>🔕 Low</span>
            <span>🔉 Medium</span>
            <span>🔊 High</span>
          </div>

          {/* Custom Range Slider */}
          <input
            type="range"
            min="1"
            max="3"
            value={alertFrequency}
            onChange={(e) => setAlertFrequency(parseInt(e.target.value))}
            className="w-full mt-3 appearance-none h-2 bg-gray-300 rounded-lg cursor-pointer transition-all focus:ring-2 focus:ring-gray-500"
            style={{
              accentColor: "#000", // Black color slider
            }}
          />

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="mt-6 w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}

export default Notifications;
