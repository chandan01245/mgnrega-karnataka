import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DistrictSelector = ({
  districts,
  selectedDistrictId,
  onSelect,
  language,
}) => {
  return (
    <div className="mt-4" data-testid="district-selector">
      <label className="block text-sm font-medium text-amber-900 mb-2">
        {language === "en" ? "Select District" : "ಜಿಲ್ಲೆ ಆಯ್ಕೆಮಾಡಿ"}
      </label>
      <Select value={selectedDistrictId} onValueChange={onSelect}>
        <SelectTrigger className="w-full bg-white border-amber-200 focus:ring-amber-500">
          <SelectValue placeholder="Select a district" />
        </SelectTrigger>
        {/* Force dropdown to open downward (bottom) using popper positioning.
      avoidCollisions={false} prevents Floating UI from flipping the dropdown
      to the top when there isn't enough space detected; sideOffset adds a
      small spacing between trigger and content. */}
        <SelectContent
          position="popper"
          side="bottom"
          avoidCollisions={false}
          sideOffset={6}
        >
          {districts.map((district) => (
            <SelectItem key={district.id} value={district.id}>
              {language === "en" ? district.name_en : district.name_kn}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default DistrictSelector;
