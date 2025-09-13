export const StatCard = ({ icon, label, value, unit, iconBgColor }) => {
  const IconComponent = icon;
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm">{label}</p>
        <p className="text-2xl font-bold text-gray-800">{value} {unit}</p>
      </div>
      <div className={`p-3 rounded-full ${iconBgColor}`}>
        <IconComponent className="w-6 h-6 text-white" />
      </div>
    </div>
  );
};
