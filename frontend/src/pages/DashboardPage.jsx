import React from 'react';

import Navbar from '../components/Navbar';

import VitalsCard from '../components/VitalsCard';

import ChatBox from '../components/ChatBox';



export default function DashboardPage() {

  return (

    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/20 to-blue-50/30 flex flex-col font-sans">

      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        <VitalsCard />

        <ChatBox />

      </main>

    </div>

  );
}