import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "./utils/supabaseClient";
import WelcomeScreen from "./components/WelcomeScreen";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import Report from "./pages/Report";
import LocationSelection from "./pages/LocationSelection";
import ViewIncidents from "./pages/ViewIncidents";
import Notifications from "./pages/Notifications";
import ResetPassword from "./components/ResetPassword";
import EmergencyContacts from "./pages/EmergencyContacts";
import EditEmergencyContact from "./pages/EditEmergencyContact";

const VAPID_PUBLIC_KEY =
  "BMLDaj3FcHNwvk0JlWf1l9vMq89nnFZobiaLo8T_ztsmcIaVmcsxCnlbMzq0HVoRy8McuZZK3rk2jFSR4BRyoAk";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return new Uint8Array([...rawData].map((char) => char.charCodeAt(0)));
}

function App() {
  const [user, setUser] = useState(null);
  const [preferences, setPreferences] = useState(null);

  useEffect(() => {
    async function fetchUser() {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        console.error("Error fetching user:", error?.message);
        return;
      }

      setUser(user);

      const { data: prefData, error: prefError } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (prefError || !prefData) {
        console.warn("Preferences not found, creating defaults...");
        const { data: insertedData, error: insertError } = await supabase
          .from("notification_preferences")
          .insert([
            {
              user_id: user.id,
              types: ["Theft", "Assault", "Vandalism"],
              frequency: "medium",
            },
          ])
          .select()
          .single();

        if (insertError) {
          console.error(
            "Failed to insert default preferences:",
            insertError.message
          );
        } else {
          setPreferences(insertedData);
        }
      } else {
        setPreferences(prefData);
      }
    }

    fetchUser();
  }, []);

  //Register service worker and request push notifications
  useEffect(() => {
    async function requestNotificationPermission() {
      if (!("Notification" in window) || !("serviceWorker" in navigator)) {
        console.warn("Push notifications not supported on this browser.");
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        console.warn("Notifications blocked.");
        return;
      }

      console.log("Notifications enabled!");

      // Register service worker
      try {
        const registration = await navigator.serviceWorker.register(
          "/serviceWorker.js"
        );
        console.log("Service Worker Registered:", registration);

        //Subscribe to push notifications
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });

        console.log("Push Subscription:", JSON.stringify(subscription));
      } catch (error) {
        console.error("Push Subscription Failed:", error);
      }
    }

    requestNotificationPermission();
  }, []);

  //Listen for new notifications
  useEffect(() => {
    if (!user || !preferences) return;

    console.log("Listening for incident notifications...");

    const subscription = supabase
      .channel("incident_notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "incidents" },
        (payload) => {
          console.log("New Incident Detected:", payload);

          const incident = payload.new;
          if (!preferences.types.includes(incident.type)) return;

          if (navigator.serviceWorker) {
            navigator.serviceWorker.ready.then((registration) => {
              registration.showNotification("New Incident Reported", {
                body: `${incident.type} - ${incident.description}`,
                icon: "/notification-icon.png",
                vibrate: [200, 100, 200],
                data: { url: "/view-incidents" },
                requireInteraction: true,
              });
            });
          }
        }
      )
      .subscribe();

    console.log("Subscribed to Supabase notifications", subscription);

    return () => {
      console.log("Unsubscribing from notifications...");
      supabase.removeChannel(subscription);
    };
  }, [user, preferences]);

  //Handle notification clicks
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("notificationclick", (event) => {
        event.notification.close();
        if (event.notification.data?.url) {
          window.location.href = event.notification.data.url;
        }
      });
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomeScreen />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        {user ? (
          <>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/report" element={<Report />} />
            <Route path="/report/location" element={<LocationSelection />} />
            <Route path="/view-incidents" element={<ViewIncidents />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/emergency-contacts" element={<EmergencyContacts />} />
            <Route
              path="/edit-emergency-contact"
              element={<EditEmergencyContact />}
            />
          </>
        ) : (
          <Route path="*" element={<Login />} />
        )}
      </Routes>
    </Router>
  );
}

export default App;
