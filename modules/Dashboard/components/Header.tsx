import { Input } from "@/common/components/ui/input";
import { useAuthStore } from "@/stores/authStore";
import Image from "next/image";
import { NotificationPopover } from "./NotificationPopover";
import { ThemeToggle } from "@/common/components/ui/ThemeToggle";

export const Header = () => {
  const { user } = useAuthStore();
  return (
    <header className="flex w-full  items-center justify-between ">
      <div className="flex items-center space-x-4">
        <Image
          width={50}
          height={50}
          src="https://assets.aceternity.com/manu.png"
          alt="User Avatar"
          className="w-10 h-10 rounded-full"
        />
        <div>
          <h1 className="text-xl font-bold">{user?.username}</h1>
          <p className="text-sm ">Sunday, June 25, 2024</p>
        </div>
      </div>
      <div className="flex items-center space-x-6">
        <NotificationPopover />
        <ThemeToggle />
      </div>
    </header>
  );
};
