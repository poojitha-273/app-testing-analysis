import React from "react";
import { Building2, Database, HeartHandshake, Navigation, Sparkles, User } from "lucide-react";

export type NavTab = "hospital" | "blood_bank" | "donor" | "map" | "antigens" | "profile";

interface BottomNavigationProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  isSimulatingMove?: boolean;
  activeRequestsCount?: number;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onTabChange,
  isSimulatingMove = false,
  activeRequestsCount = 0,
}) => {
  const navItems: { id: NavTab; label: string; icon: React.ElementType; badge?: string | number; badgeColor?: string }[] = [
    {
      id: "hospital",
      label: "Hospital",
      icon: Building2,
      badge: activeRequestsCount > 0 ? activeRequestsCount : undefined,
      badgeColor: "bg-red-600 text-white",
    },
    {
      id: "blood_bank",
      label: "Blood Bank",
      icon: Database,
    },
    {
      id: "donor",
      label: "Donor Hub",
      icon: HeartHandshake,
    },
    {
      id: "map",
      label: "GPS Map",
      icon: Navigation,
      badge: isSimulatingMove ? "LIVE" : undefined,
      badgeColor: "bg-emerald-500 text-white animate-pulse",
    },
    {
      id: "antigens",
      label: "AI Match",
      icon: Sparkles,
    },
    {
      id: "profile",
      label: "Profile",
      icon: User,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 shadow-lg safe-area-pb">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 cursor-pointer min-w-[64px] min-h-[48px] ${
                isActive
                  ? "text-red-600 font-bold"
                  : "text-slate-500 hover:text-slate-900 active:scale-95"
              }`}
            >
              {/* Active Indicator Background Pill */}
              {isActive && (
                <span className="absolute inset-0 bg-red-50 border border-red-200 rounded-xl -z-10" />
              )}

              {/* Icon Container with Badge */}
              <div className="relative flex items-center justify-center">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? "scale-110 text-red-600" : "text-slate-500"
                  }`}
                />

                {item.badge !== undefined && (
                  <span
                    className={`absolute -top-1.5 -right-3 text-[9px] font-mono font-black px-1.5 py-0.2 rounded-full border border-white shadow ${
                      item.badgeColor || "bg-red-600 text-white"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </div>

              {/* Tab Label */}
              <span className={`text-[10px] mt-1 tracking-tight font-medium ${isActive ? "text-red-600 font-bold" : "text-slate-500"}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
