import { ChevronDown, Flame, Lightbulb, AlertTriangle } from "lucide-react";

export const MachineLearningAnalysis = () => {
  const insights = [
    {
      icon: AlertTriangle,
      iconColor: "text-yellow-500",
      bgColor: "bg-yellow-100",
      title: "Prediksi Risiko",
      description:
        "Potensi pemadaman listrik di Sektor B dalam 48 jam ke depan.",
    },
    {
      icon: Lightbulb,
      iconColor: "text-green-500",
      bgColor: "bg-green-100",
      title: "Rekomendasi Optimasi",
      description:
        "Optimalkan jadwal pompa air antara pukul 22:00 - 04:00 untuk hemat biaya.",
    },
    {
      icon: Flame,
      iconColor: "text-red-500",
      bgColor: "bg-red-100",
      title: "Deteksi Anomali",
      description:
        "Konsumsi bahan bakar Genset C 15% lebih tinggi dari rata-rata minggu ini.",
    },
  ];

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm col-span-1">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg text-gray-800">Hasil Analisis AI</h3>
        <button className="text-sm text-gray-500 flex items-center">
          Bulan Ini <ChevronDown className="w-4 h-4 ml-1" />
        </button>
      </div>
      <div className="space-y-4">
        {insights.map((insight, index) => {
          const IconComponent = insight.icon;
          return (
            <div key={index} className="flex items-start space-x-3">
              <div className={`p-2 rounded-full ${insight.bgColor}`}>
                <IconComponent className={`w-5 h-5 ${insight.iconColor}`} />
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">
                  {insight.title}
                </p>
                <p className="text-gray-600 text-sm">{insight.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
