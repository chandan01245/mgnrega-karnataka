import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const TrendChart = ({ data, language }) => {
  // Sort data by date (newest first from API, reverse for chart)
  const chartData = [...data].reverse().map((item) => ({
    month: `${item.month}/${item.year}`,
    performance: item.performance_index,
    jobDays: Math.round(item.total_job_days / 1000), // In thousands
    households: item.households_covered
  }));

  const text = {
    en: {
      performance: "Performance %",
      jobDays: "Job Days (K)",
      households: "Households"
    },
    kn: {
      performance: "ಕಾರ್ಯಕ್ಷಮತೆ %",
      jobDays: "ಉದ್ಯೋಗ ದಿನಗಳು (K)",
      households: "ಕುಟುಂಬಗಳು"
    }
  };

  const t = text[language];

  return (
    <div className="space-y-6" data-testid="trend-chart">
      {/* Performance Trend */}
      <div>
        <h4 className="text-sm font-medium text-gray-600 mb-3">{t.performance}</h4>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" style={{ fontSize: '12px' }} stroke="#6b7280" />
            <YAxis style={{ fontSize: '12px' }} stroke="#6b7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            />
            <Line
              type="monotone"
              dataKey="performance"
              stroke="#f59e0b"
              strokeWidth={3}
              dot={{ fill: '#d97706', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Job Days Bar Chart */}
      <div>
        <h4 className="text-sm font-medium text-gray-600 mb-3">{t.jobDays}</h4>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" style={{ fontSize: '12px' }} stroke="#6b7280" />
            <YAxis style={{ fontSize: '12px' }} stroke="#6b7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            />
            <Bar dataKey="jobDays" fill="#3b82f6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TrendChart;