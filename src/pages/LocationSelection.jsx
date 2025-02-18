import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import "leaflet/dist/leaflet.css";

// Default London location
const defaultCenter = [51.5074, -0.1278];

function LocationSelection() {
  const [markerPosition, setMarkerPosition] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const incidentId = searchParams.get("incidentId");

  // Fetch user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userCoords = [
            position.coords.latitude,
            position.coords.longitude,
          ];
          setUserLocation(userCoords);
          setMarkerPosition(userCoords);
        },
        () => {
          console.warn("Geolocation denied. Defaulting to London.");
          setUserLocation(defaultCenter);
          setMarkerPosition(defaultCenter);
        }
      );
    } else {
      setUserLocation(defaultCenter);
      setMarkerPosition(defaultCenter);
    }
  }, []);

  // Handle user clicks to set marker position
  function MapClickHandler() {
    useMapEvents({
      click: (e) => {
        const newPosition = [e.latlng.lat, e.latlng.lng];
        console.log("Marker position updated to:", newPosition);
        setMarkerPosition(newPosition);
      },
    });
    return null;
  }

  // Save selected location to Supabase
  const handleConfirm = async () => {
    if (!incidentId) {
      alert("Error: No incident found. Please report again.");
      navigate("/dashboard");
      return;
    }
    if (!markerPosition) {
      alert("Please select a location before confirming.");
      return;
    }

    console.log("Saving location to Supabase:", {
      latitude: markerPosition[0],
      longitude: markerPosition[1],
    });

    const { error } = await supabase
      .from("incidents")
      .update({
        latitude: markerPosition[0],
        longitude: markerPosition[1],
      })
      .eq("id", incidentId);

    if (error) {
      console.error("Failed to save location:", error);
      alert("Failed to save location. Try again.");
    } else {
      console.log("Location successfully saved in Supabase!");
      alert("Location saved successfully!");
      navigate("/view-incidents");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-2xl font-bold">Select Incident Location</h1>
      <p className="text-gray-600 mb-4">
        Click on the map to set the location.
      </p>

      {userLocation && (
        <MapContainer
          center={userLocation}
          zoom={13}
          style={{ height: "500px", width: "100%" }}
        >
          <TileLayer url="https://tile.jawg.io/jawg-streets/{z}/{x}/{y}{r}.png?access-token=zJS5emp5dXw3nWVO2Su8m68eZMcKalmrcxLqzp9V0JrJvcXWx2V0pUEdWoE1Ripc" />
          <MapClickHandler />
          {markerPosition && <Marker position={markerPosition} />}
        </MapContainer>
      )}

      <button
        onClick={handleConfirm}
        className="mt-4 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
      >
        Confirm Location
      </button>
    </div>
  );
}

export default LocationSelection;
