import { useEffect, useRef, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { UAE_SHOWROOMS_DATA, timeToTestDriveData } from '../data/mockData';
import uaeGeoJson from '../data/uae.geojson';
import './UAEMap.css';

interface UAEMapProps {
  onShowroomClick?: (showroomId: string, showroomName: string) => void;
  onShowroomHover?: (showroomName: string | null) => void;
  selectedShowroom?: string | null;
}

// UAE boundary for limiting pan
const UAE_BOUNDS: [[number, number], [number, number]] = [
  [51.0, 22.5], // Southwest
  [57.0, 26.5]  // Northeast
];

// Create mask polygon - world bounds with UAE cut out
const createMaskGeoJson = () => {
  const uaeCoords = uaeGeoJson.features[0].geometry.coordinates[0];
  return {
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: [
          // Outer ring (world bounds)
          [[-180, -90], [-180, 90], [180, 90], [180, -90], [-180, -90]],
          // Inner ring (UAE boundary - reversed to cut out)
          [...uaeCoords].reverse()
        ]
      }
    }]
  };
};

// Create showroom GeoJSON from data
const createShowroomGeoJson = () => {
  const features = UAE_SHOWROOMS_DATA.map(showroom => {
    const perfData = timeToTestDriveData.find(d => d.showroom === showroom.shortName);
    return {
      type: 'Feature',
      properties: {
        id: showroom.id,
        name: showroom.shortName,
        fullName: showroom.name,
        city: showroom.city,
        avgDays: perfData?.avgDays || 0,
        minDays: perfData?.minDays || 0,
        maxDays: perfData?.maxDays || 0
      },
      geometry: {
        type: 'Point',
        coordinates: [showroom.longitude, showroom.latitude]
      }
    };
  });

  return { type: 'FeatureCollection', features };
};

export function UAEMap({ onShowroomClick, onShowroomHover }: UAEMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const mapLoadedRef = useRef(false);

  const handleShowroomClick = useCallback((id: string, name: string) => {
    if (onShowroomClick) {
      onShowroomClick(id, name);
    }
    window.dispatchEvent(new CustomEvent('showroom-click', { detail: { id, name } }));
  }, [onShowroomClick]);

  const handleShowroomHover = useCallback((name: string | null) => {
    if (onShowroomHover) {
      onShowroomHover(name);
    }
    window.dispatchEvent(new CustomEvent('showroom-hover', { detail: { name } }));
  }, [onShowroomHover]);

  // Initialize map only once
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      // Use Stadia Maps Alidade Smooth (English labels, clean style)
      style: {
        version: 8,
        sources: {
          'stadia': {
            type: 'raster',
            tiles: [
              'https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}@2x.png'
            ],
            tileSize: 256,
            attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          }
        },
        layers: [{
          id: 'stadia-tiles',
          type: 'raster',
          source: 'stadia',
          minzoom: 0,
          maxzoom: 20
        }]
      },
      center: [54.0, 24.2],
      zoom: 5.8,
      minZoom: 5,
      maxZoom: 12,
      maxBounds: UAE_BOUNDS
    });

    // Fit to UAE bounds with padding to ensure entire country is visible
    map.fitBounds(UAE_BOUNDS, {
      padding: { top: 20, bottom: 20, left: 20, right: 20 },
      maxZoom: 6.5
    });

    mapRef.current = map;

    map.on('load', () => {
      mapLoadedRef.current = true;

      // Add grey mask for areas outside UAE
      map.addSource('mask', {
        type: 'geojson',
        data: createMaskGeoJson() as any
      });

      map.addLayer({
        id: 'mask-layer',
        type: 'fill',
        source: 'mask',
        paint: {
          'fill-color': '#e0e0e0',
          'fill-opacity': 0.8
        }
      });

      // Add showroom points
      map.addSource('showrooms', {
        type: 'geojson',
        data: createShowroomGeoJson() as any
      });

      // Showroom circles - outer glow
      map.addLayer({
        id: 'showroom-glow',
        type: 'circle',
        source: 'showrooms',
        paint: {
          'circle-radius': 14,
          'circle-color': '#4285f4',
          'circle-opacity': 0.15,
          'circle-blur': 1
        }
      });

      // Showroom circles - main dot
      map.addLayer({
        id: 'showroom-dots',
        type: 'circle',
        source: 'showrooms',
        paint: {
          'circle-radius': 7,
          'circle-color': [
            'interpolate',
            ['linear'],
            ['get', 'avgDays'],
            2, '#34a853',
            3.5, '#fbbc04',
            5, '#ea4335'
          ],
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 2
        }
      });

      // Hover interaction - change cursor and size
      map.on('mouseenter', 'showroom-dots', (e) => {
        map.getCanvas().style.cursor = 'pointer';
        if (e.features && e.features[0]) {
          const name = e.features[0].properties?.name;
          handleShowroomHover(name);

          // Enlarge hovered dot
          map.setPaintProperty('showroom-dots', 'circle-radius', [
            'case',
            ['==', ['get', 'name'], name],
            10,
            7
          ]);
        }
      });

      map.on('mouseleave', 'showroom-dots', () => {
        map.getCanvas().style.cursor = '';
        handleShowroomHover(null);

        // Reset dot sizes
        map.setPaintProperty('showroom-dots', 'circle-radius', 7);
      });

      // Click interaction
      map.on('click', 'showroom-dots', (e) => {
        if (e.features && e.features[0]) {
          const props = e.features[0].properties;
          handleShowroomClick(props?.id, props?.name);
        }
      });
    });

    // Disable rotation
    map.dragRotate.disable();
    map.touchZoomRotate.disableRotation();

    // Resize after mount and fit bounds
    setTimeout(() => {
      map.resize();
      map.fitBounds(UAE_BOUNDS, {
        padding: { top: 20, bottom: 20, left: 20, right: 20 },
        maxZoom: 6.5
      });
    }, 100);

    // Handle container resize
    const resizeObserver = new ResizeObserver(() => {
      map.resize();
      map.fitBounds(UAE_BOUNDS, {
        padding: { top: 20, bottom: 20, left: 20, right: 20 },
        maxZoom: 6.5
      });
    });

    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      mapLoadedRef.current = false;
      map.remove();
      mapRef.current = null;
    };
  }, []); // Empty deps - only run once

  // Handle hover callback changes without reinitializing map
  useEffect(() => {
    if (!mapRef.current || !mapLoadedRef.current) return;

    const map = mapRef.current;

    // Update event handlers when callbacks change
    const handleEnter = (e: maplibregl.MapMouseEvent & { features?: maplibregl.MapGeoJSONFeature[] }) => {
      map.getCanvas().style.cursor = 'pointer';
      if (e.features && e.features[0]) {
        const name = e.features[0].properties?.name;
        handleShowroomHover(name);
        map.setPaintProperty('showroom-dots', 'circle-radius', [
          'case',
          ['==', ['get', 'name'], name],
          10,
          7
        ]);
      }
    };

    const handleLeave = () => {
      map.getCanvas().style.cursor = '';
      handleShowroomHover(null);
      map.setPaintProperty('showroom-dots', 'circle-radius', 7);
    };

    const handleClick = (e: maplibregl.MapMouseEvent & { features?: maplibregl.MapGeoJSONFeature[] }) => {
      if (e.features && e.features[0]) {
        const props = e.features[0].properties;
        handleShowroomClick(props?.id, props?.name);
      }
    };

    // These will update if callbacks change
    map.off('mouseenter', 'showroom-dots', handleEnter as any);
    map.off('mouseleave', 'showroom-dots', handleLeave);
    map.off('click', 'showroom-dots', handleClick as any);

    map.on('mouseenter', 'showroom-dots', handleEnter as any);
    map.on('mouseleave', 'showroom-dots', handleLeave);
    map.on('click', 'showroom-dots', handleClick as any);
  }, [handleShowroomClick, handleShowroomHover]);

  return (
    <div className="uae-map-container">
      <div ref={mapContainerRef} className="uae-map" />
      <div className="map-legend">
        <span className="legend-title">Avg. Days to Test Drive</span>
        <div className="legend-items">
          <span className="legend-item">
            <span className="dot" style={{ backgroundColor: '#34a853' }} />
            Fast (&lt;3d)
          </span>
          <span className="legend-item">
            <span className="dot" style={{ backgroundColor: '#fbbc04' }} />
            Medium
          </span>
          <span className="legend-item">
            <span className="dot" style={{ backgroundColor: '#ea4335' }} />
            Slow (&gt;4d)
          </span>
        </div>
      </div>
    </div>
  );
}

export default UAEMap;
