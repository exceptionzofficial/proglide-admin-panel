import React from 'react';

const Dashboard = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <div className="w-24 h-24 bg-[rgb(157,71,10)] rounded-3xl flex items-center justify-center mb-6 shadow-2xl rotate-12">
        <span className="text-white text-4xl font-bold">P</span>
      </div>
      <h1 className="text-4xl font-bold text-gray-800 mb-2">Welcome to Pro-glide Admin</h1>
      <p className="text-gray-500 max-w-md">Select a category from the sidebar to manage your mobile app inventory and view user details.</p>
    </div>
  );
};

export default Dashboard;