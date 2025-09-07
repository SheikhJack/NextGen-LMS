"use client";

import { useState } from 'react';
import Menu from '../Menu';
import Navbar from '../Navbar';
import Link from 'next/link';
import Image from 'next/image';

const DashboardLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div className="h-screen flex">
      {/* LEFT SIDEBAR */}
      <div 
        className={`transition-all duration-300 ease-in-out ${collapsed ? 'w-[80px]' : 'w-[200px]'} p-2 bg-white border-r border-gray-200`}
      >
        <div className="flex justify-center">
          <Link href="/">
            {collapsed ? (
              <Image src="/logo.png" alt="logo" width={70} height={70} />
            ) : (
              <Image src="/logo.png" alt="logo" width={150} height={150} />
            )}
          </Link>
        </div>
        <Menu collapsed={collapsed} />
      </div>

      {/* RIGHT CONTENT AREA */}
      <div className="flex-1 bg-[#F7F8FA] overflow-auto flex flex-col">
        <Navbar collapsed={collapsed} toggleCollapse={toggleCollapse} />
        <main className="flex-1 p-2 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;