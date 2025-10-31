import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const TrendChart = ({ data, language, onMonthClick }) => {
  // Sort data by date (newest first from API, reverse for chart)
  const chartData = [...data].reverse().map((item) => {
    // build a unique timestamp (ISO) to use as x-axis key so we don't get duplicate labels
    const ts = item.timestamp
      ? new Date(item.timestamp).toISOString()
      : `${item.year}-${String(item.month).padStart(2, "0")}-01T00:00:00.000Z`;
    return {
      id: item.id ?? `${item.year}-${item.month}`,
      ts,
      monthLabel: `${item.month}/${item.year}`,
      performance: item.performance_index,
      jobDays: Math.round(item.total_job_days / 1000), // In thousands (for chart)
      households: item.households_covered,
      // Full values to show in details
      totalPersondays: item.total_job_days ?? null,
      householdWorked: item.households_covered ?? null,
      totalWages:
        item.total_wages ||
        item.total_wages_disbursed ||
        item.total_wages_disbursed_inr ||
        null,
    };
  });

  const [selectedMonth, setSelectedMonth] = useState(null);

  const showDetails = (payload) => {
    if (!payload) return;
    setSelectedMonth(payload);
    if (typeof onMonthClick === "function") onMonthClick(payload);
  };

  // Custom dot renderer so we can attach click handlers with the payload easily
  const CustomDot = (props) => {
    const { cx, cy, payload } = props;
    if (cx == null || cy == null) return null;
    return (
      <circle
        cx={cx}
        cy={cy}
        r={4}
        fill="#d97706"
        stroke="#fff"
        strokeWidth={1}
        style={{ cursor: "pointer" }}
        onClick={() => showDetails(payload)}
      />
    );
  };

  const text = {
    en: {
      performance: "Performance %",
      jobDays: "Job Days (K)",
      households: "Households",
      persondays: "Total Persondays Generated",
      householdWorked: "Household Worked",
      totalWages: "Job days",
    },
    kn: {
      performance: "ಕಾರ್ಯಕ್ಷಮತೆ %",
      jobDays: "ಉದ್ಯೋಗ ದಿನಗಳು (K)",
      households: "ಕುಟುಂಬಗಳು",
      persondays: "ಒಟ್ಟು ವ್ಯಕ್ತಿದಿನಗಳು",
      householdWorked: "ಕೆಲಸ ಮಾಡಿದ ಗೃಹಸ್ಥಿಗಳು",
      totalWages: "ಉದ್ಯೋಗ ದಿನಗಳು",
    },
  };

  const t = text[language];

  return (
    <div className="space-y-6" data-testid="trend-chart">
      {/* Performance Trend */}
      <div>
        <h4 className="text-sm font-medium text-black mb-3">{t.performance}</h4>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart
            data={chartData}
            onClick={(e) => {
              // Try to extract payload from the chart click event (when clicking near a point)
              const payload =
                e?.activePayload?.[0]?.payload ||
                (e?.activeLabel &&
                  chartData.find(
                    (d) =>
                      d.ts === e.activeLabel || d.monthLabel === e.activeLabel
                  ));
              if (payload) showDetails(payload);
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="ts"
              style={{ fontSize: "12px" }}
              stroke="#6b7280"
              tickFormatter={(val) => {
                try {
                  const d = new Date(val);
                  return `${d.getMonth() + 1}/${d.getFullYear()}`;
                } catch (e) {
                  return val;
                }
              }}
            />
            <YAxis style={{ fontSize: "12px" }} stroke="#6b7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            />
            <Line
              type="monotone"
              dataKey="performance"
              stroke="#f59e0b"
              strokeWidth={3}
              dot={CustomDot}
              activeDot={{ r: 6 }}
              style={{ cursor: "pointer" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Bar Chart (now using performance) */}
      <div>
        <h4 className="text-sm font-medium text-black mb-3">{t.performance}</h4>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="ts"
              style={{ fontSize: "12px" }}
              stroke="#6b7280"
              tickFormatter={(val) => {
                try {
                  const d = new Date(val);
                  return `${d.getMonth() + 1}/${d.getFullYear()}`;
                } catch (e) {
                  return val;
                }
              }}
            />
            <YAxis style={{ fontSize: "12px" }} stroke="#6b7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            />
            <Bar
              dataKey="performance"
              fill="#3b82f6"
              radius={[8, 8, 0, 0]}
              onClick={(d) => {
                // d.payload contains the data object for the clicked bar
                const payload = d?.payload || d;
                showDetails(payload);
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Selected month details panel */}
      {selectedMonth && (
        <div className="bg-white rounded-md shadow p-4 mt-2 text-sm">
          <div className="font-medium text-black">
            {language === "en" ? "Selected Month" : "ಆಯ್ದ ತಿಂಗಳು"}:{" "}
            {selectedMonth.monthLabel || selectedMonth.month}
          </div>
          <div className="grid grid-cols-3 gap-4 mt-2">
            <div>
              <div className="text-xs text-black">{t.persondays}</div>
              <div className="font-semibold">
                {selectedMonth.totalPersondays != null
                  ? new Intl.NumberFormat("en-IN").format(
                      Math.round(selectedMonth.totalPersondays)
                    )
                  : "—"}
              </div>
            </div>
            <div>
              <div className="text-xs text-black">
                {t.householdWorked || t.householdWorked}
              </div>
              <div className="font-semibold">
                {selectedMonth.householdWorked != null
                  ? new Intl.NumberFormat("en-IN").format(
                      Math.round(selectedMonth.householdWorked)
                    )
                  : "—"}
              </div>
            </div>
            <div>
              <div className="text-xs text-black">{t.totalWages}</div>
              <div className="font-semibold">
                {selectedMonth.totalPersondays != null
                  ? new Intl.NumberFormat("en-IN").format(
                      Math.round(selectedMonth.totalPersondays)
                    )
                  : "—"}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrendChart;
