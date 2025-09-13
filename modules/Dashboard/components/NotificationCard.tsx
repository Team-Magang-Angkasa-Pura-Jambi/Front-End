import { IconBell } from "@tabler/icons-react";

export const NotificationCard = () => (
  <div className="bg-white p-6 rounded-2xl flex items-center justify-between shadow-sm">
    <div className="flex items-center space-x-4">
      <div className="bg-yellow-100 p-3 rounded-full">
        <IconBell className="w-6 h-6 text-yellow-500" />
      </div>
      <div>
        <h2 className="font-bold text-gray-800">Dear Manager</h2>
        <p className="text-gray-600">
          We have observed a decline in{" "}
          <span className="text-blue-600 font-semibold">Hermawan's</span>{" "}
          performance over the past 2 weeks.
        </p>
      </div>
    </div>
    <button className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition">
      View Detail
    </button>
  </div>
);
