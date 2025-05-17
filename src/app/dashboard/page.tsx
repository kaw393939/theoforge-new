'use client'

import React, { useContext } from 'react';
import { AuthContext } from '@/components/Dashboard/AppContext';
import UserDashboard from '@/components/Dashboard/UserDashboard';
import AdminDashboard from '@/components/Dashboard/AdminDashboard';

// Main Dashboard Component
export default function Dashboard() {
  const { user } = useContext(AuthContext);
  return (
    <>
      {user?.role === "ADMIN" ? <AdminDashboard /> : <UserDashboard />}
    </>
  )
}