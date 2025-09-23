"use client"

import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useState } from "react";
import { 
  LayoutDashboard, 
  CreditCard, 
  DollarSign, 
  Receipt, 
  FileText, 
  BarChart3, 
  Settings,
  ChevronDown,
  ChevronRight,
  Users,
  BookOpen,
  GraduationCap,
  UserCircle,
  Calendar,
  MessageSquare,
  Bell,
  ClipboardList,
  FileCheck,
  BarChart,
  Cog,
  LogOut
} from "lucide-react";

const menuItems = [
  {
    title: "MENU",
    items: [
      {
        icon: LayoutDashboard,
        label: "Dashboard",
        href: "/admin",
        visible: ["admin"],
      },
      {
        icon: ClipboardList,
        label: "Admissions",
        href: "/list/admissions",
        visible: ["admin", "teacher"],
      },
      {
        icon: Users,
        label: "Teachers",
        href: "/list/teachers",
        visible: ["admin", "teacher"],
      },
      {
        icon: GraduationCap,
        label: "Students",
        href: "/list/students",
        visible: ["admin", "teacher"],
      },
      {
        icon: UserCircle,
        label: "Parents",
        href: "/list/parents",
        visible: ["admin", "teacher"],
      },
      {
        icon: BookOpen,
        label: "Subjects",
        href: "/list/subjects",
        visible: ["admin"],
      },
      {
        icon: Users,
        label: "Classes",
        href: "/list/classes",
        visible: ["admin", "teacher"],
      },
      {
        icon: BookOpen,
        label: "Lessons",
        href: "/list/lessons",
        visible: ["admin", "teacher"],
      },
      {
        icon: DollarSign, 
        label: "Finance",
        href: "/list/finance",
        visible: ["admin"],
        subItems: [
          {
            label: "Fee Structure",
            href: "/list/finance/fees",
            icon: CreditCard
          },
          {
            label: "Payments",
            href: "/list/finance/payments",
            icon: DollarSign
          },
          {
            label: "Expenses",
            href: "/list/finance/expenses",
            icon: Receipt
          },
          {
            label: "Invoices",
            href: "/list/finance/invoices",
            icon: FileText
          },
          {
            label: "Reports",
            href: "/list/finance/reports",
            icon: BarChart3
          },
          {
            label: "Settings",
            href: "/list/finance/settings",
            icon: Settings
          }
        ]
      },
      {
        icon: FileText,
        label: "Posts",
        href: "/list/posts",
        visible: ["admin", "teacher", "parents"],
      },
      {
        icon: FileCheck,
        label: "Exams",
        href: "/list/exams",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: ClipboardList,
        label: "Assignments",
        href: "/list/assignments",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: BarChart,
        label: "Results",
        href: "/list/results",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: Users,
        label: "Attendance",
        href: "/list/attendance",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: Calendar,
        label: "Events",
        href: "/list/events",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: MessageSquare,
        label: "Messages",
        href: "/list/messages",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: Bell,
        label: "Announcements",
        href: "/list/announcements",
        visible: ["admin", "teacher", "student", "parent"],
      },
    ],
  },
  {
    title: "OTHER",
    items: [
      {
        icon: UserCircle,
        label: "Profile",
        href: "/profile",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: Cog,
        label: "Settings",
        href: "/settings",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: LogOut,
        label: "Logout",
        href: "/logout",
        visible: ["admin", "teacher", "student", "parent"],
      },
    ],
  },
];

const Menu = ({ collapsed }: { collapsed: boolean }) => {
  const { isLoaded, isSignedIn, user } = useUser();
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);

  if (!isLoaded || !isSignedIn || !user) {
    return null;
  }

  const role = (user as any)?.publicMetadata?.role;

  const toggleSubMenu = (label: string) => {
    setOpenSubMenu(openSubMenu === label ? null : label);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Menu header (if you have one) would go here */}
      
      {/* Scrollable menu content */}
      <div className="flex-1 overflow-y-auto">
        <div className="mt-4 text-sm">
          {menuItems.map((group) => (
            <div className="flex flex-col gap-2" key={group.title}>
              {!collapsed && (
                <span className="hidden lg:block text-gray-400 font-light my-4">
                  {group.title}
                </span>
              )}
              {group.items.map((item) => {
                if (item.visible?.includes(role)) {
                  const hasSubItems = item.subItems && item.subItems.length > 0;
                  const isSubMenuOpen = openSubMenu === item.label;
                  const IconComponent = item.icon;

                  return (
                    <div key={item.label}>
                      <div className="flex flex-col">
                        <Link
                          href={hasSubItems ? "#" : item.href}
                          onClick={() => hasSubItems && toggleSubMenu(item.label)}
                          className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} gap-4 text-gray-700 py-2 px-2 rounded-md hover:bg-lamaSkyLight cursor-pointer`}
                          title={collapsed ? item.label : ''}
                        >
                          <div className="flex items-center gap-4">
                            <IconComponent className="w-5 h-5" />
                            {!collapsed && (
                              <span className="hidden lg:block">{item.label}</span>
                            )}
                          </div>
                          {hasSubItems && !collapsed && (
                            <span className="hidden lg:block">
                              {isSubMenuOpen ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </span>
                          )}
                        </Link>

                        {/* Sub-items */}
                        {hasSubItems && isSubMenuOpen && !collapsed && (
                          <div className="ml-6 mt-1 space-y-1 border-l-2 border-gray-200 pl-4">
                            {item.subItems.map((subItem) => {
                              const SubIconComponent = subItem.icon;
                              return (
                                <Link
                                  key={subItem.label}
                                  href={subItem.href}
                                  className="flex items-center gap-3 py-2 px-2 text-gray-600 rounded-md hover:bg-lamaSkyLight hover:text-gray-800 text-sm"
                                >
                                  <SubIconComponent className="w-4 h-4" />
                                  <span>{subItem.label}</span>
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Menu;