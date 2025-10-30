import { MapPin, Award, AlertCircle } from "lucide-react";
import KPICard from "./KPICard";
import { Briefcase, Users, DollarSign, Target } from "lucide-react";

const DistrictInfo = ({ district, metrics, performanceCategory, language, formatNumber }) => {
  const text = {
    en: {
      districtDetails: "District Details",
      famousFor: "Famous For",
      jobDays: "Job Days Completed",
      households: "Households Covered",
      wages: "Total Wages Paid",
      performance: "Performance Index",
      excellent: "Excellent Performance",
      good: "Good Performance",
      needsImprovement: "Needs Improvement"
    },
    kn: {
      districtDetails: "ಜಿಲ್ಲಾ ವಿವರಗಳು",
      famousFor: "ಪ್ರಸಿದ್ಧವಾಗಿದೆ",
      jobDays: "ಪೂರ್ಣಗೊಂಡ ಕೆಲಸದ ದಿನಗಳು",
      households: "ಆವರಿಸಿದ ಕುಟುಂಬಗಳು",
      wages: "ಒಟ್ಟು ವೇತನ",
      performance: "ಕಾರ್ಯಕ್ಷಮತೆ ಸೂಚ್ಯಂಕ",
      excellent: "ಅತ್ಯುತ್ತಮ ಕಾರ್ಯಕ್ಷಮತೆ",
      good: "ಉತ್ತಮ ಕಾರ್ಯಕ್ಷಮತೆ",
      needsImprovement: "ಸುಧಾರಣೆ ಅಗತ್ಯ"
    }
  };

  const t = text[language];

  const getPerformanceBadge = () => {
    if (performanceCategory === "high") {
      return (
        <div className="flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full">
          <Award className="w-4 h-4" />
          <span className="font-medium">{t.excellent}</span>
        </div>
      );
    } else if (performanceCategory === "low") {
      return (
        <div className="flex items-center gap-2 bg-red-100 text-red-800 px-4 py-2 rounded-full">
          <AlertCircle className="w-4 h-4" />
          <span className="font-medium">{t.needsImprovement}</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-full">
        <Award className="w-4 h-4" />
        <span className="font-medium">{t.good}</span>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6" data-testid="district-info">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-amber-900 mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            {language === "en" ? district.name_en : district.name_kn}
          </h2>
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{t.famousFor}: {district.feature}</span>
          </div>
        </div>
        {getPerformanceBadge()}
      </div>

      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-2 text-blue-700 mb-2">
              <Briefcase className="w-5 h-5" />
            </div>
            <p className="text-sm text-blue-600 mb-1">{t.jobDays}</p>
            <p className="text-2xl font-bold text-blue-900">{formatNumber(metrics.total_job_days)}</p>
            <p className="text-xs text-blue-600 mt-1">Target: {formatNumber(metrics.target_job_days)}</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
            <div className="flex items-center gap-2 text-green-700 mb-2">
              <Users className="w-5 h-5" />
            </div>
            <p className="text-sm text-green-600 mb-1">{t.households}</p>
            <p className="text-2xl font-bold text-green-900">{formatNumber(metrics.households_covered)}</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center gap-2 text-purple-700 mb-2">
              <DollarSign className="w-5 h-5" />
            </div>
            <p className="text-sm text-purple-600 mb-1">{t.wages}</p>
            <p className="text-2xl font-bold text-purple-900">₹{formatNumber(metrics.wages_paid)}</p>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-4 border border-amber-200">
            <div className="flex items-center gap-2 text-amber-700 mb-2">
              <Target className="w-5 h-5" />
            </div>
            <p className="text-sm text-amber-600 mb-1">{t.performance}</p>
            <p className="text-2xl font-bold text-amber-900">{metrics.performance_index.toFixed(1)}%</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DistrictInfo;