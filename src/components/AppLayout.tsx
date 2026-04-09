import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";

const AppLayout = () => (
  <div className="min-h-screen bg-background pb-0">
    <div className="max-w-lg mx-auto">
      <Outlet />
    </div>
    <BottomNav />
  </div>
);

export default AppLayout;
