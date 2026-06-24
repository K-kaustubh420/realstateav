"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Search, X, MapPin, PlusCircle, CheckCircle, Navigation, Loader2 } from "lucide-react";
import { updateAgencyPreferences } from "../../../../lib/agency/preferences";
import { AgencyPreferences } from "../../../../lib/agency/agency";

// Fix Leaflet default icon issue
const fixLeafletIcon = () => {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  });
};

const goldIcon = new L.Icon({
  iconUrl:
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9ncmFwaGljcy9zdmcvPCEtLUlPTiBGT05UQVdFU09NRSA1IEZSRUUvLSA+PHBhdGggZmlsbD0iI0ZCQkYyNCIgZD0iTTE3Mi4xLDIwMS43QzEzMC44LDEzNS45LDUxLDIyLDIwLjcsNzQuMkMxMC42LDE1Ny4xLDkxLjgsMjIzLDE3Mi4xLDIwMS43eiIgdHJhbnNmb3JtPSJtYXRyaXgoMS4wNzI0MywwLDAsMS4wNzI0MywtMzEuOTk3NSwtMzAuMDEzMykiIGlkPSJyZWctZ2xvYi1tb2JhYyI+PC9wYXRoPjwvc3ZnPg==',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

const isValidCoordinate = (coords: any): coords is [number, number] => {
  return (
    Array.isArray(coords) &&
    coords.length === 2 &&
    typeof coords[0] === "number" &&
    Number.isFinite(coords[0]) &&
    typeof coords[1] === "number" &&
    Number.isFinite(coords[1])
  );
};

interface LocationMarkerProps {
  position: [number, number] | null;
  setPosition: (pos: [number, number]) => void;
  onLocationNameFound: (name: string) => void;
}

const LocationMarker: React.FC<LocationMarkerProps> = ({ position, setPosition, onLocationNameFound }) => {
  const map = useMap();

  useEffect(() => {
    if (isValidCoordinate(position)) {
      const timer = setTimeout(() => {
        const lat = Number(position[0]);
        const lng = Number(position[1]);
        if (Number.isFinite(lat) && Number.isFinite(lng)) {
          map.flyTo([lat, lng], 14, { duration: 1.5 });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [position, map]);

  useMapEvents({
    click(e: L.LeafletMouseEvent) {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      setPosition([lat, lng]);

      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.display_name) {
            let simplifiedName = data.display_name;
            if (data.address) {
              const { city, town, village, state, country } = data.address;
              const place = city || town || village;
              if (place && state) {
                simplifiedName = `${place}, ${state}, ${country || ""}`;
              }
            }
            onLocationNameFound(simplifiedName);
          }
        })
        .catch((err) => console.error("Reverse geocoding failed", err));
    },
  });

  return position && isValidCoordinate(position) ? <Marker position={position} icon={goldIcon} /> : null;
};

interface LocateControlProps {
  setCoordinates: (pos: [number, number]) => void;
  onLocationNameFound: (name: string) => void;
}

const LocateControl: React.FC<LocateControlProps> = ({ setCoordinates, onLocationNameFound }) => {
  const map = useMap();
  const [loading, setLoading] = useState(false);

  const handleLocate = () => {
    setLoading(true);
    map
      .locate()
      .on("locationfound", function (e) {
        const newPos: [number, number] = [e.latlng.lat, e.latlng.lng];
        setCoordinates(newPos);
        reverseGeocode(e.latlng.lat, e.latlng.lng, onLocationNameFound);
        map.flyTo(newPos, 14, { duration: 1.5 });
        setLoading(false);
      })
      .on("locationerror", function (e) {
        console.error(e.message);
        setLoading(false);
        alert("Could not access your location. Please ensure location services are enabled.");
      });
  };

  return (
    <div className="leaflet-bottom leaflet-right">
      <div className="leaflet-control leaflet-bar mb-10 mr-2">
        <button
          className="bg-white p-2 hover:bg-gray-100 text-black shadow-md rounded-sm flex items-center justify-center w-10 h-10 transition-colors"
          onClick={handleLocate}
          title="Locate Me"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
          ) : (
            <Navigation size={20} className="text-black" fill="black" />
          )}
        </button>
      </div>
    </div>
  );
};

async function reverseGeocode(lat: number, lon: number, callback: (name: string) => void) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`);
    const data = await res.json();
    if (data && data.address) {
      const address = data.address;
      let locationName = address.city || address.town || address.village || address.county || address.state || data.display_name.split(",")[0];
      if (address.country && locationName !== address.country) {
        locationName += `, ${address.country}`;
      }
      callback(locationName);
    } else {
      callback("Unknown location");
    }
  } catch (error) {
    console.error("Error during reverse geocoding:", error);
    callback("Error fetching location name");
  }
}

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
}

const PROPERTY_TYPES = ["Residential", "Commercial", "Land", "Villa", "Apartment", "Warehouse", "Office Space"];

type Props = {
  agencyId: string;
  initialPreferences: AgencyPreferences;
  onUpdate: () => Promise<void>;
  onError: (msg: string) => void;
  onFeedback: (msg: string) => void;
};

export default function Preferences({ agencyId, initialPreferences, onUpdate, onError, onFeedback }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<NominatimResult[]>([]);
  const initialLocs = initialPreferences?.preferredLocations || [];
  const initialTypes = initialPreferences?.preferredPropertyTypes || [];
  const [preferredLocations, setPreferredLocations] = useState<string[]>(initialLocs);
  const [preferredPropertyTypes, setPreferredPropertyTypes] = useState<string[]>(initialTypes);
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const [mapMarker, setMapMarker] = useState<[number, number] | null>(null);
  const [selectedLocationFromMap, setSelectedLocationFromMap] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const hasChanges = 
    JSON.stringify([...preferredLocations].sort()) !== JSON.stringify([...initialLocs].sort()) ||
    JSON.stringify([...preferredPropertyTypes].sort()) !== JSON.stringify([...initialTypes].sort());

  const handleDiscard = () => {
    setPreferredLocations(initialLocs);
    setPreferredPropertyTypes(initialTypes);
  };

  useEffect(() => {
    fixLeafletIcon();
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        gsap.utils.toArray('.gsap-section', containerRef.current),
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out' }
      );
    }
  }, []);

  const searchCity = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5`);
      const data: NominatimResult[] = await res.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Error searching city:", error);
      setSearchResults([]);
    }
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      searchCity(query);
    }, 500);
  };

  const addPreferredLocation = (locationName: string) => {
    const cleanedLocationName = locationName
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .join(", ");
    if (cleanedLocationName && !preferredLocations.includes(cleanedLocationName)) {
      setPreferredLocations((prev) => [...prev, cleanedLocationName]);
      setSearchQuery("");
      setSearchResults([]);
      setSelectedLocationFromMap(null);
    }
  };

  const removePreferredLocation = (locationName: string) => {
    setPreferredLocations((prev) => prev.filter((loc) => loc !== locationName));
  };

  const togglePropertyType = (type: string) => {
    setPreferredPropertyTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleSavePreferences = async () => {
    setIsUpdating(true);
    try {
      await updateAgencyPreferences(agencyId, {
        preferredLocations,
        preferredPropertyTypes,
      });
      await onUpdate();
      onFeedback("Preferences updated successfully!");
    } catch (error: any) {
      onError(error.message || "Failed to update preferences.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMapMarkerChange = (coords: [number, number]) => {
    setMapMarker(coords);
    setMapCenter(coords);
  };

  const handleLocationNameFromMap = (name: string) => {
    setSelectedLocationFromMap(name);
  };

  return (
    <div ref={containerRef} className="space-y-8 relative">
      <div className="gsap-section">
        <h2 className="text-2xl font-bold text-white mb-2">Agency Preferences</h2>
        <p className="text-sm text-slate-400">Set the areas your agency operates in and the property types you focus on.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Locations Section */}
        <div className="bg-zinc-900/50 p-6 md:p-8 rounded-3xl border border-white/5 shadow-sm space-y-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2"><MapPin className="text-[#D4AF37] h-5 w-5" /> Manage Locations</h3>

          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for a city or area..."
                className="w-full pr-12 bg-zinc-950 border border-white/10 focus:border-[#D4AF37] rounded-xl text-sm p-3 pl-12 text-white outline-none transition-all"
                value={searchQuery}
                onChange={handleSearchChange}
              />
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSearchResults([]);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {searchResults.length > 0 && (
              <div className="bg-zinc-950 border border-white/10 rounded-xl max-h-60 overflow-y-auto shadow-lg">
                {searchResults.map((result) => (
                  <div
                    key={result.lat + result.lon + result.display_name}
                    className="p-3 flex justify-between items-center hover:bg-zinc-800 cursor-pointer border-b border-white/5 last:border-b-0"
                  >
                    <span className="text-zinc-300 text-sm">{result.display_name}</span>
                    <button
                      onClick={() => {
                        addPreferredLocation(result.display_name);
                        setMapCenter([parseFloat(result.lat), parseFloat(result.lon)]);
                        setMapMarker([parseFloat(result.lat), parseFloat(result.lon)]);
                      }}
                      className="text-[#D4AF37] hover:bg-[#D4AF37]/10 px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-1 transition"
                    >
                      <PlusCircle size={16} /> Add
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedLocationFromMap && (
            <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl flex justify-between items-center gap-4">
              <span className="flex items-center gap-2 text-sm font-medium text-amber-400 leading-tight">
                <MapPin size={16} className="shrink-0" /> {selectedLocationFromMap}
              </span>
              <button
                onClick={() => addPreferredLocation(selectedLocationFromMap)}
                className="shrink-0 text-amber-400 hover:bg-amber-500/20 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
              >
                <PlusCircle size={14} /> Add
              </button>
            </div>
          )}

          <div className="h-[250px] w-full rounded-2xl overflow-hidden border border-white/10 shadow-inner">
            <MapContainer
              center={isValidCoordinate(mapCenter) ? mapCenter : [20.5937, 78.9629]}
              zoom={isValidCoordinate(mapCenter) ? 10 : 4}
              style={{ height: "100%", width: "100%", background: "#18181b" }}
              zoomControl={true}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                attribution="&copy; OpenStreetMap"
              />
              <LocationMarker position={mapMarker} setPosition={handleMapMarkerChange} onLocationNameFound={handleLocationNameFromMap} />
              <LocateControl setCoordinates={handleMapMarkerChange} onLocationNameFound={handleLocationNameFromMap} />
            </MapContainer>
          </div>

          <div>
            <h4 className="text-xs font-semibold mb-3 text-zinc-500 uppercase tracking-wider">Your Preferred Locations</h4>
            {preferredLocations.length === 0 ? (
              <p className="text-zinc-600 text-sm">No preferred locations added yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {preferredLocations.map((location, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 bg-[#D4AF37]/10 text-[#D4AF37] text-xs font-medium px-3 py-1.5 rounded-full border border-[#D4AF37]/20"
                  >
                    {location}
                    <button onClick={() => removePreferredLocation(location)} className="hover:text-white transition-colors">
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Property Types Section */}
        <div className="gsap-section mt-12 border-t border-white/10 pt-8">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-6"><CheckCircle className="text-[#D4AF37]" /> Preferred Property Types</h2>
          <p className="text-sm text-slate-400">Select the types of properties your agency specializes in.</p>
          
          <div className="flex flex-wrap gap-3">
            {PROPERTY_TYPES.map((type) => {
              const isSelected = preferredPropertyTypes.includes(type);
              return (
                <button
                  key={type}
                  onClick={() => togglePropertyType(type)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                    isSelected
                      ? "bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37]"
                      : "bg-zinc-950 border-white/10 text-slate-400 hover:border-white/20 hover:text-white"
                  }`}
                >
                  {type}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 gap-4 items-center">
        {!hasChanges && (
          <p className="text-sm text-slate-500 italic mr-2">No changes to save</p>
        )}
        {hasChanges && (
          <button
            onClick={handleDiscard}
            disabled={isUpdating}
            className="flex items-center justify-center px-5 py-3 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
          >
            Discard Changes
          </button>
        )}
        <button
          onClick={handleSavePreferences}
          disabled={isUpdating || !hasChanges}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#D4AF37] px-8 py-3 text-sm font-semibold text-black shadow-lg shadow-[#D4AF37]/20 transition-all hover:bg-[#c4a133] hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
          Save Preferences
        </button>
      </div>
    </div>
  );
}
