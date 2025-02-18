import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import { useNavigate } from "react-router-dom";

function EditEmergencyContact() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
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
        .maybeSingle();

      if (!error && data) {
        console.log("Emergency contact loaded:", data);
        setName(data.name);
        setPhone(data.phone);
      }
    }

    fetchContact();
  }, []);

  async function handleSave() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // delete any existing contact for the user
    await supabase.from("user_contacts").delete().eq("user_id", user.id);

    // insert the new contact
    const { error } = await supabase
      .from("user_contacts")
      .insert([{ user_id: user.id, name, phone }]);

    if (error) {
      alert("Failed to save contact");
      return;
    }

    alert("Contact saved!");
    navigate("/emergency-contacts");
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        Edit Emergency Contact
      </h1>
      <p className="text-gray-600 mb-6">
        Enter details for your emergency contact.
      </p>

      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full max-w-md p-3 border rounded-lg mb-4"
      />

      <input
        type="tel"
        placeholder="Phone Number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="w-full max-w-md p-3 border rounded-lg mb-4"
      />

      <button
        onClick={handleSave}
        className="w-full max-w-md bg-green-500 text-white font-bold py-3 rounded-lg mb-4"
      >
        Save Contact
      </button>

      <button
        onClick={() => navigate("/emergency-contacts")}
        className="w-full max-w-md bg-gray-600 text-white font-bold py-3 rounded-lg"
      >
        Cancel
      </button>
    </div>
  );
}

export default EditEmergencyContact;
