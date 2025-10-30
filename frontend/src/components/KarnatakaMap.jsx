import { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const KARNATAKA_CENTER = [15.3173, 75.7139];

const DISTRICT_COORDINATES = {
  "KA01": [16.1747, 75.6947],
  "KA02": [13.1367, 77.5847],
  "KA03": [12.9716, 77.5946],
  "KA04": [15.8497, 74.4977],
  "KA05": [15.1394, 76.9214],
  "KA06": [17.9129, 77.5199],
  "KA07": [11.9236, 76.9395],
  "KA08": [13.4355, 77.7315],
  "KA09": [13.3161, 75.7720],
  "KA10": [14.2251, 76.3980],
  "KA11": [12.8438, 75.2479],
  "KA12": [14.4644, 75.9217],
  "KA13": [15.4589, 75.0078],
  "KA14": [15.4292, 75.6339],
  "KA15": [17.3297, 76.8343],
  "KA16": [13.0053, 76.0965],
  "KA17": [14.7951, 75.3990],
  "KA18": [12.4244, 75.7382],
  "KA19": [13.1370, 78.1294],
  "KA20": [15.3520, 76.1540],
  "KA21": [12.5244, 76.8952],
  "KA22": [12.2958, 76.6394],
  "KA23": [16.2076, 77.3463],
  "KA24": [12.7181, 77.2811],
  "KA25": [13.9299, 75.5681],
  "KA26": [13.3392, 77.1006],
  "KA27": [13.3409, 74.7421],
  "KA28": [14.5196, 74.6896],
  "KA29": [16.8302, 75.7100],
  "KA30": [16.7700, 77.1387]
};

function MapUpdater({ selectedDistrictId }) {
  const map = useMap();

  useEffect(() => {
    if (selectedDistrictId && DISTRICT_COORDINATES[selectedDistrictId]) {
      const coords = DISTRICT_COORDINATES[selectedDistrictId];
      map.flyTo(coords, 9, { duration: 1.5 });
    }
  }, [selectedDistrictId, map]);

  return null;
}

const KarnatakaMap = ({ districts, comparisonData, selectedDistrictId, onDistrictSelect }) => {
  const getPerformanceColor = (performance) => {
    if (performance >= 90) return "#10b981"; // green
    if (performance >= 75) return "#f59e0b"; // amber
    return "#ef4444"; // red
  };

  const getDistrictPerformance = (districtId) => {
    const data = comparisonData.find(d => d.district_id === districtId);
    return data?.performance_index || 0;
  };

  return (
    <MapContainer
      center={KARNATAKA_CENTER}
      zoom={7}
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom={false}
      data-testid="karnataka-map"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {districts.map((district) => {
        const coords = DISTRICT_COORDINATES[district.id] || KARNATAKA_CENTER;
        const performance = getDistrictPerformance(district.id);
        const color = getPerformanceColor(performance);
        const isSelected = selectedDistrictId === district.id;

        return (
          <CircleMarker
            key={district.id}
            center={coords}
            radius={isSelected ? 12 : 8}
            fillColor={color}
            color="#ffffff"
            weight={isSelected ? 3 : 2}
            opacity={1}
            fillOpacity={0.8}
            eventHandlers={{
              click: () => onDistrictSelect(district.id)
            }}
          >
            <Tooltip>
              <div className="text-sm">
                <strong>{district.name_en}</strong><br />
                <strong>{district.name_kn}</strong><br />
                Performance: {performance.toFixed(1)}%
              </div>
            </Tooltip>
          </CircleMarker>
        );
      })}

      <MapUpdater selectedDistrictId={selectedDistrictId} />
    </MapContainer>
  );
};

export default KarnatakaMap;