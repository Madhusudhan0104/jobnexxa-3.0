import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Briefcase,
  CheckCircle2,
  ChevronRight,
  Filter,
  Hammer,
  Layers,
  MapPin,
  Paintbrush,
  Phone,
  Sparkles,
  Star,
  Truck,
  Users,
  Wrench,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { CITIES_AND_AREAS, SKILL_CATEGORIES } from '../../data/mockData.ts';
import { SkillCategory, WorkerProfile } from '../../types.ts';

// Geographical coordinates for Bangalore areas
export const AREA_COORDINATES: Record<
  string,
  { lat: number; lng: number; zoom: number; description: string }
> = {
  Koramangala: {
    lat: 12.9352,
    lng: 77.6245,
    zoom: 14,
    description: 'Commercial & startup hub with high demand for technicians & cleaners',
  },
  Indiranagar: {
    lat: 12.9784,
    lng: 77.6408,
    zoom: 14,
    description: 'Upscale residential & dining district with high electrical & plumbing demand',
  },
  Whitefield: {
    lat: 12.9698,
    lng: 77.7499,
    zoom: 14,
    description: 'Major IT corridor & gated communities requiring painters, masons & drivers',
  },
  'HSR Layout': {
    lat: 12.9121,
    lng: 77.6446,
    zoom: 14,
    description: 'Residential sectors with heavy domestic help & home repair needs',
  },
  Jayanagar: {
    lat: 12.9308,
    lng: 77.5838,
    zoom: 14,
    description: 'Traditional neighborhood with older buildings needing plumbing upgrades',
  },
  'BTM Layout': {
    lat: 12.9166,
    lng: 77.6101,
    zoom: 14,
    description: 'Dense student & professional rental zones with quick-service turnarounds',
  },
};

// Calculate realistic map placement within the worker's Bangalore neighborhood
export const getWorkerCoordinates = (worker: WorkerProfile): { lat: number; lng: number } => {
  const baseArea = AREA_COORDINATES[worker.area] || AREA_COORDINATES['Koramangala'] || { lat: 12.9352, lng: 77.6245 };
  let hash = 0;
  for (let i = 0; i < worker.id.length; i++) {
    hash = (hash << 5) - hash + worker.id.charCodeAt(i);
    hash |= 0;
  }
  const offsetLat = ((Math.abs(hash) % 80) - 40) * 0.0002;
  const offsetLng = ((Math.abs(hash >> 3) % 80) - 40) * 0.0002;
  return {
    lat: baseArea.lat + offsetLat,
    lng: baseArea.lng + offsetLng,
  };
};

export const EmployerWorkerMap: React.FC = () => {
  const {
    workers,
    setSelectedWorkerId,
    setHireRequestWorkerId,
    getAvailabilityCount,
  } = useApp();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [selectedArea, setSelectedArea] = useState<string>('All Areas');
  const [selectedSkill, setSelectedSkill] = useState<string>('All');
  const [availableOnly, setAvailableOnly] = useState<boolean>(true);
  const [focusedWorker, setFocusedWorker] = useState<WorkerProfile | null>(null);

  const areas = ['All Areas', ...CITIES_AND_AREAS.Bangalore];

  // Filter workers based on current controls
  const filteredWorkers = workers.filter((w) => {
    const matchArea =
      selectedArea === 'All Areas' || w.area.toLowerCase() === selectedArea.toLowerCase();
    const matchSkill =
      selectedSkill === 'All' ||
      w.primarySkill === selectedSkill ||
      w.secondarySkills.includes(selectedSkill);
    const matchAvail = !availableOnly || w.availabilityStatus === 'available';

    return matchArea && matchSkill && matchAvail;
  });

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Center of Bangalore
      const map = L.map(mapContainerRef.current, {
        center: [12.9538, 77.6400],
        zoom: 12,
        zoomControl: true,
        attributionControl: true,
      });

      // OpenStreetMap high quality tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors | Jobnexa GeoEngine',
        maxZoom: 18,
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      mapInstanceRef.current = map;
    }

    return () => {
      // Keep map alive during tab shifts or cleanup if unmounted
    };
  }, []);

  // Sync Markers when filters or workers state updates
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    // 1. Add Area Cluster Summary Circles (Only when viewing All Areas or specific area)
    CITIES_AND_AREAS.Bangalore.forEach((areaName) => {
      const areaCoords = AREA_COORDINATES[areaName];
      if (!areaCoords) return;

      const availInArea = workers.filter(
        (w) =>
          w.area.toLowerCase() === areaName.toLowerCase() &&
          w.availabilityStatus === 'available' &&
          (selectedSkill === 'All' || w.primarySkill === selectedSkill)
      ).length;

      // Circle highlight per neighborhood
      const isSelected = selectedArea === areaName;
      const circleColor = isSelected
        ? '#F97316'
        : availInArea > 0
        ? '#0EA5E9'
        : '#94A3B8';

      const circle = L.circle([areaCoords.lat, areaCoords.lng], {
        color: circleColor,
        fillColor: circleColor,
        fillOpacity: isSelected ? 0.2 : 0.1,
        weight: isSelected ? 2.5 : 1.5,
        radius: isSelected ? 1200 : 900,
      });

      circle.on('click', () => {
        setSelectedArea(areaName);
        map.flyTo([areaCoords.lat, areaCoords.lng], 14, { duration: 1 });
      });

      circle.addTo(markersGroup);

      // Area label marker badge
      const labelHtml = `
        <div class="custom-marker-pin cursor-pointer flex items-center gap-1.5 bg-slate-900/90 text-white text-[11px] font-bold py-1 px-2.5 rounded-full shadow-lg border border-white/20 whitespace-nowrap hover:bg-orange-600 transition-colors">
          <span class="w-2 h-2 rounded-full ${availInArea > 0 ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}"></span>
          <span>${areaName}</span>
          <span class="bg-white/20 px-1.5 py-0.2 rounded-full text-[10px] text-amber-300 font-extrabold">${availInArea}</span>
        </div>
      `;

      const areaIcon = L.divIcon({
        html: labelHtml,
        className: 'border-none bg-transparent',
        iconSize: [120, 26],
        iconAnchor: [60, 13],
      });

      const areaMarker = L.marker([areaCoords.lat + 0.007, areaCoords.lng], {
        icon: areaIcon,
      });

      areaMarker.on('click', () => {
        setSelectedArea(areaName);
        map.flyTo([areaCoords.lat, areaCoords.lng], 14, { duration: 1 });
      });

      areaMarker.addTo(markersGroup);
    });

    // 2. Render individual worker markers with custom avatars
    filteredWorkers.forEach((worker) => {
      const coords = getWorkerCoordinates(worker);

      const isAvail = worker.availabilityStatus === 'available';
      const isSelected = focusedWorker?.id === worker.id;

      const markerHtml = `
        <div class="custom-marker-pin relative flex flex-col items-center cursor-pointer group">
          <div class="relative w-10 h-10 rounded-full border-2 ${
            isSelected
              ? 'border-orange-500 scale-125 ring-4 ring-orange-500/30'
              : isAvail
              ? 'border-emerald-500 ring-2 ring-emerald-400/40'
              : 'border-slate-400 opacity-70'
          } shadow-lg bg-white overflow-hidden transition-all">
            <img src="${worker.avatar}" alt="${worker.name}" class="w-full h-full object-cover" />
            <span class="absolute bottom-0 right-0 w-3 h-3 rounded-full ${
              isAvail ? 'bg-emerald-500' : 'bg-amber-500'
            } border border-white"></span>
          </div>

          <div class="bg-slate-900/90 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-md shadow-md mt-1 whitespace-nowrap flex items-center gap-1 border border-white/20">
            <span>${worker.name.split(' ')[0]}</span>
            <span class="text-orange-400 font-semibold">₹${worker.expectedWage}</span>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'border-none bg-transparent',
        iconSize: [44, 60],
        iconAnchor: [22, 54],
      });

      const marker = L.marker([coords.lat, coords.lng], { icon: customIcon });

      marker.on('click', () => {
        setFocusedWorker(worker);
        map.panTo([coords.lat, coords.lng], { animate: true });
      });

      marker.addTo(markersGroup);
    });
  }, [filteredWorkers, selectedArea, selectedSkill, focusedWorker, workers]);

  // Jump to specific area on area button click
  const handleAreaChange = (newArea: string) => {
    setSelectedArea(newArea);
    setFocusedWorker(null);

    const map = mapInstanceRef.current;
    if (!map) return;

    if (newArea === 'All Areas') {
      map.flyTo([12.9538, 77.6400], 12, { duration: 1 });
    } else {
      const coords = AREA_COORDINATES[newArea];
      if (coords) {
        map.flyTo([coords.lat, coords.lng], coords.zoom, { duration: 1 });
      }
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Top Filter & Area Jump Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                Live Geographic Map View
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
              Workers Near You on Interactive Map
            </h2>
            <p className="text-xs text-slate-500">
              Locate available tradespeople by neighborhood pins, view rates, and hire on the spot
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
              {filteredWorkers.length} Workers Shown
            </span>
          </div>
        </div>

        {/* Quick Area Jump Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <span className="text-slate-400 font-semibold flex items-center gap-1 shrink-0 mr-1">
            <MapPin className="w-3.5 h-3.5 text-orange-500" />
            Area:
          </span>
          {areas.map((a) => {
            const isSelected = selectedArea === a;
            return (
              <button
                key={a}
                onClick={() => handleAreaChange(a)}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all shrink-0 ${
                  isSelected
                    ? 'bg-[#1A3C6E] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {a}
              </button>
            );
          })}
        </div>

        {/* Skill Category & Availability Filter Row */}
        <div className="flex flex-wrap items-center gap-2 text-xs pt-1 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-600">Domain:</span>
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="bg-slate-100 text-slate-800 font-medium py-1 px-2.5 rounded-lg border border-slate-200 focus:outline-none"
            >
              <option value="All">All Trades & Skills</option>
              {SKILL_CATEGORIES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setAvailableOnly(!availableOnly)}
            className={`px-2.5 py-1 rounded-lg font-semibold border transition-colors ${
              availableOnly
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            {availableOnly ? '✓ Available Now' : 'Show All'}
          </button>

          {selectedArea !== 'All Areas' && AREA_COORDINATES[selectedArea] && (
            <span className="text-[11px] text-slate-500 hidden md:inline-block ml-auto italic">
              {AREA_COORDINATES[selectedArea].description}
            </span>
          )}
        </div>
      </div>

      {/* Main Map + Side Drawer Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
        
        {/* Leaflet Map Frame (2 Cols on desktop) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden flex flex-col relative min-h-[460px] sm:min-h-[520px]">
          <div
            ref={mapContainerRef}
            className="w-full h-full min-h-[460px] sm:min-h-[520px] z-10"
          />

          {/* Map Overlay Controls / Legend */}
          <div className="absolute top-3 right-3 z-20 bg-white/95 backdrop-blur-md p-2.5 rounded-2xl shadow-lg border border-slate-200/80 text-[11px] space-y-1.5 pointer-events-auto">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-orange-500" />
              <span>Map Legend</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <span className="w-3 h-3 rounded-full bg-emerald-500 border border-white shadow"></span>
              <span>Available Worker</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <span className="w-3 h-3 rounded-full bg-amber-500 border border-white shadow"></span>
              <span>Currently Hired</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <span className="w-3 h-3 rounded-full bg-sky-500 border border-white shadow"></span>
              <span>Area Supply Cluster</span>
            </div>
          </div>
        </div>

        {/* Worker Cards / Neighborhood Info Sidebar (1 Col) */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-4 sm:p-5 flex flex-col justify-between space-y-4 max-h-[520px] overflow-hidden">
          
          <div className="space-y-3 flex-1 overflow-y-auto pr-1">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600">
                  {selectedArea === 'All Areas' ? 'Bangalore Wide' : selectedArea}
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Workers Stationed in Area
                </h3>
              </div>
              <span className="text-xs font-bold text-[#1A3C6E] bg-slate-100 px-2.5 py-1 rounded-full">
                {filteredWorkers.length} Found
              </span>
            </div>

            {/* If a worker marker was clicked, spotlight them! */}
            {focusedWorker && (
              <div className="bg-orange-50/80 border-2 border-orange-400 p-3.5 rounded-2xl space-y-2 animate-in fade-in duration-200">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={focusedWorker.avatar}
                      alt={focusedWorker.name}
                      className="w-11 h-11 rounded-full object-cover ring-2 ring-orange-500"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="flex items-center gap-1">
                        <h4 className="text-sm font-bold text-slate-900">
                          {focusedWorker.name}
                        </h4>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                      <span className="text-xs font-semibold text-orange-600">
                        {focusedWorker.primarySkill}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setFocusedWorker(null)}
                    className="text-slate-400 hover:text-slate-600 text-xs font-bold"
                  >
                    ✕
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                  <span className="flex items-center text-amber-600 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 mr-0.5" />
                    {focusedWorker.rating} ({focusedWorker.reviewCount})
                  </span>
                  <span className="font-extrabold text-[#1A3C6E]">
                    ₹{focusedWorker.expectedWage} / {focusedWorker.wageType}
                  </span>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 italic">
                  "{focusedWorker.bio}"
                </p>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => setSelectedWorkerId(focusedWorker.id)}
                    className="flex-1 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => setHireRequestWorkerId(focusedWorker.id)}
                    className="flex-1 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-sm transition-transform active:scale-95"
                  >
                    Hire Worker
                  </button>
                </div>
              </div>
            )}

            {/* List of workers in this area */}
            <div className="space-y-2.5">
              {filteredWorkers.length === 0 ? (
                <div className="py-10 text-center text-slate-400 text-xs space-y-1">
                  <Users className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="font-bold text-slate-600">No active workers in this filter</p>
                  <p>Try switching to "All Areas" or checking other domains.</p>
                </div>
              ) : (
                filteredWorkers.map((w) => {
                  const isAvail = w.availabilityStatus === 'available';
                  const isSpotlight = focusedWorker?.id === w.id;

                  return (
                    <div
                      key={w.id}
                      onClick={() => {
                        setFocusedWorker(w);
                        const coords = getWorkerCoordinates(w);
                        if (coords && mapInstanceRef.current) {
                          mapInstanceRef.current.panTo([coords.lat, coords.lng], {
                            animate: true,
                          });
                        }
                      }}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSpotlight
                          ? 'bg-orange-50/60 border-orange-400 shadow-sm'
                          : 'bg-slate-50/70 border-slate-200/70 hover:border-slate-300 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={w.avatar}
                          alt={w.name}
                          className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <h5 className="text-xs font-bold text-slate-900 leading-tight">
                              {w.name}
                            </h5>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                                isAvail
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {isAvail ? 'Available' : 'Hired'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                            <span className="font-medium text-orange-600">{w.primarySkill}</span>
                            <span>·</span>
                            <span className="flex items-center text-amber-600 font-semibold">
                              ★ {w.rating}
                            </span>
                            <span>·</span>
                            <span>{w.area}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-extrabold text-[#1A3C6E] block">
                          ₹{w.expectedWage}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 inline-block" />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>

          <div className="pt-2 border-t border-slate-100 text-center">
            <span className="text-[11px] text-slate-400 block">
              Tip: Click any marker or circle on the map to inspect worker availability.
            </span>
          </div>

        </div>

      </div>

    </div>
  );
};
