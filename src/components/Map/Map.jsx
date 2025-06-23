import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Navigation,
  MapPin,
  Clock,
  Route,
  Car,
  MonitorCheckIcon,
  Truck,
  X,
  Menu,
  Phone,
  Package,
  User,
  DollarSign,
} from "lucide-react";

const GoogleMapsStyleDelivery = () => {
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markersRef = useRef([]);
  const routeLayerRef = useRef(null);

  // Sử dụng API key mới và backup services
  const ROUTING_SERVICES = [
    {
      name: "OpenRouteService",
      key: "5b3ce3597851110001cf6248c0a6312b1c934b80d91e6b8fc52a4bf7d",
      getUrl: (start, end, mode) =>
        `https://api.openrouteservice.org/v2/directions/${mode}?api_key=${ROUTING_SERVICES[0].key}&start=${start}&end=${end}`,
    },
    {
      name: "Mapbox",
      key: "pk.eyJ1IjoidGVzdC1hY2NvdW50IiwiYSI6ImNrbHZ4cjJ6MzAyZWUycW1yYWE4ZTZzNW8ifQ.test",
      getUrl: (start, end, mode) => {
        const profile =
          mode === "driving-car"
            ? "driving"
            : mode === "cycling-regular"
            ? "cycling"
            : "driving";
        return `https://api.mapbox.com/directions/v5/mapbox/${profile}/${start};${end}?access_token=${ROUTING_SERVICES[1].key}&geometries=geojson`;
      },
    },
  ];

  const [searchFrom, setSearchFrom] = useState("Đắk Sin, Đắk R'Lấp, Đắk Nông");
  const [searchTo, setSearchTo] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [transportMode, setTransportMode] = useState("driving-car");
  const [routingStatus, setRoutingStatus] = useState("");

  const [orders, setOrders] = useState([
    {
      id: 1,
      customerName: "Nguyễn Văn A",
      address: "123 Nguyễn Huệ, Quận 1, TP.HCM",
      phone: "0901234567",
      status: "pending",
      items: "2x Áo thun, 1x Quần jean",
      totalAmount: 850000,
      coords: [10.7769, 106.7009],
      notes: "Giao buổi chiều",
    },
    {
      id: 2,
      customerName: "Trần Thị B",
      address: "456 Lê Lợi, Quận 3, TP.HCM",
      phone: "0987654321",
      status: "delivering",
      items: "1x Giày sneaker",
      totalAmount: 1200000,
      coords: [10.7756, 106.6934],
      notes: "Gọi trước khi đến",
    },
    {
      id: 3,
      customerName: "Lê Văn C",
      address: "789 Võ Văn Tần, Quận 3, TP.HCM",
      phone: "0912345678",
      status: "completed",
      items: "3x Mũ snapback",
      totalAmount: 450000,
      coords: [10.7829, 106.6928],
      notes: "",
    },
  ]);

  // Vị trí điểm xuất phát (Đắk Sin, Đắk Nông)
  const startLocation = [11.8232911, 107.5150139];

  useEffect(() => {
    // Load Leaflet
    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    if (!window.L) {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = initMap;
      document.head.appendChild(script);
    } else {
      initMap();
    }
  }, []);

  const initMap = () => {
    if (leafletMapRef.current) return;

    const L = window.L;
    const map = L.map(mapRef.current, {
      zoomControl: false,
    }).setView(startLocation, 8);

    // Google-style tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 18,
    }).addTo(map);

    // Custom zoom control position
    L.control
      .zoom({
        position: "bottomright",
      })
      .addTo(map);

    leafletMapRef.current = map;
    updateMapMarkers();
  };

  const updateMapMarkers = () => {
    if (!leafletMapRef.current || !window.L) return;

    const L = window.L;
    const map = leafletMapRef.current;

    // Clear existing markers
    markersRef.current.forEach((marker) => map.removeLayer(marker));
    markersRef.current = [];

    // Add start location marker (Đắk Sin)
    const startIcon = L.divIcon({
      html: `<div style="background: #4285f4; color: white; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">A</div>`,
      className: "custom-div-icon",
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const startMarker = L.marker(startLocation, { icon: startIcon }).addTo(map)
      .bindPopup(`
        <div style="padding: 12px; min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; color: #1a73e8; font-size: 16px;">📍 Điểm xuất phát</h3>
          <p style="margin: 4px 0; color: #5f6368;">Đắk Sin, Đắk R'Lấp, Đắk Nông</p>
          <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e8eaed;">
            <small style="color: #5f6368;">Tọa độ: ${startLocation[0].toFixed(
              6
            )}, ${startLocation[1].toFixed(6)}</small>
          </div>
        </div>
      `);

    markersRef.current.push(startMarker);

    // Add order markers
    orders.forEach((order, index) => {
      const markerLabel = String.fromCharCode(66 + index); // B, C, D...
      const color = getStatusColor(order.status);

      const orderIcon = L.divIcon({
        html: `<div style="background: ${color}; color: white; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">${markerLabel}</div>`,
        className: "custom-div-icon",
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker(order.coords, { icon: orderIcon }).addTo(map)
        .bindPopup(`
          <div style="padding: 12px; min-width: 250px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
              <div style="background: ${color}; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px;">${markerLabel}</div>
              <h3 style="margin: 0; color: #202124; font-size: 16px;">${
                order.customerName
              }</h3>
            </div>
            
            <div style="space-y: 6px;">
              <div style="display: flex; align-items: flex-start; gap: 8px; margin-bottom: 6px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#5f6368" style="margin-top: 2px; flex-shrink: 0;">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                <span style="color: #5f6368; font-size: 14px; line-height: 1.4;">${
                  order.address
                }</span>
              </div>
              
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#5f6368">
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                </svg>
                <span style="color: #5f6368; font-size: 14px;">${
                  order.phone
                }</span>
              </div>
              
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#5f6368">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <span style="color: #5f6368; font-size: 14px;">${
                  order.items
                }</span>
              </div>
              
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#5f6368">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <span style="color: #137333; font-weight: 500; font-size: 14px;">${order.totalAmount.toLocaleString()}đ</span>
              </div>
            </div>
            
            <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e8eaed;">
              <span style="background: ${getStatusBg(
                order.status
              )}; color: ${color}; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: 500;">
                ${getStatusText(order.status)}
              </span>
            </div>
          </div>
        `);

      marker.on("click", () => {
        setSelectedOrder(order);
        setSearchTo(`${order.customerName} - ${order.address}`);
      });

      markersRef.current.push(marker);
    });
  };

  useEffect(() => {
    updateMapMarkers();
  }, [orders]);

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "#ea4335";
      case "delivering":
        return "#fbbc04";
      case "completed":
        return "#34a853";
      default:
        return "#9aa0a6";
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case "pending":
        return "#fce8e6";
      case "delivering":
        return "#fef7e0";
      case "completed":
        return "#e6f4ea";
      default:
        return "#f1f3f4";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Chờ giao";
      case "delivering":
        return "Đang giao";
      case "completed":
        return "Hoàn thành";
      default:
        return "Không xác định";
    }
  };

  // Cải thiện hàm tính toán khoảng cách (Haversine formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Hàm tạo đường thẳng đơn giản khi API không hoạt động
  const createStraightLineRoute = (start, end) => {
    const distance = calculateDistance(start[0], start[1], end[0], end[1]);
    const duration = Math.round((distance / 60) * 60); // Giả sử tốc độ 60km/h

    if (routeLayerRef.current) {
      leafletMapRef.current.removeLayer(routeLayerRef.current);
    }

    const L = window.L;
    routeLayerRef.current = L.polyline([start, end], {
      color: "#4285f4",
      weight: 5,
      opacity: 0.8,
      dashArray: "10, 10", // Đường gạch gạch để thể hiện đây là đường thẳng ước tính
    }).addTo(leafletMapRef.current);

    const group = new L.featureGroup([
      routeLayerRef.current,
      ...markersRef.current,
    ]);
    leafletMapRef.current.fitBounds(group.getBounds().pad(0.1));

    setRouteInfo({
      distance: distance.toFixed(1),
      duration: duration,
      isEstimate: true,
    });
  };

  const calculateRoute = async () => {
    if (!selectedOrder || !selectedOrder.coords || isLoadingRoute) {
      alert("Vui lòng chọn một đơn hàng hợp lệ!");
      return;
    }

    setIsLoadingRoute(true);
    setRoutingStatus("Đang tìm tuyến đường...");

    try {
      const start = `${startLocation[1]},${startLocation[0]}`;
      const end = `${selectedOrder.coords[1]},${selectedOrder.coords[0]}`;

      // Thử từng service routing
      let routeFound = false;

      for (let i = 0; i < ROUTING_SERVICES.length && !routeFound; i++) {
        const service = ROUTING_SERVICES[i];
        setRoutingStatus(`Đang thử ${service.name}...`);

        try {
          const url = service.getUrl(start, end, transportMode);

          const response = await fetch(url);

          if (!response.ok) {
            continue;
          }

          const data = await response.json();

          let coordinates, distance, duration;

          if (service.name === "OpenRouteService") {
            if (!data.features || !data.features[0]) continue;
            const route = data.features[0];
            coordinates = route.geometry.coordinates.map((coord) => [
              coord[1],
              coord[0],
            ]);
            distance = (route.properties.segments[0].distance / 1000).toFixed(
              1
            );
            duration = Math.round(route.properties.segments[0].duration / 60);
          } else if (service.name === "Mapbox") {
            if (!data.routes || !data.routes[0]) continue;
            const route = data.routes[0];
            coordinates = route.geometry.coordinates.map((coord) => [
              coord[1],
              coord[0],
            ]);
            distance = (route.distance / 1000).toFixed(1);
            duration = Math.round(route.duration / 60);
          }

          if (coordinates && coordinates.length > 0) {
            if (routeLayerRef.current) {
              leafletMapRef.current.removeLayer(routeLayerRef.current);
            }

            const L = window.L;
            routeLayerRef.current = L.polyline(coordinates, {
              color: "#4285f4",
              weight: 5,
              opacity: 0.8,
            }).addTo(leafletMapRef.current);

            const group = new L.featureGroup([
              routeLayerRef.current,
              ...markersRef.current,
            ]);
            leafletMapRef.current.fitBounds(group.getBounds().pad(0.1));

            setRouteInfo({
              distance: distance,
              duration: duration,
              service: service.name,
            });

            routeFound = true;
            setRoutingStatus(`Tuyến đường từ ${service.name}`);
          }
        } catch (error) {
          console.error(`Error with ${service.name}:`, error);
          continue;
        }
      }

      // Nếu không tìm được route từ API nào, tạo đường thẳng ước tính
      if (!routeFound) {
        setRoutingStatus("Tạo tuyến đường ước tính...");
        createStraightLineRoute(startLocation, selectedOrder.coords);
        setRoutingStatus("Tuyến đường ước tính (đường thẳng)");
      }
    } catch (error) {
      console.error("Route calculation error:", error.message);
      setRoutingStatus("Tạo tuyến đường ước tính...");
      createStraightLineRoute(startLocation, selectedOrder.coords);
      setRoutingStatus("Tuyến đường ước tính (lỗi API)");
    } finally {
      setIsLoadingRoute(false);
    }
  };

  const getTransportIcon = (mode) => {
    switch (mode) {
      case "driving-car":
        return Car;
      case "cycling-regular":
        return MonitorCheckIcon;
      case "driving-hgv":
        return Truck;
      default:
        return Car;
    }
  };

  return (
    <div className="h-screen flex bg-white">
      {/* Google Maps Style Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-96" : "w-0"
        } transition-all duration-300 bg-white shadow-lg border-r border-gray-200 overflow-hidden`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-medium text-gray-900">Chỉ đường</h1>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>

            {/* Search inputs */}
            <div className="space-y-2">
              <div className="flex items-center bg-white border border-gray-300 rounded-lg p-3 focus-within:border-blue-500">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                <input
                  type="text"
                  value={searchFrom}
                  onChange={(e) => setSearchFrom(e.target.value)}
                  className="flex-1 outline-none text-sm"
                  placeholder="Chọn điểm xuất phát"
                />
              </div>

              <div className="flex items-center bg-white border border-gray-300 rounded-lg p-3 focus-within:border-blue-500">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                <input
                  type="text"
                  value={searchTo}
                  onChange={(e) => setSearchTo(e.target.value)}
                  className="flex-1 outline-none text-sm"
                  placeholder="Chọn điểm đến"
                />
              </div>
            </div>

            {/* Transport mode */}
            <div className="flex gap-2 mt-3">
              {[
                { mode: "driving-car", icon: Car, label: "Xe hơi" },
                {
                  mode: "cycling-regular",
                  icon: MonitorCheckIcon,
                  label: "Xe máy",
                },
                { mode: "driving-hgv", icon: Truck, label: "Xe tải" },
              ].map(({ mode, icon: Icon, label }) => (
                <button
                  key={mode}
                  onClick={() => setTransportMode(mode)}
                  className={`flex-1 p-2 rounded-lg border ${
                    transportMode === mode
                      ? "border-blue-500 bg-blue-50 text-blue-600"
                      : "border-gray-300 hover:bg-gray-50"
                  }`}
                  title={label}
                >
                  <Icon size={20} className="mx-auto" />
                </button>
              ))}
            </div>

            {/* Route button */}
            <button
              onClick={calculateRoute}
              disabled={!selectedOrder || isLoadingRoute}
              className="w-full mt-3 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoadingRoute ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              ) : (
                <Route size={20} />
              )}
              {isLoadingRoute ? "Đang tính..." : "Tìm đường đi"}
            </button>

            {/* Status */}
            {routingStatus && (
              <div className="mt-2 text-xs text-gray-600 text-center">
                {routingStatus}
              </div>
            )}
          </div>

          {/* Route info */}
          {routeInfo && (
            <div
              className={`p-4 border-b border-gray-200 ${
                routeInfo.isEstimate ? "bg-yellow-50" : "bg-blue-50"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Clock
                    size={16}
                    className={
                      routeInfo.isEstimate ? "text-yellow-600" : "text-blue-600"
                    }
                  />
                  <span
                    className={`font-medium ${
                      routeInfo.isEstimate ? "text-yellow-900" : "text-blue-900"
                    }`}
                  >
                    {routeInfo.duration} phút
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Navigation
                    size={16}
                    className={
                      routeInfo.isEstimate ? "text-yellow-600" : "text-blue-600"
                    }
                  />
                  <span
                    className={
                      routeInfo.isEstimate ? "text-yellow-800" : "text-blue-800"
                    }
                  >
                    {routeInfo.distance} km
                  </span>
                </div>
              </div>
              {routeInfo.isEstimate && (
                <div className="mt-2 text-xs text-yellow-700">
                  ⚠️ Đây là ước tính đường thẳng, không phải tuyến đường thực tế
                </div>
              )}
              {routeInfo.service && (
                <div className="mt-1 text-xs text-gray-600">
                  Nguồn: {routeInfo.service}
                </div>
              )}
            </div>
          )}

          {/* Orders list */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <h2 className="font-medium text-gray-900 mb-3">
                Danh sách đơn hàng ({orders.length})
              </h2>
              <div className="space-y-3">
                {orders.map((order, index) => {
                  const markerLabel = String.fromCharCode(66 + index);
                  return (
                    <div
                      key={order.id}
                      onClick={() => {
                        setSelectedOrder(order);
                        setSearchTo(`${order.customerName} - ${order.address}`);
                      }}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedOrder?.id === order.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5"
                          style={{
                            backgroundColor: getStatusColor(order.status),
                          }}
                        >
                          {markerLabel}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-medium text-gray-900 truncate">
                              {order.customerName}
                            </h3>
                            <span
                              className="px-2 py-1 rounded-full text-xs font-medium"
                              style={{
                                backgroundColor: getStatusBg(order.status),
                                color: getStatusColor(order.status),
                              }}
                            >
                              {getStatusText(order.status)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                            <MapPin size={12} />
                            <span className="truncate">{order.address}</span>
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-green-600">
                              {order.totalAmount.toLocaleString()}đ
                            </span>
                            <a
                              href={`tel:${order.phone}`}
                              onClick={(e) => e.stopPropagation()}
                              className="p-1 hover:bg-gray-200 rounded-full"
                            >
                              <Phone size={16} className="text-gray-600" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map container */}
      <div className="flex-1 relative">
        <div ref={mapRef} className="h-full w-full"></div>

        {/* Sidebar toggle button */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-lg hover:shadow-xl z-10"
          >
            <Menu size={20} className="text-gray-700" />
          </button>
        )}

        {/* Selected order info */}
        {selectedOrder && (
          <div className="absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow-lg p-4 mx-auto max-w-md">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-900">
                {selectedOrder.customerName}
              </h3>
              <button
                onClick={() => {
                  setSelectedOrder(null);
                  setSearchTo("");
                  setRouteInfo(null);
                  setRoutingStatus("");
                  if (routeLayerRef.current) {
                    leafletMapRef.current.removeLayer(routeLayerRef.current);
                    routeLayerRef.current = null;
                  }
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-gray-500" />
                <a
                  href={`tel:${selectedOrder.phone}`}
                  className="text-blue-600 hover:underline"
                >
                  {selectedOrder.phone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Package size={16} className="text-gray-500" />
                <span className="text-gray-700 truncate">
                  {selectedOrder.items}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoogleMapsStyleDelivery;
