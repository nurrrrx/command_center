import { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { UAE_SHOWROOMS_DATA } from '../data/mockData';
import uaeGeoJson from '../data/uae.geojson';
import './LiveTestDrives.css';

interface LiveTestDrivesProps {
  headless?: boolean;
}

// Car models with their images and colors
const CAR_MODELS = [
  { model: 'RX350', type: 'SUV', color: '#4285f4', image: '/models/rx350.png' },
  { model: 'LX600', type: 'SUV', color: '#34a853', image: '/models/lx600.png' },
  { model: 'NX350', type: 'SUV', color: '#fbbc04', image: '/models/nx350.avif' },
  { model: 'ES350', type: 'Sedan', color: '#ea4335', image: '/models/es350.png' },
  { model: 'LC500', type: 'Performance', color: '#9334e6', image: '/models/lc500.png' },
];

// UAE road network paths - Real coordinates from OpenStreetMap
const UAE_ROADS = [
  // E11 Sheikh Zayed Road - Dubai (OSM Way 10550036, 10550037, 10550038)
  {
    name: 'E11-Sheikh-Zayed-Road',
    showroom: 'Sheikh Zayed Road',
    points: [
      [55.2909789, 25.2298678],
      [55.2907014, 25.2298135],
      [55.2904016, 25.2297500],
      [55.2901033, 25.2296806],
      [55.2898069, 25.2296053],
      [55.2895123, 25.2295242],
      [55.2892197, 25.2294373],
      [55.2889293, 25.2293446],
      [55.2886412, 25.2292462],
      [55.2883556, 25.2291421],
      [55.2851351, 25.2260809],
      [55.2825811, 25.2223342],
      [55.2819295, 25.2213480],
    ]
  },
  // E311 Sheikh Mohammed Bin Zayed Road - Northern Section (OSM Way 26654612)
  {
    name: 'E311-SMBZ-North',
    showroom: 'Sharjah',
    points: [
      [55.4380109, 25.2975930],
      [55.4387937, 25.2986989],
      [55.4390877, 25.2991205],
      [55.4393627, 25.2994855],
      [55.4396079, 25.2997805],
      [55.4402571, 25.3006603],
    ]
  },
  // E311 Upper-Mid Section (OSM Way 307675469) - Main route to Sharjah/northern emirates
  {
    name: 'E311-SMBZ-Mid',
    showroom: 'DFC',
    points: [
      [55.4977196, 25.3575225],
      [55.4979705, 25.3574852],
      [55.5004173, 25.3571278],
      [55.5011756, 25.3570431],
      [55.5015503, 25.3570066],
      [55.5019260, 25.3569798],
      [55.5023025, 25.3569628],
      [55.5026793, 25.3569556],
      [55.5030562, 25.3569583],
      [55.5034328, 25.3569708],
      [55.5038089, 25.3569931],
      [55.5041490, 25.3570186],
      [55.5044881, 25.3570531],
      [55.5048260, 25.3570959],
      [55.5051624, 25.3571472],
      [55.5054972, 25.3572067],
      [55.5065168, 25.3573835],
      [55.5101209, 25.3580843],
      [55.5119153, 25.3583929],
      [55.5196053, 25.3598273],
      [55.5220719, 25.3602840],
      [55.5258230, 25.3609753],
    ]
  },
  // E311 Extended Route to Northern Emirates (OSM continuation)
  {
    name: 'E311-SMBZ-Extended',
    showroom: 'Ajman',
    points: [
      [55.5259219, 25.3609935],
      [55.5281679, 25.3614056],
      [55.5303016, 25.3618149],
      [55.5397711, 25.3635397],
      [55.5415764, 25.3638685],
      [55.5448534, 25.3644970],
      [55.5453931, 25.3646183],
      [55.5459600, 25.3647420],
      [55.5465016, 25.3648814],
      [55.5470353, 25.3650169],
      [55.5475649, 25.3651667],
      [55.5480996, 25.3653260],
      [55.5486111, 25.3654997],
      [55.5496353, 25.3658474],
      [55.5508527, 25.3663253],
      [55.5520047, 25.3668793],
      [55.5528184, 25.3672634],
      [55.5536174, 25.3676650],
    ]
  },
  // E311 Continued - approaching UAQ/RAK (OSM continuation)
  {
    name: 'E311-To-UAQ',
    showroom: 'Umm Al Quwain',
    points: [
      [55.5541908, 25.3679772],
      [55.5550474, 25.3684859],
      [55.5561104, 25.3691696],
      [55.5567589, 25.3696141],
      [55.5577566, 25.3703350],
      [55.5582274, 25.3707017],
      [55.5586775, 25.3710618],
      [55.5595175, 25.3717803],
      [55.5601411, 25.3723690],
      [55.5605309, 25.3727544],
      [55.5610613, 25.3732980],
      [55.5614231, 25.3736887],
      [55.5617778, 25.3740846],
      [55.5621632, 25.3745196],
      [55.5627416, 25.3751639],
      [55.5632552, 25.3758417],
      [55.5637112, 25.3764616],
      [55.5641096, 25.3770493],
    ]
  },
  // E311 Northern Approach (OSM continuation)
  {
    name: 'E311-Northern',
    showroom: 'Ras Al Khaimah',
    points: [
      [55.5645259, 25.3776982],
      [55.5649480, 25.3783924],
      [55.5651865, 25.3788178],
      [55.5654177, 25.3792465],
      [55.5656416, 25.3796783],
      [55.5658582, 25.3801132],
      [55.5660673, 25.3805510],
      [55.5662690, 25.3809917],
      [55.5664632, 25.3814351],
      [55.5669315, 25.3824852],
      [55.5679732, 25.3848366],
      [55.5699744, 25.3893652],
      [55.5704291, 25.3904570],
      [55.5711071, 25.3919353],
      [55.5713448, 25.3924466],
      [55.5715658, 25.3928662],
      [55.5719216, 25.3935614],
      [55.5722301, 25.3941279],
      [55.5726927, 25.3949156],
    ]
  },
  // E311 Central Section (OSM Way 4009554)
  {
    name: 'E311-Central',
    showroom: 'DIP',
    points: [
      [55.3654066, 25.1201526],
      [55.3683512, 25.1222283],
      [55.3692286, 25.1228725],
      [55.3700309, 25.1234919],
      [55.3708174, 25.1241277],
      [55.3715875, 25.1247798],
      [55.3725702, 25.1256564],
      [55.3730771, 25.1261310],
      [55.3745297, 25.1275952],
      [55.3759606, 25.1291602],
      [55.3767921, 25.1301559],
      [55.3776108, 25.1312000],
      [55.3784819, 25.1323923],
      [55.3790157, 25.1331742],
      [55.3801018, 25.1348814],
    ]
  },
  // E311 Central Continued
  {
    name: 'E311-Central-Extended',
    showroom: 'Abu Dhabi',
    points: [
      [55.3803684, 25.1353365],
      [55.3806277, 25.1357951],
      [55.3808795, 25.1362570],
      [55.3815651, 25.1375924],
      [55.3821250, 25.1387585],
      [55.3824206, 25.1393608],
      [55.3830330, 25.1406942],
      [55.3832725, 25.1412447],
      [55.3842956, 25.1436020],
      [55.3851069, 25.1454957],
      [55.3852940, 25.1459323],
      [55.3862172, 25.1480908],
      [55.3873900, 25.1509321],
      [55.3876249, 25.1514550],
      [55.3883417, 25.1531827],
      [55.3904814, 25.1585682],
      [55.3913874, 25.1609250],
      [55.3917574, 25.1619160],
    ]
  },
  // E66 Dubai-Al Ain Road - Bridge (OSM Way 10567459)
  {
    name: 'E66-Dubai-AlAin-Bridge',
    showroom: 'Al Ain',
    points: [
      [55.3156706, 25.2298826],
      [55.3155897, 25.2296808],
      [55.3155235, 25.2294752],
      [55.3154628, 25.2292682],
      [55.3153720, 25.2289232],
    ]
  },
  // E66 Dubai-Al Ain Road - Motorway Section (OSM Way 10712749)
  {
    name: 'E66-Dubai-AlAin-Motorway',
    showroom: 'Al Ain',
    points: [
      [55.3110399, 25.1871478],
      [55.3111436, 25.1866597],
      [55.3112680, 25.1862141],
      [55.3114310, 25.1857180],
      [55.3115920, 25.1852980],
      [55.3117706, 25.1848895],
      [55.3119588, 25.1844913],
      [55.3121798, 25.1840582],
      [55.3123661, 25.1837357],
      [55.3125795, 25.1833943],
      [55.3127724, 25.1831244],
      [55.3130156, 25.1827917],
      [55.3133102, 25.1824295],
      [55.3134975, 25.1822081],
      [55.3137838, 25.1819042],
      [55.3140757, 25.1816110],
      [55.3143674, 25.1813344],
    ]
  },
  // E311 Long Route - Northern Emirates Extended
  {
    name: 'E311-Long-North',
    showroom: 'Sharjah',
    points: [
      [55.5728980, 25.3952458],
      [55.5732424, 25.3958087],
      [55.5735992, 25.3963440],
      [55.5739754, 25.3969067],
      [55.5745541, 25.3976930],
      [55.5748421, 25.3980731],
      [55.5752204, 25.3985692],
      [55.5756194, 25.3990719],
      [55.5760307, 25.3995664],
      [55.5764716, 25.4000669],
      [55.5769653, 25.4006211],
      [55.5774087, 25.4011050],
      [55.5785295, 25.4022819],
      [55.5793964, 25.4031011],
      [55.5800321, 25.4036969],
    ]
  },
  // E311 Final Northern Section
  {
    name: 'E311-Final-North',
    showroom: 'Ajman',
    points: [
      [55.5810329, 25.4046985],
      [55.5815696, 25.4052528],
      [55.5820908, 25.4058191],
      [55.5824704, 25.4062531],
      [55.5825962, 25.4063969],
      [55.5830082, 25.4068928],
      [55.5830855, 25.4069859],
      [55.5835582, 25.4075681],
      [55.5840793, 25.4082505],
      [55.5845677, 25.4089217],
      [55.5850411, 25.4096017],
      [55.5854992, 25.4102901],
      [55.5859418, 25.4109868],
      [55.5862584, 25.4115123],
      [55.5865680, 25.4120385],
      [55.5868664, 25.4125700],
    ]
  },
];

// UAE boundary for limiting pan
const UAE_BOUNDS: [[number, number], [number, number]] = [
  [51.0, 22.5],
  [57.0, 26.5]
];

// Create mask polygon
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
          [[-180, -90], [-180, 90], [180, 90], [180, -90], [-180, -90]],
          [...uaeCoords].reverse()
        ]
      }
    }]
  };
};

// Create showroom GeoJSON
const createShowroomGeoJson = () => {
  const features = UAE_SHOWROOMS_DATA.map(showroom => ({
    type: 'Feature',
    properties: {
      id: showroom.id,
      name: showroom.shortName,
      fullName: showroom.name,
      city: showroom.city,
    },
    geometry: {
      type: 'Point',
      coordinates: [showroom.longitude, showroom.latitude]
    }
  }));
  return { type: 'FeatureCollection', features };
};

interface AnimatedCar {
  id: string;
  model: string;
  type: string;
  color: string;
  image: string;
  roadIndex: number;
  progress: number;
  speed: number;
  direction: 1 | -1;
  showroom: string;
}

// Generate initial cars
const generateInitialCars = (): AnimatedCar[] => {
  const cars: AnimatedCar[] = [];
  const numCars = 12;

  for (let i = 0; i < numCars; i++) {
    const carModel = CAR_MODELS[Math.floor(Math.random() * CAR_MODELS.length)];
    const roadIndex = Math.floor(Math.random() * UAE_ROADS.length);
    const road = UAE_ROADS[roadIndex];

    cars.push({
      id: `car-${i}`,
      model: carModel.model,
      type: carModel.type,
      color: carModel.color,
      image: carModel.image,
      roadIndex,
      progress: Math.random(),
      speed: 0.001 + Math.random() * 0.002, // Slower for smoother movement
      direction: Math.random() > 0.5 ? 1 : -1,
      showroom: road.showroom,
    });
  }
  return cars;
};

// Calculate total length of a road path
const calculateRoadLength = (points: number[][]): number => {
  let length = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const dx = points[i + 1][0] - points[i][0];
    const dy = points[i + 1][1] - points[i][1];
    length += Math.sqrt(dx * dx + dy * dy);
  }
  return length;
};

// Pre-calculate road lengths for proper interpolation
const roadLengths = UAE_ROADS.map(road => ({
  total: calculateRoadLength(road.points),
  segments: road.points.slice(0, -1).map((point, i) => {
    const next = road.points[i + 1];
    const dx = next[0] - point[0];
    const dy = next[1] - point[1];
    return Math.sqrt(dx * dx + dy * dy);
  })
}));

// Interpolate position along road based on distance traveled
const getPositionOnRoad = (roadIndex: number, progress: number): [number, number] => {
  const road = UAE_ROADS[roadIndex];
  const points = road.points;
  const lengths = roadLengths[roadIndex];

  // Convert progress (0-1) to actual distance
  const targetDistance = progress * lengths.total;

  // Find which segment we're on
  let distanceCovered = 0;
  for (let i = 0; i < lengths.segments.length; i++) {
    const segmentLength = lengths.segments[i];

    if (distanceCovered + segmentLength >= targetDistance) {
      // We're on this segment
      const segmentProgress = (targetDistance - distanceCovered) / segmentLength;
      const start = points[i];
      const end = points[i + 1];

      return [
        start[0] + (end[0] - start[0]) * segmentProgress,
        start[1] + (end[1] - start[1]) * segmentProgress
      ];
    }
    distanceCovered += segmentLength;
  }

  // Fallback to last point
  const lastPoint = points[points.length - 1];
  return [lastPoint[0], lastPoint[1]];
};

export function LiveTestDrives({ headless = false }: LiveTestDrivesProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<Map<string, maplibregl.Marker>>(new Map());
  const animationRef = useRef<number | null>(null);
  const [cars, setCars] = useState<AnimatedCar[]>(generateInitialCars);
  const [carCounts, setCarCounts] = useState<Record<string, number>>({});
  const [selectedModel, setSelectedModel] = useState<string | null>(null);

  // Handle model selection - toggle filter
  const handleModelClick = useCallback((model: string) => {
    setSelectedModel(prev => prev === model ? null : model);
  }, []);

  // Calculate car counts by model
  useEffect(() => {
    const counts: Record<string, number> = {};
    cars.forEach(car => {
      counts[car.model] = (counts[car.model] || 0) + 1;
    });
    setCarCounts(counts);
  }, [cars]);

  // Animation loop
  const animate = useCallback(() => {
    setCars(prevCars => {
      return prevCars.map(car => {
        let newProgress = car.progress + car.speed * car.direction;
        let newDirection = car.direction;

        if (newProgress >= 1) {
          newProgress = 1;
          newDirection = -1;
        } else if (newProgress <= 0) {
          newProgress = 0;
          newDirection = 1;
        }

        return {
          ...car,
          progress: newProgress,
          direction: newDirection
        };
      });
    });

    animationRef.current = requestAnimationFrame(animate);
  }, []);

  // Start animation
  useEffect(() => {
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animate]);

  // Update markers on map
  useEffect(() => {
    if (!mapRef.current) return;

    cars.forEach(car => {
      const [lng, lat] = getPositionOnRoad(car.roadIndex, car.progress);

      let marker = markersRef.current.get(car.id);
      const isVisible = !selectedModel || car.model === selectedModel;

      if (!marker) {
        // Create new marker
        const el = document.createElement('div');
        el.className = 'car-marker';
        el.dataset.model = car.model;
        el.style.cssText = `
          width: 24px;
          height: 24px;
          background-color: ${car.color};
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          display: ${isVisible ? 'flex' : 'none'};
          align-items: center;
          justify-content: center;
          font-size: 10px;
          cursor: pointer;
          transition: transform 0.1s, opacity 0.2s;
          opacity: ${isVisible ? '1' : '0'};
        `;
        el.innerHTML = '<span style="filter: brightness(0) invert(1);">🚗</span>';
        el.title = `${car.model} - ${car.showroom}`;

        marker = new maplibregl.Marker({ element: el })
          .setLngLat([lng, lat])
          .addTo(mapRef.current!);

        markersRef.current.set(car.id, marker);
      } else {
        marker.setLngLat([lng, lat]);
        // Update visibility
        const el = marker.getElement();
        el.style.display = isVisible ? 'flex' : 'none';
        el.style.opacity = isVisible ? '1' : '0';
      }
    });
  }, [cars, selectedModel]);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          'osm': {
            type: 'raster',
            tiles: [
              'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
            ],
            tileSize: 256,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }
        },
        layers: [{
          id: 'osm-tiles',
          type: 'raster',
          source: 'osm',
          minzoom: 0,
          maxzoom: 19
        }]
      },
      center: [55.4, 25.2], // Center on Dubai-Sharjah area where most roads are
      zoom: 9,
      minZoom: 7,
      maxZoom: 14,
      maxBounds: UAE_BOUNDS
    });

    mapRef.current = map;

    map.on('load', () => {
      // Add mask
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

      // Add road lines (test drive routes)
      const roadFeatures = UAE_ROADS.map(road => ({
        type: 'Feature',
        properties: { name: road.name },
        geometry: {
          type: 'LineString',
          coordinates: road.points
        }
      }));

      map.addSource('roads', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: roadFeatures
        } as any
      });

      // Road line - glow effect
      map.addLayer({
        id: 'road-glow',
        type: 'line',
        source: 'roads',
        paint: {
          'line-color': '#4285f4',
          'line-width': 10,
          'line-opacity': 0.25,
          'line-blur': 4
        }
      });

      // Road line - main
      map.addLayer({
        id: 'road-lines',
        type: 'line',
        source: 'roads',
        paint: {
          'line-color': '#4285f4',
          'line-width': 4,
          'line-opacity': 0.8
        }
      });

      // Add showroom points
      map.addSource('showrooms', {
        type: 'geojson',
        data: createShowroomGeoJson() as any
      });

      map.addLayer({
        id: 'showroom-dots',
        type: 'circle',
        source: 'showrooms',
        paint: {
          'circle-radius': 6,
          'circle-color': '#1a1a1a',
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 2
        }
      });

      // Add showroom labels
      map.addLayer({
        id: 'showroom-labels',
        type: 'symbol',
        source: 'showrooms',
        layout: {
          'text-field': ['get', 'name'],
          'text-size': 10,
          'text-offset': [0, 1.2],
          'text-anchor': 'top'
        },
        paint: {
          'text-color': '#333',
          'text-halo-color': '#fff',
          'text-halo-width': 1
        }
      });
    });

    map.dragRotate.disable();
    map.touchZoomRotate.disableRotation();

    setTimeout(() => {
      map.resize();
      // Fit to the Dubai-Sharjah-Ajman area where most real road data is
      map.fitBounds([
        [55.25, 25.10], // Southwest corner
        [55.65, 25.45]  // Northeast corner
      ], {
        padding: { top: 30, bottom: 80, left: 30, right: 30 },
        maxZoom: 10
      });
    }, 100);

    const resizeObserver = new ResizeObserver(() => {
      map.resize();
    });

    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current.clear();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div className={`live-test-drives ${headless ? 'headless' : ''}`}>
      <div className="map-container">
        <div ref={mapContainerRef} className="live-map" />
      </div>
      <div className="car-legend">
        {CAR_MODELS.map(carModel => (
          <div
            key={carModel.model}
            className={`legend-item ${selectedModel === carModel.model ? 'selected' : ''} ${selectedModel && selectedModel !== carModel.model ? 'dimmed' : ''}`}
            onClick={() => handleModelClick(carModel.model)}
          >
            <img src={carModel.image} alt={carModel.model} className="car-image" />
            <span className="car-count" style={{ backgroundColor: carModel.color }}>
              {carCounts[carModel.model] || 0}
            </span>
            <span className="car-name">{carModel.model}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LiveTestDrives;
