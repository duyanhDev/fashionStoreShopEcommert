import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Package,
  Truck,
  MapPin,
  Clock,
  CheckCircle,
  Phone,
  Copy,
  ExternalLink,
} from "lucide-react";
import { OrderStatusOneProduct } from "../../service/Oder";
import axios from "axios";

// Component Map thật với dữ liệu từ DB
const DeliveryMap = ({ orderData }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const routeLayersRef = useRef([]);
  const vehicleMarkerRef = useRef(null);
  const animationRef = useRef(null);
  const routeCoordsRef = useRef([]);
  const [routeInfo, setRouteInfo] = useState({ distance: 0, duration: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const statusOrder = [
    "Processing",
    "Confirmed",
    "Shipping",
    "Delivered",
    "Completed",
  ];
  const currentStatusIndex = statusOrder.indexOf(orderData?.orderStatus);

  // Validate coordinates helper
  const isValidCoordinate = (lat, lng) => {
    return (
      typeof lat === "number" &&
      typeof lng === "number" &&
      !isNaN(lat) &&
      !isNaN(lng) &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180
    );
  };

  // Build địa chỉ đầy đủ cho geocoding chính xác hơn
  const buildFullAddress = (shippingAddress) => {
    if (!shippingAddress) return null;

    // Ưu tiên sử dụng street/address nếu có
    const parts = [
      shippingAddress.street || shippingAddress.address, // Địa chỉ cụ thể
      shippingAddress.ward, // Phường/Xã
      shippingAddress.district, // Quận/Huyện
      shippingAddress.city || shippingAddress.province, // Tỉnh/TP
      "Vietnam",
    ].filter(Boolean);

    return parts.join(", ");
  };

  // Geocoding với nhiều fallback options
  const geocodeAddress = async (address) => {
    if (!address || address.length < 5) return null;

    const geocodingServices = [
      // Service 1: Nominatim OSM (Free, no API key)
      async () => {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?` +
              `format=json&q=${encodeURIComponent(address)}` +
              `&countrycodes=vn&limit=1&addressdetails=1`,
            {
              headers: { "User-Agent": "DeliveryTrackingApp/1.0" },
            }
          );

          if (response.ok) {
            const data = await response.json();
            if (data && data.length > 0) {
              return {
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon),
                source: "Nominatim",
              };
            }
          }
        } catch (error) {
          console.log("❌ Nominatim failed:", error.message);
        }
        return null;
      },

      // Service 2: Photon (Alternative free OSM geocoder)
      async () => {
        try {
          const response = await fetch(
            `https://photon.komoot.io/api/?` +
              `q=${encodeURIComponent(address)}&limit=1`
          );

          if (response.ok) {
            const data = await response.json();
            if (data.features && data.features.length > 0) {
              const coords = data.features[0].geometry.coordinates;
              console.log("✅ Photon geocoded:", coords);
              return {
                lat: coords[1],
                lng: coords[0],
                source: "Photon",
              };
            }
          }
        } catch (error) {
          console.log("❌ Photon failed:", error.message);
        }
        return null;
      },
    ];

    // Thử từng service cho đến khi có kết quả
    for (const service of geocodingServices) {
      const result = await service();
      if (result && result.lat && result.lng) {
        return result;
      }
      // Delay giữa các request để tránh rate limit
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    return null;
  };

  // Cache geocoding results trong memory (thay localStorage)
  const geocodeCache = useRef({});

  const getCachedCoordinates = (address) => {
    if (geocodeCache.current[address]) {
      const data = geocodeCache.current[address];
      const ageInHours = (Date.now() - data.timestamp) / (1000 * 60 * 60);

      // Cache valid trong 30 ngày
      if (ageInHours < 720) {
        console.log("📦 Using cached coordinates:", data.coords);
        return data.coords;
      }
    }
    return null;
  };

  const setCachedCoordinates = (address, coords) => {
    geocodeCache.current[address] = {
      coords,
      timestamp: Date.now(),
    };
  };

  // Fallback coordinates cho các tỉnh/thành phố VN
  const VIETNAM_CITY_COORDS = {
    "An Giang": { lat: 10.5216, lng: 105.1259 },
    "Bà Rịa - Vũng Tàu": { lat: 10.5417, lng: 107.2429 },
    "Bạc Liêu": { lat: 9.2941, lng: 105.7278 },
    "Bắc Giang": { lat: 21.2731, lng: 106.1946 },
    "Bắc Kạn": { lat: 22.147, lng: 105.8348 },
    "Bắc Ninh": { lat: 21.1861, lng: 106.0763 },
    "Bến Tre": { lat: 10.2415, lng: 106.3756 },
    "Bình Dương": { lat: 11.1731, lng: 106.671 },
    "Bình Định": { lat: 13.782, lng: 109.2196 },
    "Bình Phước": { lat: 11.7512, lng: 106.7235 },
    "Bình Thuận": { lat: 10.9804, lng: 108.2615 },
    "Cà Mau": { lat: 9.1768, lng: 105.1524 },
    "Cần Thơ": { lat: 10.0452, lng: 105.7469 },
    "Cao Bằng": { lat: 22.6664, lng: 106.263 },
    "Đà Nẵng": { lat: 16.0544, lng: 108.2022 },
    "Đắk Lắk": { lat: 12.71, lng: 108.2378 },
    "Đắk Nông": { lat: 12.2646, lng: 107.609 },
    "Điện Biên": { lat: 21.386, lng: 103.0163 },
    "Đồng Nai": { lat: 10.9453, lng: 107.0023 },
    "Đồng Tháp": { lat: 10.493, lng: 105.6882 },
    "Gia Lai": { lat: 13.983, lng: 108.0014 },
    "Hà Giang": { lat: 22.8233, lng: 104.9836 },
    "Hà Nam": { lat: 20.5417, lng: 105.9139 },
    "Hà Nội": { lat: 21.0285, lng: 105.8542 },
    "Hà Tĩnh": { lat: 18.3428, lng: 105.9057 },
    "Hải Dương": { lat: 20.9373, lng: 106.3146 },
    "Hải Phòng": { lat: 20.8449, lng: 106.6881 },
    "Hậu Giang": { lat: 9.7579, lng: 105.6413 },
    "Hòa Bình": { lat: 20.8172, lng: 105.3376 },
    "Hưng Yên": { lat: 20.6464, lng: 106.0511 },
    "Khánh Hòa": { lat: 12.2585, lng: 109.0526 },
    "Kiên Giang": { lat: 10.0125, lng: 105.0809 },
    "Kon Tum": { lat: 14.3545, lng: 108.0 },
    "Lai Châu": { lat: 22.3862, lng: 103.4703 },
    "Lâm Đồng": { lat: 11.9404, lng: 108.4583 },
    "Lạng Sơn": { lat: 21.8564, lng: 106.758 },
    "Lào Cai": { lat: 22.338, lng: 104.1487 },
    "Long An": { lat: 10.6956, lng: 106.2431 },
    "Nam Định": { lat: 20.4339, lng: 106.1773 },
    "Nghệ An": { lat: 19.2342, lng: 104.92 },
    "Ninh Bình": { lat: 20.2505, lng: 105.974 },
    "Ninh Thuận": { lat: 11.6739, lng: 108.862 },
    "Phú Thọ": { lat: 21.3992, lng: 105.2226 },
    "Phú Yên": { lat: 13.0882, lng: 109.0929 },
    "Quảng Bình": { lat: 17.4838, lng: 106.5999 },
    "Quảng Nam": { lat: 15.5394, lng: 108.0191 },
    "Quảng Ngãi": { lat: 15.1214, lng: 108.8045 },
    "Quảng Ninh": { lat: 21.0064, lng: 107.2925 },
    "Quảng Trị": { lat: 16.8165, lng: 107.1006 },
    "Sóc Trăng": { lat: 9.6025, lng: 105.9739 },
    "Sơn La": { lat: 21.3289, lng: 103.918 },
    "Tây Ninh": { lat: 11.3222, lng: 106.0983 },
    "Thái Bình": { lat: 20.5387, lng: 106.3872 },
    "Thái Nguyên": { lat: 21.5672, lng: 105.825 },
    "Thanh Hóa": { lat: 19.807, lng: 105.776 },
    "Thừa Thiên Huế": { lat: 16.4637, lng: 107.5909 },
    "Tiền Giang": { lat: 10.449, lng: 106.342 },
    "TP Hồ Chí Minh": { lat: 10.7769, lng: 106.7009 },
    "Trà Vinh": { lat: 9.9347, lng: 106.3455 },
    "Tuyên Quang": { lat: 21.8186, lng: 105.2188 },
    "Vĩnh Long": { lat: 10.2537, lng: 105.972 },
    "Vĩnh Phúc": { lat: 21.3089, lng: 105.6049 },
    "Yên Bái": { lat: 21.722, lng: 104.9113 },
  };

  const getCityFallbackCoords = (address) => {
    if (!address) return null;

    for (const [city, coords] of Object.entries(VIETNAM_CITY_COORDS)) {
      if (address.includes(city)) {
        console.log(`🗺️ Using fallback coords for ${city}:`, coords);
        return coords;
      }
    }
    return null;
  };

  const getDeliveryPoints = async () => {
    const warehouseLocation = orderData?.warehouseLocation || {
      lat: 10.8231,
      lng: 106.6297,
    };
    const shippingAddress = orderData?.shippingAddress || {};

    let destinationLat =
      shippingAddress?.coordinates?.lat ||
      shippingAddress?.latitude ||
      shippingAddress?.lat;
    let destinationLng =
      shippingAddress?.coordinates?.lng ||
      shippingAddress?.longitude ||
      shippingAddress?.lng;

    const fullAddress = buildFullAddress(shippingAddress);
    console.log("📍 Full address:", fullAddress);

    // Nếu chưa có tọa độ, thử các phương án
    if (!destinationLat || !destinationLng) {
      console.log("⚠️ No coordinates in DB, trying alternatives...");

      // 1. Kiểm tra cache
      let coords = getCachedCoordinates(fullAddress);

      // 2. Thử geocoding
      if (!coords && fullAddress) {
        coords = await geocodeAddress(fullAddress);
        if (coords) {
          setCachedCoordinates(fullAddress, coords);
        }
      }

      // 3. Fallback theo city
      if (!coords) {
        coords = getCityFallbackCoords(fullAddress);
      }

      // 4. Default fallback (trung tâm VN)
      if (!coords) {
        console.log("⚠️ Using default Vietnam center coordinates");
        coords = { lat: 16.0544, lng: 108.2022 };
      }

      destinationLat = coords.lat;
      destinationLng = coords.lng;
    }

    return {
      warehouse: {
        lat: warehouseLocation.lat,
        lng: warehouseLocation.lng,
        name: "Kho hàng",
      },
      destination: {
        lat: destinationLat,
        lng: destinationLng,
        name: fullAddress || "Địa chỉ nhận hàng",
        address: fullAddress,
      },
    };
  };

  const decodePolyline = (encoded) => {
    const points = [];
    let index = 0,
      lat = 0,
      lng = 0;

    while (index < encoded.length) {
      let result = 0,
        shift = 0,
        byte;
      do {
        byte = encoded.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);
      lat += result & 1 ? ~(result >> 1) : result >> 1;

      result = 0;
      shift = 0;
      do {
        byte = encoded.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);
      lng += result & 1 ? ~(result >> 1) : result >> 1;

      points.push([lat / 1e5, lng / 1e5]);
    }
    return points;
  };

  const createSimulatedRoute = (start, end, points = 50) => {
    const route = [];
    const latDiff = end.lat - start.lat;
    const lngDiff = end.lng - start.lng;

    for (let i = 0; i <= points; i++) {
      const t = i / points;
      const curveFactor = Math.sin(t * Math.PI) * 0.1;
      const lat = start.lat + latDiff * t + curveFactor * latDiff;
      const lng = start.lng + lngDiff * t - curveFactor * lngDiff * 0.5;
      route.push([lat, lng]);
    }
    return route;
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours} giờ ${minutes} phút` : `${minutes} phút`;
  };

  const formatDistance = (meters) => {
    return `${Math.round(meters / 1000)} km`;
  };

  const createStartIcon = () =>
    window.L.divIcon({
      html: `<div style="width: 32px; height: 32px; background: #34A853; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 18px;">🏭</div>`,
      className: "",
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

  const createEndIcon = () =>
    window.L.divIcon({
      html: `<div style="width: 32px; height: 32px; background: #EA4335; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 18px;">📍</div>`,
      className: "",
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

  const createVehicleIcon = (isMotorbike, rotation = 0) => {
    const bgColor = isMotorbike ? "#FF6B35" : "#4285F4";
    const vehicleSvg = isMotorbike
      ? `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="white" style="transform: rotate(${-rotation}deg);">
        <path d="M19.44 9.03L15.41 5H11v2h3.59l2 2H5c-2.8 0-5 2.2-5 5s2.2 5 5 5c2.46 0 4.45-1.69 4.9-4h1.65l2.77-2.77c-.21.54-.32 1.14-.32 1.77 0 2.8 2.2 5 5 5s5-2.2 5-5c0-2.65-1.97-4.77-4.56-4.97zM7.82 15C7.4 16.15 6.28 17 5 17c-1.63 0-3-1.37-3-3s1.37-3 3-3c1.28 0 2.4.85 2.82 2H5v2h2.82zM19 17c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/>
      </svg>
    `
      : `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="white" style="transform: rotate(${-rotation}deg);">
        <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm13.5-9l1.96 2.5H17V9h2.5zm-1.5 9c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/>
      </svg>
    `;

    return window.L.divIcon({
      html: `
        <div style="
          position: relative;
          width: 48px; 
          height: 48px;
        ">
          <!-- Shadow -->
          <div style="
            position: absolute;
            bottom: -2px;
            left: 50%;
            transform: translateX(-50%);
            width: 40px;
            height: 8px;
            background: rgba(0,0,0,0.2);
            border-radius: 50%;
            filter: blur(4px);
          "></div>
          
          <!-- Vehicle container -->
          <div style="
            position: absolute;
            top: 0;
            left: 50%;
            transform: translateX(-50%) rotate(${rotation}deg);
            width: 44px; 
            height: 44px; 
            background: ${bgColor};
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
          ">
            ${vehicleSvg}
          </div>
          
          <!-- Status indicator dot -->
          <div style="
            position: absolute;
            top: 2px;
            right: 2px;
            width: 12px;
            height: 12px;
            background: #34D399;
            border: 2px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            animation: pulse 2s infinite;
          "></div>
          
          <style>
            @keyframes pulse {
              0%, 100% { opacity: 1; transform: scale(1); }
              50% { opacity: 0.7; transform: scale(1.1); }
            }
          </style>
        </div>
      `,
      className: "vehicle-marker",
      iconSize: [48, 48],
      iconAnchor: [24, 24],
    });
  };

  useEffect(() => {
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href =
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css";
      document.head.appendChild(link);
    }

    let scriptAdded = false;

    const loadLeaflet = () => {
      if (window.L) {
        initMap();
        return;
      }

      if (!scriptAdded) {
        const script = document.createElement("script");
        script.src =
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js";
        script.async = true;
        script.onload = initMap;
        document.body.appendChild(script);
        scriptAdded = true;
      }
    };

    loadLeaflet();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }

      // Cleanup map properly
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.off();
          mapInstanceRef.current.remove();
        } catch (e) {
          console.log("Map cleanup error:", e);
        }
        mapInstanceRef.current = null;
      }

      // Clear all refs
      markersRef.current = [];
      routeLayersRef.current = [];
      vehicleMarkerRef.current = null;
      routeCoordsRef.current = [];
    };
  }, []);

  useEffect(() => {
    if (mapInstanceRef.current && orderData) {
      updateMapRoute();
    }
  }, [orderData?.orderStatus]);

  // Animation xe di chuyển
  const animateVehicle = (startIndex = 0) => {
    if (!mapInstanceRef.current || routeCoordsRef.current.length < 2) return;

    const map = mapInstanceRef.current;
    const coords = routeCoordsRef.current;
    const isShipping = orderData?.orderStatus === "Shipping";
    const isCompleted = ["Delivered", "Completed"].includes(
      orderData?.orderStatus
    );

    // Xác định vị trí xe dựa trên trạng thái đơn hàng
    let vehiclePosition;
    let showAnimation = false;

    if (isCompleted) {
      // Đã giao hàng - xe ở điểm cuối
      vehiclePosition = coords[coords.length - 1];
    } else if (isShipping) {
      // Đang giao hàng - xe di chuyển
      vehiclePosition = coords[Math.min(startIndex, coords.length - 1)];
      showAnimation = true;
    } else {
      // Chưa giao - xe ở kho
      vehiclePosition = coords[0];
    }

    // Tính góc quay của xe
    let rotation = 0;
    if (startIndex > 0 && startIndex < coords.length) {
      const prev = coords[startIndex - 1];
      const curr = coords[startIndex];
      rotation =
        Math.atan2(curr[1] - prev[1], curr[0] - prev[0]) * (180 / Math.PI);
    }

    // Remove old vehicle marker
    if (vehicleMarkerRef.current) {
      map.removeLayer(vehicleMarkerRef.current);
    }

    // Xác định loại xe (có thể dựa vào khoảng cách)
    const isMotorbike = ["Delivered", "Completed"].includes(
      orderData?.orderStatus
    );

    // Add new vehicle marker
    vehicleMarkerRef.current = window.L.marker(vehiclePosition, {
      icon: createVehicleIcon(isMotorbike, rotation),
      zIndexOffset: 1000,
    }).addTo(map);

    // Popup thông tin xe
    const vehicleType = isMotorbike ? "Xe máy" : "Xe tải";
    const statusText = isCompleted
      ? "Đã giao hàng"
      : isShipping
      ? "Đang giao hàng"
      : "Chờ xuất kho";

    vehicleMarkerRef.current.bindPopup(`
      <div style="padding: 8px; min-width: 150px;">
        <div style="font-weight: 600; margin-bottom: 4px;">${vehicleType}</div>
        <div style="font-size: 12px; color: #666;">${statusText}</div>
        ${
          isShipping
            ? `<div style="font-size: 11px; color: #4285F4; margin-top: 4px;">
          Tiến độ: ${Math.round((startIndex / coords.length) * 100)}%
        </div>`
            : ""
        }
      </div>
    `);

    // Continue animation nếu đang shipping
    if (showAnimation && startIndex < coords.length - 1) {
      animationRef.current = requestAnimationFrame(() => {
        setTimeout(() => {
          animateVehicle(startIndex + 1);
        }, 100); // Tốc độ animation
      });
    }
  };

  const initMap = async () => {
    if (!window.L) {
      console.log("⚠️ Leaflet not loaded yet");
      return;
    }

    if (mapInstanceRef.current) {
      console.log("⚠️ Map already initialized");
      return;
    }

    try {
      const { warehouse, destination } = await getDeliveryPoints();

      // Validate coordinates
      if (
        !isValidCoordinate(warehouse.lat, warehouse.lng) ||
        !isValidCoordinate(destination.lat, destination.lng)
      ) {
        console.error("❌ Invalid coordinates:", { warehouse, destination });
        setIsLoading(false);
        return;
      }

      const centerLat = (warehouse.lat + destination.lat) / 2;
      const centerLng = (warehouse.lng + destination.lng) / 2;

      const map = window.L.map(mapRef.current, {
        center: [centerLat, centerLng],
        zoom: 10,
        zoomControl: true,
      });

      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;

      console.log("✅ Map initialized successfully");

      updateMapRoute();
    } catch (error) {
      console.error("❌ Map initialization error:", error);
      setIsLoading(false);
    }
  };

  const updateMapRoute = async () => {
    if (!mapInstanceRef.current || !window.L || !orderData) {
      console.log("⚠️ Map not ready or no order data");
      return;
    }

    const map = mapInstanceRef.current;

    try {
      const { warehouse, destination } = await getDeliveryPoints();

      // Validate coordinates before proceeding
      if (!isValidCoordinate(warehouse.lat, warehouse.lng)) {
        console.error("❌ Invalid warehouse coordinates:", warehouse);
        setIsLoading(false);
        return;
      }

      if (!isValidCoordinate(destination.lat, destination.lng)) {
        console.error("❌ Invalid destination coordinates:", destination);
        setIsLoading(false);
        return;
      }

      console.log("✅ Valid coordinates:", { warehouse, destination });

      // Clear old layers
      [
        ...markersRef.current,
        ...routeLayersRef.current,
        vehicleMarkerRef.current,
      ]
        .filter(Boolean)
        .forEach((layer) => {
          try {
            map.removeLayer(layer);
          } catch (e) {
            console.log("Layer removal error:", e);
          }
        });

      markersRef.current = [];
      routeLayersRef.current = [];
      vehicleMarkerRef.current = null;

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }

      setIsLoading(true);

      let routeCoords = [];
      let distance = 0;
      let duration = 0;

      // Try API routing
      try {
        const response = await fetch(
          "https://api.openrouteservice.org/v2/directions/driving-car",
          {
            method: "POST",
            headers: {
              Authorization:
                "5b3ce3597851110001cf6248a4ac8d13355747aca73bfdc3b2ff23f6",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              coordinates: [
                [warehouse.lng, warehouse.lat],
                [destination.lng, destination.lat],
              ],
              instructions: false,
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data?.routes?.[0]) {
            const route = data.routes[0];
            if (typeof route.geometry === "string") {
              routeCoords = decodePolyline(route.geometry);
            } else if (route.geometry.coordinates) {
              routeCoords = route.geometry.coordinates.map((c) => [c[1], c[0]]);
            }
            distance = route.summary?.distance || 0;
            duration = route.summary?.duration || 0;
            console.log("✅ Got route from API:", routeCoords.length, "points");
          }
        }
      } catch (error) {
        console.log("⚠️ API routing failed:", error.message);
      }

      // Fallback to simulated route
      if (routeCoords.length === 0) {
        console.log("🔄 Using simulated route");
        routeCoords = createSimulatedRoute(warehouse, destination, 80);
        distance = calculateDistance(
          warehouse.lat,
          warehouse.lng,
          destination.lat,
          destination.lng
        );
        duration = (distance / 50) * 3.6;
      }

      // Validate route coordinates
      const validRouteCoords = routeCoords.filter(
        (coord) =>
          Array.isArray(coord) &&
          coord.length >= 2 &&
          isValidCoordinate(coord[0], coord[1])
      );

      if (validRouteCoords.length < 2) {
        console.error("❌ Not enough valid route coordinates");
        setIsLoading(false);
        return;
      }

      routeCoordsRef.current = validRouteCoords;
      setRouteInfo({ distance, duration });

      // Draw route
      const outline = window.L.polyline(validRouteCoords, {
        color: "#ffffff",
        weight: 8,
        opacity: 0.8,
      }).addTo(map);
      routeLayersRef.current.push(outline);

      const mainRoute = window.L.polyline(validRouteCoords, {
        color: "#4285F4",
        weight: 6,
        opacity: 0.9,
      }).addTo(map);
      routeLayersRef.current.push(mainRoute);

      // Add markers
      const startMarker = window.L.marker([warehouse.lat, warehouse.lng], {
        icon: createStartIcon(),
      }).addTo(map).bindPopup(`
        <div style="padding: 8px; min-width: 150px;">
          <div style="font-weight: 600; margin-bottom: 4px;">Kho hàng</div>
          <div style="font-size: 12px; color: #666;">Điểm xuất phát</div>
        </div>
      `);
      markersRef.current.push(startMarker);

      const endMarker = window.L.marker([destination.lat, destination.lng], {
        icon: createEndIcon(),
      }).addTo(map).bindPopup(`
        <div style="padding: 8px; min-width: 150px;">
          <div style="font-weight: 600; margin-bottom: 4px;">Địa chỉ giao hàng</div>
          <div style="font-size: 12px; color: #666;">${destination.name}</div>
        </div>
      `);
      markersRef.current.push(endMarker);

      // Fit bounds with validation
      try {
        const bounds = window.L.latLngBounds([
          [warehouse.lat, warehouse.lng],
          [destination.lat, destination.lng],
        ]);

        map.fitBounds(bounds, {
          padding: [80, 80],
          maxZoom: 14,
        });
      } catch (error) {
        console.error("❌ Fit bounds error:", error);
        // Fallback to simple setView
        const centerLat = (warehouse.lat + destination.lat) / 2;
        const centerLng = (warehouse.lng + destination.lng) / 2;
        map.setView([centerLat, centerLng], 10);
      }

      setIsLoading(false);
      console.log("✅ Map route updated successfully");

      // Bắt đầu animation xe
      setTimeout(() => {
        animateVehicle(0);
      }, 500);
    } catch (error) {
      console.error("❌ Update map route error:", error);
      setIsLoading(false);
    }
  };

  return (
    <div style={{ position: "relative" }}>
      {routeInfo.distance > 0 && (
        <div
          style={{
            position: "absolute",
            top: "16px",
            left: "16px",
            background: "white",
            padding: "12px 16px",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            zIndex: 1000,
            fontFamily: "system-ui",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "20px" }}>🚚</span>
            <div>
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#1a73e8",
                }}
              >
                {formatDuration(routeInfo.duration)}
              </div>
              <div style={{ fontSize: "13px", color: "#70757a" }}>
                {formatDistance(routeInfo.distance)}
              </div>
            </div>
          </div>
        </div>
      )}

      {isLoading && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 1000,
            background: "white",
            padding: "16px 24px",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "24px", marginBottom: "8px" }}>🗺️</div>
            <div style={{ fontSize: "14px", color: "#666" }}>
              Đang tải bản đồ...
            </div>
          </div>
        </div>
      )}

      <div
        ref={mapRef}
        style={{
          height: "450px",
          width: "100%",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        }}
      />
    </div>
  );
};

// Component chính OrderDetailModal - GIỮ NGUYÊN LOGIC API
const OrderDetailModal = ({ visible, onClose, id }) => {
  const [OrderData, setOrderData] = useState([]);
  const [trackingSteps, setTrackingSteps] = useState([]);
  const [copiedTrackingCode, setCopiedTrackingCode] = useState(false);
  const [trackingError, setTrackingError] = useState(null);
  const [leadtimeOrder, setLeadtimeOrder] = useState(null);

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("vi-VN");

  const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  const handlelAPIDetailOrder = async () => {
    try {
      const res = await OrderStatusOneProduct(id);
      if (res && res.data && res.data.EC === 0) {
        setOrderData(res.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (id) {
      handlelAPIDetailOrder();
    }
  }, [id]);

  useEffect(() => {
    const statusOrder = [
      "Processing",
      "Confirmed",
      "Shipping",
      "Delivered",
      "Completed",
    ];
    const currentIndex = statusOrder.indexOf(OrderData?.orderStatus);

    const formatDateTimeCustom = (dateString) => {
      if (!dateString) return "N/A";
      const date = new Date(dateString);

      const time = date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

      const dateStr = date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

      return `${time} - ${dateStr}`;
    };
    const steps = [
      {
        title: "Đơn hàng đang chờ xác nhận",
        description: "Chờ người bán xác nhận đơn hàng",
        time: leadtimeOrder?.pickup_time
          ? formatDateTimeCustom(leadtimeOrder?.pickup_time)
          : formatDateTimeCustom(OrderData.createdAt),
        icon: Clock,
      },
      {
        title: "Người bán đã xác nhận",
        description: "Người bán chuẩn bị hàng",
        time: leadtimeOrder?.pickup_time
          ? formatDateTimeCustom(leadtimeOrder?.pickup_time)
          : formatDateTimeCustom(OrderData.createdAt),
        icon: CheckCircle,
      },
      {
        title: "Đã giao cho đơn vị vận chuyển",
        description: "Đơn hàng đã được giao cho GHN Express",
        time: leadtimeOrder?.pickup_time
          ? formatDateTimeCustom(
              leadtimeOrder?.leadtime_order.from_estimate_date
            )
          : formatDateTimeCustom(OrderData.createdAt),
        icon: Package,
      },
      {
        title: "Đang vận chuyển",
        description: "Đơn hàng đang trên đường giao đến bạn",
        time: leadtimeOrder?.pickup_time
          ? formatDateTimeCustom(leadtimeOrder?.leadtime_order.to_estimate_date)
          : formatDateTimeCustom(OrderData.createdAt),
        icon: Truck,
      },
      {
        title: "Giao hàng thành công",
        description: "Đơn hàng đã được giao thành công",
        time: `Dự kiến ${
          leadtimeOrder?.pickup_time
            ? formatDateTimeCustom(
                leadtimeOrder?.leadtime_order.to_estimate_date
              )
            : formatDateTimeCustom(OrderData.createdAt)
        }`,
        icon: MapPin,
      },
    ];

    const updatedSteps = steps.map((step, index) => {
      if (index < currentIndex) return { ...step, status: "Completed" };
      if (index === currentIndex) return { ...step, status: "current" };
      return { ...step, status: "pending" };
    });

    setTrackingSteps(updatedSteps);
  }, [OrderData]);

  useEffect(() => {
    const fetchDetailOrder = async () => {
      if (!OrderData?.order_code) return;

      try {
        setTrackingError(null);
        const res = await axios.post(
          "https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/detail",
          { order_code: OrderData.order_code },
          {
            headers: {
              Token: "6501032d-0b70-11ef-b1d4-92b443b7a897",
              "Content-Type": "application/json",
              ShopId: 192215,
            },
          }
        );
        if (res?.data) {
          setLeadtimeOrder(res.data.data);
        }
      } catch (err) {
        console.error(
          "Tracking fetch error:",
          err.response?.data || err.message
        );
        setTrackingError("Không thể tải thông tin vận chuyển.");
      }
    };

    fetchDetailOrder();
  }, [OrderData]);

  const formatPrice = (price) => {
    return price?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Processing":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Shipping":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "Completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "Cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "Processing":
        return "Đơn hàng đang chờ shop xác nhận";
      case "Confirmed":
        return "Người bán đang chuẩn bị hàng";
      case "Shipping":
        return "Đã giao cho shipper/đơn vị vận chuyển";
      case "Delivered":
        return "Đơn hàng đang giao hàng đến bạn";
      case "Completed":
        return "Đơn hàng giao thành công";
      case "Cancelled":
        return "Đã hủy";
      default:
        return "Không xác định";
    }
  };

  const copyTrackingCode = async () => {
    try {
      await navigator.clipboard.writeText(OrderData.order_code);
      setCopiedTrackingCode(true);
      setTimeout(() => setCopiedTrackingCode(false), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-200 p-6 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Chi tiết vận chuyển
                </h2>
                <p className="text-gray-600">Mã đơn hàng: {OrderData._id}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Status Banner */}
          <div className="bg-gradient-to-r from-orange-50 via-orange-100 to-red-50 rounded-2xl p-6 mb-8 border border-orange-200">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(
                      OrderData?.orderStatus
                    )}`}
                  >
                    {getStatusText(OrderData?.orderStatus)}
                  </span>
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                </div>
                <p className="text-gray-700 font-medium">
                  Đặt hàng lúc:{" "}
                  {new Date(OrderData?.createdAt).toLocaleString("vi-VN")}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Tổng giá trị đơn hàng</p>
                <p className="text-3xl font-bold text-orange-600">
                  {formatPrice(OrderData?.totalAmount)}
                </p>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-8">
              {/* Real Map - TRUYỀN OrderData VÀO */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-orange-500" />
                    Theo dõi vận chuyển
                  </h3>
                </div>

                <div className="p-4">
                  <DeliveryMap orderData={OrderData} />

                  <div className="mt-4 bg-orange-50 border border-orange-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-orange-700">
                      <MapPin className="w-4 h-4" />
                      <span className="font-medium">Đang giao đến:</span>
                    </div>
                    <p className="text-orange-800 font-semibold mt-1">
                      {OrderData?.shippingAddress?.fullAddress ||
                        "Đang cập nhật địa chỉ"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-orange-500" />
                    Lịch sử vận chuyển
                  </h3>
                </div>

                <div className="p-6">
                  <div className="space-y-6">
                    {trackingSteps.map((step, index) => {
                      const IconComponent = step.icon;
                      const isCompleted = step.status === "Completed";
                      const isCurrent = step.status === "current";

                      return (
                        <div key={index} className="relative flex gap-4">
                          {index < trackingSteps.length - 1 && (
                            <div
                              className={`absolute left-6 top-12 w-0.5 h-8 ${
                                isCompleted ? "bg-green-400" : "bg-gray-200"
                              }`}
                            />
                          )}

                          <div
                            className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                              isCompleted
                                ? "bg-green-100 border-green-400 text-green-600"
                                : isCurrent
                                ? "bg-green-100 border-green-400 text-green-600 animate-pulse"
                                : isCurrent
                            }`}
                          >
                            <IconComponent className="w-5 h-5" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4
                              className={`font-semibold ${
                                isCompleted
                                  ? "text-green-800"
                                  : isCurrent
                                  ? "text-green-800"
                                  : isCurrent
                              }`}
                            >
                              {step.title}
                            </h4>
                            <p className="text-gray-600 text-sm mt-1">
                              {step.description}
                            </p>
                            <p className="text-gray-400 text-xs mt-2">
                              {step.time}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              {/* Shipping Info */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Thông tin vận chuyển
                  </h3>
                </div>

                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div>
                      <p className="text-blue-800 font-semibold">
                        Giao Hàng Nhanh
                      </p>
                      <p className="text-blue-600 text-sm">Đơn vị vận chuyển</p>
                    </div>
                    <ExternalLink className="w-5 h-5 text-blue-600" />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 font-medium">
                        Mã vận đơn:
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-blue-600">
                          {OrderData?.order_code || "GHN123456789"}
                        </span>
                        <button
                          onClick={copyTrackingCode}
                          className={`p-1.5 rounded-lg transition-colors ${
                            copiedTrackingCode
                              ? "bg-green-100 text-green-600"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 font-medium">
                        Phí vận chuyển:
                      </span>
                      <span className="font-semibold">Miễn phí</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 font-medium">
                        Thời gian giao dự kiến:
                      </span>
                      <span className="font-semibold text-green-600">
                        {leadtimeOrder?.leadtime_order?.from_estimate_date
                          ? `${formatDate(
                              leadtimeOrder.leadtime_order.from_estimate_date
                            )} - ${formatDate(
                              leadtimeOrder.leadtime_order.to_estimate_date
                            )}`
                          : OrderData?.createdAt
                          ? `${formatDate(
                              addDays(OrderData?.createdAt, 2)
                            )} - ${formatDate(
                              addDays(OrderData?.createdAt, 3)
                            )}`
                          : "Đang tải..."}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 font-medium">
                        Người đặt
                      </span>
                      <span className="font-semibold">
                        {OrderData?.username || "N/A"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 font-medium">
                        Số điện thoại:
                      </span>
                      <span className="font-semibold text-blue-600">
                        {OrderData?.phone ? `0${OrderData.phone}` : "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 font-medium">
                        Phương thức thanh toán:
                      </span>
                      <span className="font-semibold text-blue-600">
                        {OrderData?.paymentMethod}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 font-medium">
                        Thanh toán:
                      </span>
                      <span className="font-semibold text-blue-600">
                        {OrderData?.paymentStatus === "Completed"
                          ? "Đã thanh toán"
                          : "Chưa thanh toán"}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between text-lg">
                      <span className="font-bold text-gray-900">
                        Tổng thanh toán:
                      </span>
                      <span className="font-bold text-2xl text-orange-600">
                        {formatPrice(OrderData?.totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Products */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <Package className="w-5 h-5 text-orange-500" />
                    Sản phẩm ({OrderData?.items?.length || 0})
                  </h3>
                </div>

                <div className="p-6">
                  <div className="space-y-4">
                    {OrderData?.items?.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-sm transition-shadow"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded-xl border border-gray-200"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-2">
                            {item.name}
                          </h4>
                          <div className="flex flex-wrap gap-2 text-sm">
                            <span className="px-2 py-1 bg-white rounded-lg border border-gray-200">
                              Màu: {item.color}
                            </span>
                            <span className="px-2 py-1 bg-white rounded-lg border border-gray-200">
                              Size: {item.size}
                            </span>
                            <span className="px-2 py-1 bg-white rounded-lg border border-gray-200">
                              SL: {item.quantity}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-orange-600">
                            {formatPrice(item.price)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors duration-200"
            >
              Đóng
            </button>
            <button className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-200 flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Liên hệ shipper
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
