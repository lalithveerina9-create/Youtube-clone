import Link from "next/link";

import {
  Home,
  PlaySquare,
  Users,
  History,
  ThumbsUp,
  Clock,
} from "lucide-react";

export default function Sidebar() {
  const menuItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: PlaySquare, label: "Shorts", path: "/shorts" },
    { icon: Users, label: "Subscriptions", path: "/subscriptions" },
    { icon: History, label: "History", path: "/history" },
    
    { icon: ThumbsUp, label: "Liked Videos", path: "/liked" },
    {
  icon: Clock,
  label: "Watch Later",
  path: "/watchlater",
}
  ];

  return (
    <aside className="w-60 h-screen border-r p-4">
      <div className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              href={item.path}
              key={item.label}
            >
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer">
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}