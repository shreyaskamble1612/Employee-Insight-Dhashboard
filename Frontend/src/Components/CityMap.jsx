import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

export default function CityMap({ employees }) {
  const geocodeCacheRef = useRef(new Map());
  const [cityCoords, setCityCoords] = useState({});

  useEffect(() => {
    let isCancelled = false;

    const fetchCoords = async () => {
      const uniqueCities = [...new Set((employees ?? []).map((employee) => String(employee.city ?? "").trim()).filter(Boolean))];
      const nextCoords = {};

      for (const city of uniqueCities) {
        const cached = geocodeCacheRef.current.get(city);
        if (cached) {
          nextCoords[city] = cached;
          continue;
        }

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(city)}&format=json&limit=1`,
            {
              headers: {
                Accept: "application/json"
              }
            }
          );

          if (!response.ok) {
            continue;
          }

          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            const coordinate = [Number.parseFloat(data[0].lat), Number.parseFloat(data[0].lon)];
            geocodeCacheRef.current.set(city, coordinate);
            nextCoords[city] = coordinate;
          }
        } catch {
          // Keep map rendering for remaining cities even if one geocode call fails.
        }
      }

      if (!isCancelled) {
        setCityCoords(nextCoords);
      }
    };

    fetchCoords();

    return () => {
      isCancelled = true;
    };
  }, [employees]);

  return (
    <MapContainer
      center={[22.5937, 78.9629]}
      zoom={5}
      style={{ height: "400px", width: "100%" }}
    >
      <TileLayer
        attribution="© OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {Object.entries(cityCoords).map(([city, coords]) => (
        <Marker key={city} position={coords}>
          <Popup>{city}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}