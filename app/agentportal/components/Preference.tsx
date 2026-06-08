'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation, Search, X, MapPin, PlusCircle, CheckCircle } from 'lucide-react';
import { updateAgentPreferences } from "@/lib/agents/dashboardService";
import { Agent } from "@/utils/user"; // Fixed path to user.ts where Agent is defined

// Fix Leaflet default icon issue
const fixLeafletIcon = () => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    });
};

// Custom Gold Icon
const goldIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9ncmFwaGljcy9zdmcvPCEtLUlPTiBGT05UQVdFU09NRSA1IEZSRUUvLSA+PHBhdGggZmlsbD0iI0ZCQkYyNCIgZD0iTTE3Mi4xLDIwMS43QzEzMC44LDEzNS45LDUxLDIyLDIwLjcsNzQuMkMxMC42LDE1Ny4xLDkxLjgsMjIzLDE3Mi4xLDIwMS43eiIgdHJhbnNmb3JtPSJtYXRyaXgoMS4wNzI0MywwLDAsMS4wNzI0MywtMzEuOTk3NSwtMzAuMDEzMykiIGlkPSJyZWctZ2xvYi1tb2JhYyI+PC9wYXRoPjwvc3ZnPg==',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
});

// Helper to validate coordinates
const isValidCoordinate = (coords: any): coords is [number, number] => {
    return Array.isArray(coords) &&
        coords.length === 2 &&
        typeof coords[0] === 'number' && Number.isFinite(coords[0]) &&
        typeof coords[1] === 'number' && Number.isFinite(coords[1]);
};

interface LocationMarkerProps {
    position: [number, number] | null;
    setPosition: (pos: [number, number]) => void;
    onLocationNameFound: (name: string) => void;
}

const LocationMarker: React.FC<LocationMarkerProps> = ({ position, setPosition, onLocationNameFound }) => {
    const map = useMap();

    // Fly to position when it changes
    useEffect(() => {
        if (isValidCoordinate(position)) {
            const timer = setTimeout(() => {
                const lat = Number(position[0]);
                const lng = Number(position[1]);

                if (Number.isFinite(lat) && Number.isFinite(lng)) {
                    map.flyTo([lat, lng], 14, { // Slightly lower zoom for broader context
                        duration: 1.5
                    });
                }
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [position, map]);

    useMapEvents({
        click(e: L.LeafletMouseEvent) {
            setPosition([e.latlng.lat, e.latlng.lng]);
            reverseGeocode(e.latlng.lat, e.latlng.lng, onLocationNameFound);
        },
    });

    return isValidCoordinate(position) ? (
        <Marker position={position} icon={goldIcon}></Marker>
    ) : null;
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
        map.locate().on("locationfound", function (e) {
            const newPos: [number, number] = [e.latlng.lat, e.latlng.lng];
            setCoordinates(newPos);
            reverseGeocode(e.latlng.lat, e.latlng.lng, onLocationNameFound);
            map.flyTo(newPos, 14, { duration: 1.5 });
            setLoading(false);
        }).on("locationerror", function (e) {
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
                        <span className="loading loading-spinner loading-xs text-[#FBBF24]"></span>
                    ) : (
                        <Navigation size={20} className="text-black" fill="black" />
                    )}
                </button>
            </div>
        </div>
    );
};

// Reverse Geocoding Function
async function reverseGeocode(lat: number, lon: number, callback: (name: string) => void) {
    try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`);
        const data = await res.json();
        if (data && data.address) {
            const address = data.address;
            let locationName = address.city || address.town || address.village || address.county || address.state || data.display_name.split(',')[0];
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


interface PreferenceProps {
    agent: Agent & { id: string };
    setAgent: React.Dispatch<React.SetStateAction<(Agent & { id: string }) | null>>;
}

interface NominatimResult {
    display_name: string;
    lat: string;
    lon: string;
}

const Preference: React.FC<PreferenceProps> = ({ agent, setAgent }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<NominatimResult[]>([]);
    const [preferredLocations, setPreferredLocations] = useState<string[]>(agent.preferredLocations || []);
    const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
    const [mapMarker, setMapMarker] = useState<[number, number] | null>(null);
    const [selectedLocationFromMap, setSelectedLocationFromMap] = useState<string | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        fixLeafletIcon();
    }, []);

    const searchCity = useCallback(async (query: string) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5`
            );
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
        const cleanedLocationName = locationName.split(',').map(s => s.trim()).filter(Boolean).join(', ');
        if (cleanedLocationName && !preferredLocations.includes(cleanedLocationName)) {
            setPreferredLocations((prev) => [...prev, cleanedLocationName]);
            setSearchQuery(''); // Clear search after adding
            setSearchResults([]); // Clear search results
            setSelectedLocationFromMap(null); // Clear map selection
        }
    };

    const removePreferredLocation = (locationName: string) => {
        setPreferredLocations((prev) => prev.filter((loc) => loc !== locationName));
    };

    const handleSavePreferences = async () => {
        setIsUpdating(true);
        try {
            const success = await updateAgentPreferences(agent.uid, agent.email, preferredLocations);
            if (!success) throw new Error("Failed to update preferred locations");
            setAgent(prevAgent => prevAgent ? { ...prevAgent, preferredLocations: preferredLocations } : null);
            alert("Preferred locations updated successfully!");
        } catch (error) {
            console.error("Error saving preferred locations:", error);
            alert("Failed to update preferred locations.");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleMapMarkerChange = (coords: [number, number]) => {
        setMapMarker(coords);
        setMapCenter(coords); // Update map center to the new marker position
    };

    const handleLocationNameFromMap = (name: string) => {
        setSelectedLocationFromMap(name);
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            <h2 className="text-xl font-bold text-white mb-2">
                Preferred Sale Locations
            </h2>

            <div className="p-8 bg-zinc-900/50 border border-white/5 rounded-3xl shadow-sm">
                <h3 className="text-lg font-bold mb-4 text-white">Manage Locations</h3>

                {/* Location Search and Add */}
                <div className="mb-6 space-y-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search for a city or area..."
                            className="w-full pr-12 bg-zinc-950 border border-white/10 focus:border-[#D4AF37] rounded-xl text-sm p-4 pl-12 text-white outline-none"
                            value={searchQuery}
                            onChange={handleSearchChange}
                        />
                        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                        {searchQuery && (
                            <button
                                onClick={() => { setSearchQuery(''); setSearchResults([]); }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                            >
                                <X size={20} />
                            </button>
                        )}
                    </div>

                    {searchResults.length > 0 && (
                        <div className="bg-zinc-950 border border-white/10 rounded-xl max-h-60 overflow-y-auto shadow-lg">
                            {searchResults.map((result) => (
                                <div
                                    key={result.lat + result.lon + result.display_name}
                                    className="p-4 flex justify-between items-center hover:bg-zinc-800 cursor-pointer border-b border-white/5 last:border-b-0"
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

                {/* Selected Location from Map */}
                {selectedLocationFromMap && (
                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl mb-6 flex justify-between items-center">
                        <span className="flex items-center gap-2 text-sm font-medium text-amber-400">
                            <MapPin size={18} /> Location from map: {selectedLocationFromMap}
                        </span>
                        <button
                            onClick={() => addPreferredLocation(selectedLocationFromMap)}
                            className="text-amber-400 hover:bg-amber-500/20 px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-1 transition"
                        >
                            <PlusCircle size={16} /> Add to Preferred
                        </button>
                    </div>
                )}


                {/* Map Section */}
                <div className="h-[400px] w-full rounded-2xl overflow-hidden mb-6 border border-white/10 shadow-md">
                    <MapContainer
                        center={isValidCoordinate(mapCenter) ? mapCenter : [20.5937, 78.9629]} // Default to India center
                        zoom={isValidCoordinate(mapCenter) ? 10 : 4}
                        style={{ height: '100%', width: '100%', background: '#18181b' }}
                        zoomControl={true}
                    >
                        <TileLayer
                            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                            attribution='&copy; OpenStreetMap'
                        />
                        <LocationMarker position={mapMarker} setPosition={handleMapMarkerChange} onLocationNameFound={handleLocationNameFromMap} />
                        <LocateControl setCoordinates={handleMapMarkerChange} onLocationNameFound={handleLocationNameFromMap} />
                    </MapContainer>
                </div>


                {/* Display Preferred Locations */}
                <div className="mb-8">
                    <h4 className="text-sm font-semibold mb-3 text-zinc-400 uppercase tracking-wider">Your Preferred Locations:</h4>
                    {preferredLocations.length === 0 ? (
                        <p className="text-zinc-600 text-sm">No preferred locations added yet.</p>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {preferredLocations.map((location, index) => (
                                <span
                                    key={index}
                                    className="inline-flex items-center gap-2 bg-[#D4AF37]/10 text-[#D4AF37] text-sm font-medium px-4 py-2 rounded-full border border-[#D4AF37]/20"
                                >
                                    {location}
                                    <button
                                        onClick={() => removePreferredLocation(location)}
                                        className="text-[#D4AF37] hover:text-white transition-colors"
                                    >
                                        <X size={14} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                <button
                    onClick={handleSavePreferences}
                    disabled={isUpdating}
                    className="w-full px-6 py-4 bg-[#D4AF37] text-black font-bold rounded-xl hover:bg-[#c4a133] transition-colors shadow-[0_0_20px_rgba(212,175,55,0.2)] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {isUpdating ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent" /> Saving...
                        </>
                    ) : (
                        <>
                            <CheckCircle size={20} /> Save Preferred Locations
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default Preference;
