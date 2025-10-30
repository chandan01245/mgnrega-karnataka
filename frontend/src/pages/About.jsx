import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-amber-700 hover:text-amber-900 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-amber-900 mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            About MGNREGA Karnataka Dashboard
          </h1>
          <div className="space-y-4 text-gray-700">
            <p>
              The Mahatma Gandhi National Rural Employment Guarantee Act (MGNREGA) is a social welfare scheme that aims to guarantee the 'right to work' and ensure livelihood security in rural areas.
            </p>
            <p>
              This dashboard provides real-time monitoring of MGNREGA implementation across all districts in Karnataka, helping track performance, identify gaps, and improve service delivery.
            </p>
            <h2 className="text-xl font-bold text-amber-900 mt-6 mb-2">Key Features</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Interactive district-wise map with color-coded performance indicators</li>
              <li>Real-time KPIs and performance metrics</li>
              <li>6-month historical trend analysis</li>
              <li>Bilingual support (English & Kannada)</li>
              <li>State-level aggregated statistics</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;