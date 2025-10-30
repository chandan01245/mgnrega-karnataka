import { TrendingUp, TrendingDown } from "lucide-react";

const KPICard = ({ title, value, icon, color, trend }) => {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
    orange: "from-amber-500 to-amber-600",
    red: "from-red-500 to-red-600"
  };

  return (
    <div
      className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-amber-100"
      data-testid="kpi-card"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg bg-gradient-to-br ${colorClasses[color]} text-white`}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm ${
            trend === "up" ? "text-green-600" : "text-red-600"
          }`}>
            {trend === "up" ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          </div>
        )}
      </div>
      <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
        {value}
      </p>
    </div>
  );
};

export default KPICard;