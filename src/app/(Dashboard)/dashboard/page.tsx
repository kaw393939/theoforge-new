'use client'

import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '@/components/Dashboard/AppContext';
import UserDashboard from '@/components/Dashboard/UserDashboard';
import AdminDashboard from '@/components/Dashboard/AdminDashboard';

type Role = 'USER' | 'ADMIN';

// Main Dashboard Component
export default function Dashboard() {
  const { role } = useContext(AuthContext);
  const [switchRole, setSwitchRole] = useState<Role>(role);
  useEffect(() => {
    addEventListener('switch', function(event: any) {
      setSwitchRole(event.detail);
    });
  }, []);
  return (
    <>
    {switchRole === "ADMIN" ? <AdminDashboard /> : <UserDashboard />}
    </>
  )
}

