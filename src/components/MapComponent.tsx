import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import karnatakaData from '../lib/karnataka.json';

// Karnataka center coordinates and bounds
const KARNATAKA_CENTER: [number, number] = [15.3173, 75.7139];
const KARNATAKA_BOUNDS: [[number, number], [number, number]] = [
  [11.5, 74.0],  // Southwest corner
  [18.5, 78.5]   // Northeast corner
];

// More restrictive bounds to focus on Karnataka and hide neighboring states
const KARNATAKA_MAP_BOUNDS: [[number, number], [number, number]] = [
  [12.5, 74.5],  // Southwest corner (more restrictive)
  [17.5, 77.5]   // Northeast corner (more restrictive)
];

interface MapComponentProps {
  selectedCenter?: any;
  onCenterSelect?: (center: any) => void;
  className?: string;
}

const MapComponent: React.FC<MapComponentProps> = ({
  selectedCenter,
  onCenterSelect,
  className = "h-96 w-full rounded-lg"
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map with Karnataka bounds
    const map = L.map(mapRef.current, {
      center: KARNATAKA_CENTER,
      zoom: 8,
      minZoom: 7,
      maxZoom: 11,
      maxBounds: [
        [KARNATAKA_BOUNDS[0][0] - 1, KARNATAKA_BOUNDS[0][1] - 1],
        [KARNATAKA_BOUNDS[1][0] + 1, KARNATAKA_BOUNDS[1][1] + 1]
      ],
      maxBoundsViscosity: 1.0
    });

    // Fit map to Karnataka bounds
    map.fitBounds(KARNATAKA_MAP_BOUNDS);

    // Add tile layer with Karnataka-focused view
    L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 11,
      minZoom: 7
    }).addTo(map);

    // Add a subtle background layer to focus attention on Karnataka
    const backgroundLayer = L.rectangle([
      [KARNATAKA_BOUNDS[0][0] - 1, KARNATAKA_BOUNDS[0][1] - 1],
      [KARNATAKA_BOUNDS[1][0] + 1, KARNATAKA_BOUNDS[1][1] + 1]
    ], {
      color: 'transparent',
      fillColor: '#f8f9fa',
      fillOpacity: 0.6,
      weight: 0
    }).addTo(map);

    // Create a rectangle to highlight Karnataka boundaries
    const karnatakaBounds = L.rectangle(KARNATAKA_BOUNDS, {
      color: '#003366',
      weight: 3,
      fill: false,
      dashArray: '5, 10'
    }).addTo(map);
    
    // Bring the Karnataka bounds to the front
    karnatakaBounds.bringToFront();

    // Add GeoJSON layer for Karnataka districts
    const geoJsonLayer = L.geoJSON(karnatakaData as any, {
      style: {
        color: '#003366',
        weight: 2,
        opacity: 1,
        fillColor: '#003366',
        fillOpacity: 0.1
      },
      onEachFeature: (feature, layer) => {
        if (feature.properties && feature.properties.district) {
          layer.bindPopup(`<b>${feature.properties.district}</b>`);

          // Add district name label at the center
          const center = (layer as L.Polygon).getBounds().getCenter();
          L.marker(center, {
            icon: L.divIcon({
              html: `<div class="district-label">${feature.properties.district}</div>`,
              className: 'district-label-icon',
              iconSize: [100, 20],
              iconAnchor: [50, 10]
            })
          }).addTo(map);
        }
      }
    }).addTo(map);

    // Fit map to GeoJSON bounds
    map.fitBounds(geoJsonLayer.getBounds());

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [onCenterSelect]);

  return (
    <div
      ref={mapRef}
      className={`${className} bg-gray-100`}
      style={{ minHeight: '400px' }}
    />
  );
};

export default MapComponent;
