import { useEffect, useState } from "react";
import axios from "axios";
import KarnatakaMap from "../components/KarnatakaMap";
import DistrictSelector from "../components/DistrictSelector";
import KPICard from "../components/KPICard";
import DistrictInfo from "../components/DistrictInfo";
import TrendChart from "../components/TrendChart";
import { MapPin, Users, Briefcase, DollarSign, TrendingUp, Award } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Home = () => {
  const [language, setLanguage] = useState("en");
  const [districts, setDistricts] = useState([]);
  const [selectedDistrictId, setSelectedDistrictId] = useState(null);
  const [districtPerformance, setDistrictPerformance] = useState(null);
  const [stateStats, setStateStats] = useState(null);
  const [comparisonData, setComparisonData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedDistrictId) {
      loadDistrictData(selectedDistrictId);
    }
  }, [selectedDistrictId]);

  const loadInitialData = async () => {
    try {
      const [districtsRes, statsRes, comparisonRes] = await Promise.all([
        axios.get(`${API}/districts`),
        axios.get(`${API}/metrics/state`),
        axios.get(`${API}/metrics/comparison`)
      ]);

      setDistricts(districtsRes.data);
      setStateStats(statsRes.data);
      setComparisonData(comparisonRes.data);
      
      // Select first district by default
      if (districtsRes.data.length > 0) {
        setSelectedDistrictId(districtsRes.data[0].id);
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Error loading data:", error);
      setLoading(false);
    }
  };

  const loadDistrictData = async (districtId) => {
    try {
      const response = await axios.get(`${API}/districts/${districtId}`);
      setDistrictPerformance(response.data);
    } catch (error) {
      console.error("Error loading district data:", error);
    }
  };

  const formatNumber = (num) => {
    if (num >= 10000000) return `${(num / 10000000).toFixed(2)} Cr`;
    if (num >= 100000) return `${(num / 100000).toFixed(2)} L`;
    if (num >= 1000) return `${(num / 1000).toFixed(2)} K`;
    return num?.toFixed(0);
  };

  const text = {
    en: {
      title: "MGNREGA Karnataka Performance Dashboard",
      subtitle: "District-wise Employment Scheme Monitoring",
      stateOverview: "State Overview",
      districtPerformance: "District Performance",
      selectDistrict: "Select District",
      jobDays: "Job Days",
      households: "Households",
      wages: "Wages Paid",
      performance: "Performance",
      trend: "6-Month Trend",
      bestPerformer: "Best Performer",
      needsImprovement: "Needs Improvement"
    },
    kn: {
      title: "ಮನರೇಗಾ ಕರ್ನಾಟಕ ಕಾರ್ಯಕ್ಷಮತೆ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
      subtitle: "ಜಿಲ್ಲಾವಾರು ಉದ್ಯೋಗ ಯೋಜನೆ ಮೇಲ್ವಿಚಾರಣೆ",
      stateOverview: "ರಾಜ್ಯ ಅವಲೋಕನ",
      districtPerformance: "ಜಿಲ್ಲಾ ಕಾರ್ಯಕ್ಷಮತೆ",
      selectDistrict: "ಜಿಲ್ಲೆ ಆಯ್ಕೆಮಾಡಿ",
      jobDays: "ಉದ್ಯೋಗ ದಿನಗಳು",
      households: "ಕುಟುಂಬಗಳು",
      wages: "ವೇತನ ಪಾವತಿ",
      performance: "ಕಾರ್ಯಕ್ಷಮತೆ",
      trend: "೬-ತಿಂಗಳ ಪ್ರವೃತ್ತಿ",
      bestPerformer: "ಅತ್ಯುತ್ತಮ ಕಾರ್ಯಕ್ಷಮತೆ",
      needsImprovement: "ಸುಧಾರಣೆ ಅಗತ್ಯ"
    }
  };

  const t = text[language];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-amber-600 mx-auto mb-4"></div>
          <p className="text-xl text-amber-800 font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" data-testid="dashboard-container">
      {/* Header */}
      <header className="bg-gradient-to-r from-amber-700 to-red-600 shadow-lg">
        <div className="max-w-[1800px] mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                {t.title}
              </h1>
              <p className="text-amber-100 text-base md:text-lg">{t.subtitle}</p>
            </div>
            <button
              onClick={() => setLanguage(language === "en" ? "kn" : "en")}
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 py-3 rounded-full font-medium transition-all duration-300 flex items-center gap-2"
              data-testid="language-toggle"
            >
              <MapPin className="w-4 h-4" />
              {language === "en" ? "ಕನ್ನಡ" : "English"}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-[1800px] mx-auto px-6 py-8">
        {/* State Overview KPIs */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-amber-900 mb-4 flex items-center gap-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            <Award className="w-6 h-6" />
            {t.stateOverview}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard
              title={t.jobDays}
              value={formatNumber(stateStats?.total_job_days)}
              icon={<Briefcase />}
              color="blue"
              trend="up"
            />
            <KPICard
              title={t.households}
              value={formatNumber(stateStats?.total_households)}
              icon={<Users />}
              color="green"
              trend="up"
            />
            <KPICard
              title={t.wages}
              value={`₹${formatNumber(stateStats?.total_wages)}`}
              icon={<DollarSign />}
              color="purple"
              trend="up"
            />
            <KPICard
              title={t.performance}
              value={`${stateStats?.avg_performance?.toFixed(1)}%`}
              icon={<TrendingUp />}
              color="orange"
              trend={stateStats?.avg_performance >= 85 ? "up" : "down"}
            />
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Map Section */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-amber-900 mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Karnataka Districts Map
              </h3>
              <div className="h-[500px]">
                <KarnatakaMap
                  districts={districts}
                  comparisonData={comparisonData}
                  selectedDistrictId={selectedDistrictId}
                  onDistrictSelect={setSelectedDistrictId}
                />
              </div>
              <DistrictSelector
                districts={districts}
                selectedDistrictId={selectedDistrictId}
                onSelect={setSelectedDistrictId}
                language={language}
              />
            </div>
          </div>

          {/* District Details Section */}
          <div className="lg:col-span-7 space-y-6">
            {districtPerformance && (
              <>
                <DistrictInfo
                  district={districtPerformance.district}
                  metrics={districtPerformance.latest_metrics}
                  performanceCategory={districtPerformance.performance_category}
                  language={language}
                  formatNumber={formatNumber}
                />

                <div className="bg-white rounded-2xl shadow-xl p-6">
                  <h3 className="text-xl font-bold text-amber-900 mb-4 flex items-center gap-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    <TrendingUp className="w-5 h-5" />
                    {t.trend}
                  </h3>
                  <TrendChart
                    data={districtPerformance.trend}
                    language={language}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;