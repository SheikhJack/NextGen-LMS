"use client";

import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import Header from './Header';

const Navbar = ({ collapsed, toggleCollapse }: { 
  collapsed: boolean; 
  toggleCollapse: () => void 
}) => {
  return (
    <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
      {/* Left side - Collapse button */}
      <button 
        onClick={toggleCollapse}
        className="text-gray-600 hover:text-gray-900"
      >
        {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
      </button>

      {/* Header component - takes up remaining space */}
      <div className="flex-1">
        <Header collapsed={collapsed} toggle={toggleCollapse} />
      </div>
    </div>
  );
};

export default Navbar;