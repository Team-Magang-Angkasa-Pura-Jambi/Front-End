export const LogItem = ({ icon, iconColor, bgColor, description, time }) => {
  const IconComponent = icon;
  return (
    <div className="flex items-start space-x-4 py-3">
      <div className={`p-2 rounded-full ${bgColor}`}>
        <IconComponent className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div>
        <p className="text-gray-800 text-sm">{description}</p>
        <p className="text-gray-400 text-xs mt-1">{time}</p>
      </div>
    </div>
  );
};
