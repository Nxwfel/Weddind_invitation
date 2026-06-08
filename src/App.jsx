import React from 'react';
import { Routes, Route } from 'react-router-dom';
import InvitationCard from './guest/InvitationCard';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<InvitationCard />} />
      <Route path="*" element={<InvitationCard />} />
    </Routes>
  );
}