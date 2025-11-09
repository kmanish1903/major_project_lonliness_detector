import { Home, Heart, Target, TrendingUp, User } from "lucide-react";
import { NavLink } from "react-router-dom";
import { ROUTES } from "@/utils/constants";
import { cn } from "@/lib/utils";

const tabs = [
  { name: "Home", icon: Home, path: ROUTES.DASHBOARD },
  { name: "Check-In", icon: Heart, path: ROUTES.MOOD.CHECK },
  { name: "Goals", icon: Target, path: ROUTES.GOALS.LIST },
  { name: "Insights", icon: TrendingUp, path: ROUTES.PROGRESS },
  { name: "Profile", icon: User, path: ROUTES.PROFILE },
];

const BottomTabBar = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card md:hidden">
      <div className="flex justify-around items-center h-16">
        {tabs.map((tab) => (
          <NavLink
            key={tab.name}
            to={tab.path}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )
            }
          >
            <tab.icon className="h-5 w-5" />
            <span className="text-xs font-medium">{tab.name}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomTabBar;
