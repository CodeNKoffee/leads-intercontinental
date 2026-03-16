import * as React from "react";
import { SovereignSelect } from "./SovereignSelect";
import { Country, City } from "country-state-city";

interface LocationEngineProps {
  countryIsoCode: string;
  cityName: string;
  onCountryChange: (isoCode: string, name: string) => void;
  onCityChange: (cityName: string) => void;
  disabled?: boolean;
  hideCity?: boolean;
}

export function LocationEngine({
  countryIsoCode,
  cityName,
  onCountryChange,
  onCityChange,
  disabled,
  hideCity = false,
}: LocationEngineProps) {
  const [countries] = React.useState(() => Country.getAllCountries());
  const [cities, setCities] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (countryIsoCode) {
      setCities(City.getCitiesOfCountry(countryIsoCode) || []);
    } else {
      setCities([]);
    }
  }, [countryIsoCode]);

  const countryOptions = React.useMemo(() => 
    countries.map(c => ({ 
      value: c.isoCode, 
      label: `${c.flag || ""} ${c.name}` 
    })), [countries]
  );

  const cityOptions = React.useMemo(() => 
    cities.map(c => ({ 
      value: c.name, 
      label: c.name 
    })), [cities]
  );

  return (
    <div className="space-y-4">
      <SovereignSelect
        label="Geography (Country)"
        value={countryIsoCode}
        onValueChange={(code) => {
          const name = countries.find(c => c.isoCode === code)?.name || "";
          onCountryChange(code, name);
          onCityChange("");
        }}
        options={countryOptions}
        placeholder="Select Country"
        disabled={disabled}
      />

      {!hideCity && (
        <SovereignSelect
          label="Tactical Hub (City)"
          value={cityName}
          onValueChange={onCityChange}
          options={cityOptions}
          placeholder={countryIsoCode ? "All Cities" : "Select Country First"}
          disabled={disabled || !countryIsoCode}
        />
      )}
    </div>
  );
}
