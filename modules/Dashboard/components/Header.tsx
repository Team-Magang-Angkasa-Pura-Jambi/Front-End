import { Input } from "@/components/ui/input";
import { IconBell, IconSearch, IconSettings } from "@tabler/icons-react";
import Image from "next/image";

export const Header = () => (
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
        <h1 className="text-xl font-bold text-gray-800">Hey, Markus</h1>
        <p className="text-sm text-gray-500">Sunday, June 25, 2024</p>
      </div>
    </div>
    <div className="flex items-center space-x-6">
      <div className="relative">
        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          type="text"
          placeholder="Start searching here"
          className="pl-10 pr-4 py-2 w-72 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <IconBell className="w-6 h-6 text-gray-500" />
      <IconSettings className="w-6 h-6 text-gray-500" />
    </div>
  </header>
);
