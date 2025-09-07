"use client";

import {
    LogoutOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    UserOutlined,
    BellOutlined,
    MailOutlined,
} from "@ant-design/icons";
import { UserButton, useUser } from "@clerk/nextjs";
import { Dropdown, Tooltip, Badge, Input } from "antd";
import { useRouter } from "next/navigation";
import { useState } from "react";

const { Search } = Input;

const Header = ({ collapsed, toggle }: { collapsed: boolean; toggle: () => void }) => {
    const { user } = useUser();
    const router = useRouter();

    const [theme, setTheme] = useState<"light" | "dark">("light");
    const [notificationsCount, setNotificationsCount] = useState(3);
    const [messagesCount, setMessagesCount] = useState(1);

    const handleLogout = () => {
        router.push("/login");
    };

    const toggleTheme = () => {
        setTheme(prev => (prev === "light" ? "dark" : "light"));
    };

    return (
        <header className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
            <div className="flex items-center gap-4">
                <Search placeholder="Search..." allowClear className="hidden md:block w-64" />
            </div>

            <div className="ml-auto flex items-center gap-6">
                <Tooltip title={theme === "light" ? "Dark mode" : "Light mode"}>
                    <button onClick={toggleTheme} className="text-gray-600 hover:text-gray-900">
                        {theme === "light" ? (
                            <span className="text-yellow-500">☀️</span>
                        ) : (
                            <span className="text-indigo-500">🌙</span>
                        )}
                    </button>
                </Tooltip>

                <Dropdown
                    trigger={["click"]}
                    placement="bottomRight"
                    popupRender={() => (
                        <div className="bg-white shadow-lg rounded-md p-2 w-64">
                            <div className="p-2 border-b border-gray-100 font-medium">Notifications</div>
                            <div className="p-4 text-center text-gray-500">No new notifications</div>
                        </div>
                    )}
                >
                    <Badge count={notificationsCount} className="cursor-pointer">
                        <BellOutlined className="text-lg text-gray-600 hover:text-gray-900" />
                    </Badge>
                </Dropdown>

                <Dropdown
                    trigger={["click"]}
                    placement="bottomRight"
                    popupRender={() => (
                        <div className="bg-white shadow-lg rounded-md p-2 w-64">
                            <div className="p-2 border-b border-gray-100 font-medium">Messages</div>
                            <div className="p-4 text-center text-gray-500">No new messages</div>
                        </div>
                    )}
                >
                    <Badge count={messagesCount} className="cursor-pointer">
                        <MailOutlined className="text-lg text-gray-600 hover:text-gray-900" />
                    </Badge>
                </Dropdown>

                <Dropdown
                    placement="bottomRight"
                    menu={{
                        items: [
                            {
                                key: "profile",
                                icon: <UserOutlined />,
                                label: "Profile",
                            },
                            {
                                key: "logout",
                                icon: <LogoutOutlined />,
                                label: "Logout",
                                onClick: handleLogout,
                            },
                        ],
                    }}
                >
                    <div className="flex items-center gap-2 cursor-pointer">
                        <UserButton />
                        <div className="hidden md:block">
                            {/* Optional: Display user info */}
                            {/* <div className="text-sm font-medium">{user?.fullName}</div>
              <div className="text-xs text-gray-500">{user?.emailAddress}</div> */}
                        </div>
                    </div>
                </Dropdown>
            </div>
        </header>
    );
};

export default Header;