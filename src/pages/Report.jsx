import { useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { useNavigate } from "react-router-dom";

function Report() {
  const [incidentType, setIncidentType] = useState("");
  const [customType, setCustomType] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const finalType = incidentType === "Other" ? customType : incidentType;

    if (!finalType || !description) {
      setError(
        "Please select or enter an incident type and provide a description."
      );
      setLoading(false);
      return;
    }

    let userLat = null;
    let userLon = null;

    //Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          userLat = position.coords.latitude;
          userLon = position.coords.longitude;

          //Inserts into Supabase with user's location
          const { data, error } = await supabase
            .from("incidents")
            .insert([
              {
                type: finalType,
                description,
                latitude: userLat,
                longitude: userLon,
                created_at: new Date(),
              },
            ])
            .select();

          if (error) {
            setError(error.message);
            setLoading(false);
          } else {
            const incidentId = data[0].id;
            navigate(`/report/location?incidentId=${incidentId}`);
          }
        },
        () => {
          // If geolocation fails, proceeds without location
          setError("Failed to get location. Please select it manually.");
          setLoading(false);
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
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

      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl mx-auto mt-10">
        <h2 className="text-3xl font-bold text-gray-900 text-center">
          Report Incident
        </h2>

        {error && (
          <p className="text-red-500 text-sm text-center mt-2">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* Incident Type */}
          <div>
            <label className="block text-gray-700 font-medium">
              Type of Incident
            </label>
            <div className="flex space-x-2">
              {["Theft", "Assault", "Vandalism", "Other"].map((type) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => setIncidentType(type)}
                  className={`px-4 py-2 border rounded-md ${
                    incidentType === type
                      ? "bg-black text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
            {incidentType === "Other" && (
              <input
                type="text"
                placeholder="Enter incident type"
                value={customType}
                onChange={(e) => setCustomType(e.target.value)}
                className="w-full p-2 border rounded-md mt-2"
                required
              />
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-gray-700 font-medium">
              Description
            </label>
            <textarea
              placeholder="Briefly describe the incident"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 border rounded-md"
              required
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800"
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Report;
