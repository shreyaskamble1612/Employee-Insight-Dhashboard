import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { cityCoords as localCityCoords } from "../utils/citiCoordinates";

export default function CityMap({ employees }) {
  const geocodeCacheRef = useRef(new Map());
  const [cityCoords, setCityCoords] = useState({});
  const [isGeocoding, setIsGeocoding] = useState(false);

  const findLocalCityCoordinate = (city) => {
    const exact = localCityCoords[city];
    if (exact) {
      return exact;
    }

    const normalizedCity = String(city).trim().toLowerCase();
    const localKey = Object.keys(localCityCoords).find((key) => key.toLowerCase() === normalizedCity);
    if (localKey) {
      return localCityCoords[localKey];
    }

    const fallbackKey = Object.keys(localCityCoords).find((key) => key.toLowerCase() === normalizedCity);
    if (fallbackKey) {
      return localCityCoords[fallbackKey];
    }

    return null;
  };

  useEffect(() => {
    let isCancelled = false;

    const fetchCoords = async () => {
      setIsGeocoding(true);
      const uniqueCities = [...new Set((employees ?? []).map((employee) => String(employee.city ?? "").trim()).filter(Boolean))];
      const nextCoords = {};

      for (const city of uniqueCities) {
        const localCoordinate = findLocalCityCoordinate(city);
        if (localCoordinate) {
          nextCoords[city] = localCoordinate;
          geocodeCacheRef.current.set(city, localCoordinate);
          continue;
        }

        const cached = geocodeCacheRef.current.get(city);
        if (cached) {
          nextCoords[city] = cached;
          continue;
        }

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`,
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
          } else {
            const fallbackCoordinate = findLocalCityCoordinate(city);
            if (fallbackCoordinate) {
              nextCoords[city] = fallbackCoordinate;
            }
          }
        } catch {
          const fallbackCoordinate = findLocalCityCoordinate(city);
          if (fallbackCoordinate) {
            nextCoords[city] = fallbackCoordinate;
          }
        }
      }

      if (!isCancelled) {
        setCityCoords(nextCoords);
        setIsGeocoding(false);
      }
    };

    fetchCoords();

    return () => {
      isCancelled = true;
    };
  }, [employees]);

  if (!employees?.length) {
    return <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">No city data available yet.</div>;
  }

  if (isGeocoding && Object.keys(cityCoords).length === 0) {
    return <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">Loading city markers...</div>;
  }

  if (Object.keys(cityCoords).length === 0) {
    return <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">No coordinates could be resolved for employee cities.</div>;
  }

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
        <CircleMarker key={city} center={coords} radius={8} pathOptions={{ color: "#f97316", fillColor: "#fb923c", fillOpacity: 0.85 }}>
          <Popup>{city}</Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}