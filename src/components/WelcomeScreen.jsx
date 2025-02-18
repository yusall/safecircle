import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import dashboardImg from "../assets/dashboard.png";
import viewIncidentsImg from "../assets/view-incidents.png";
import reportImg from "../assets/report.png";
import notificationsImg from "../assets/notifications.png";
import emergencyImg from "../assets/emergency.png";

function WelcomeScreen() {
  const navigate = useNavigate();
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <header className="fixed top-0 w-full flex justify-between items-center px-12 py-6 bg-white shadow-md z-50">
        <h1
          className="text-2xl font-bold text-gray-900 cursor-pointer"
          onClick={() => navigate("/dashboard")}
        >
          SafeCircle
        </h1>
        <nav className="flex space-x-6 items-center">
          <Link to="/login" className="text-gray-600 hover:text-black text-lg">
            Log in
          </Link>
          <button
            onClick={() => navigate("/register")}
            className="bg-black text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition"
          >
            Start Now
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="text-center mt-40 px-6">
        <motion.h1
          className="text-5xl font-bold text-gray-900 leading-tight max-w-3xl mx-auto"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          Your Trusted Community Safety Network
        </motion.h1>
        <motion.p
          className="text-gray-600 text-lg mt-3 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          Stay informed, report incidents, and ensure safety for your
          neighborhood with SafeCircle.
        </motion.p>
        <motion.button
          onClick={() => navigate("/register")}
          className="mt-6 bg-black text-white px-6 py-3 rounded-lg text-lg font-medium hover:bg-gray-800 transition shadow-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
        >
          Get Started for Free
        </motion.button>
      </main>

      {/*Dashboard Preview*/}
      <div className="w-full mt-12">
        <img
          src={dashboardImg}
          alt="Dashboard Preview"
          className="w-full h-[600px] object-contain"
        />
      </div>

      {/* Features Section */}
      <section className="flex flex-col space-y-36 mt-20">
        {[
          {
            title: "View Reported Incidents",
            description:
              "Browse a live map of reported incidents and stay aware of what's happening around you.",
            image: viewIncidentsImg,
          },
          {
            title: "Report Incidents Instantly",
            description:
              "Quickly report incidents with accurate location data and help keep your community safe.",
            image: reportImg,
            reverse: true,
          },
          {
            title: "Customizable Notifications",
            description:
              "Get alerts based on your preferences, ensuring you stay informed without unnecessary noise.",
            image: notificationsImg,
          },
          {
            title: "Emergency Contacts",
            description:
              "Save emergency contacts and reach them instantly in critical situations.",
            image: emergencyImg,
            reverse: true,
          },
        ].map(({ title, description, image, reverse }, index) => (
          <motion.div
            key={index}
            className={`grid grid-cols-1 md:grid-cols-2 items-center gap-16 px-20 ${
              reverse ? "md:flex-row-reverse" : ""
            }`}
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="text-left max-w-lg">
              <h2 className="text-5xl font-bold">{title}</h2>
              <p className="text-xl text-gray-600 mt-3">{description}</p>
            </div>
            <div className="flex justify-center">
              <img
                src={image}
                alt={title}
                className="w-[700px] h-[400px] object-contain rounded-lg shadow-lg"
              />
            </div>
          </motion.div>
        ))}
      </section>
    </div>
  );
}

export default WelcomeScreen;
