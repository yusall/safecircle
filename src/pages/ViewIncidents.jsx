import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import "leaflet/dist/leaflet.css";

const defaultCenter = [51.5074, -0.1278]; // London location

const OPEN_CAGE_API_KEY = "31b6a722588a499f82c7782508572de8";

function ViewIncidents() {
  const [incidents, setIncidents] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchIncidents() {
      const { data, error } = await supabase
        .from("incidents")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error(" Error fetching incidents:", error.message);
      } else {
        setIncidents(data);
        //  Fetch addresses for all incidents
        data.forEach((incident) => fetchAddress(incident));
      }
      setIsLoading(false);
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([
            position.coords.latitude,
            position.coords.longitude,
          ]);
        },
        () => {
          console.warn("Geolocation denied. Defaulting to London.");
          setUserLocation(defaultCenter);
        }
      );
    } else {
      setUserLocation(defaultCenter);
    }

    fetchIncidents();
  }, []);

  async function fetchAddress(incident) {
    if (!incident.latitude || !incident.longitude) return;

    try {
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${incident.latitude}+${incident.longitude}&key=${OPEN_CAGE_API_KEY}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch address");
      }

      const data = await response.json();
      const address = data.results[0]?.formatted || "Unknown location";

      setIncidents((prev) =>
        prev.map((inc) => (inc.id === incident.id ? { ...inc, address } : inc))
      );
    } catch (error) {
      console.error("Error fetching address:", error.message);
    }
  }

  return (
    <div className="bg-gray-100 min-h-screen">
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

      <div className="max-w-6xl mx-auto bg-white p-8 rounded-lg shadow-md mt-20 mb-10">
        <h1 className="text-3xl font-bold mb-4">View Reported Incidents</h1>
        <p className="text-gray-600 mb-6">
          Browse recent reports and see them mapped below.
        </p>
      </div>

      {isLoading ? (
        <p className="text-center">Loading incidents...</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md overflow-auto max-h-[500px]">
            <h2 className="text-xl font-semibold mb-4">Recent Reports</h2>
            <ul className="space-y-4">
              {incidents.length > 0 ? (
                incidents.map((incident) => (
                  <li key={incident.id} className="p-4 bg-gray-100 rounded-md">
                    <strong>Type:</strong> {incident.type} <br />
                    <strong>Description:</strong> {incident.description} <br />
                    <strong>Address:</strong>{" "}
                    {incident.address || "Fetching..."} <br />
                    <strong>Reported:</strong>{" "}
                    {new Date(incident.created_at).toLocaleString()}
                  </li>
                ))
              ) : (
                <p className="text-gray-500">No incidents reported yet.</p>
              )}
            </ul>
          </div>

          <div className="w-full h-[500px] bg-gray-200 rounded-lg shadow-md">
            <MapContainer
              center={userLocation || defaultCenter}
              zoom={12}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer url="https://tile.jawg.io/jawg-streets/{z}/{x}/{y}{r}.png?access-token=zJS5emp5dXw3nWVO2Su8m68eZMcKalmrcxLqzp9V0JrJvcXWx2V0pUEdWoE1Ripc" />
              {incidents.map(
                (incident) =>
                  incident.latitude &&
                  incident.longitude && (
                    <Marker
                      key={incident.id}
                      position={[incident.latitude, incident.longitude]}
                    >
                      <Popup>
                        <strong>Type:</strong> {incident.type} <br />
                        <strong>Description:</strong> {incident.description}{" "}
                        <br />
                        <strong>Address:</strong>{" "}
                        {incident.address || "Fetching..."} <br />
                        <strong>Reported:</strong>{" "}
                        {new Date(incident.created_at).toLocaleString()}
                      </Popup>
                    </Marker>
                  )
              )}
            </MapContainer>
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewIncidents;
