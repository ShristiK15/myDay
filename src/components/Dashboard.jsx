import React from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl text-black font-bold mb-8">My Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl">
        
        {/* Calendar View */}
        <div
          onClick={() => navigate("/allposts")}
          className="bg-white shadow-lg  rounded-2xl p-6 text-center cursor-pointer hover:shadow-xl transition"
        >
          <h2 className="text-xl text-black font-semibold mb-2">📅 All Posts</h2>
          <p className="text-gray-500">Browse and reflect on past entries.</p>
        </div>

        {/* Entry Form */}
        <div
          onClick={() => navigate("/journalForm")}
          className="bg-white shadow-lg rounded-2xl p-6 text-center cursor-pointer hover:shadow-xl transition"
        >
          <h2 className="text-xl text-black font-semibold mb-2">📝 Journal Entry</h2>
          <p className="text-gray-500">Write about your day and upload a photo.</p>
        </div>

        {/* Mood Tracker */}
        <div
          onClick={() => navigate("/moodTracker")}
          className="bg-white shadow-lg rounded-2xl p-6 text-center cursor-pointer hover:shadow-xl transition"
        >
          <h2 className="text-xl text-black font-semibold mb-2">😊 Mood Tracker</h2>
          <p className="text-gray-500">Track your mood patterns over time.</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
