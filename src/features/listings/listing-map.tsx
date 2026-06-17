"use client";

import { useEffect, useRef } from "react";

import "maplibre-gl/dist/maplibre-gl.css";

export function ListingMap({
  lng,
  lat,
  label,
}: {
  lng: number;
  lat: number;
  label?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    let map: { remove: () => void } | null = null;
    let cancelled = false;

    (async () => {
      const maplibregl = (await import("maplibre-gl")).default;
      if (cancelled || !ref.current) return;
      const m = new maplibregl.Map({
        container: ref.current,
        style: {
          version: 8,
          sources: {
            osm: {
              type: "raster",
              tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
              tileSize: 256,
              attribution: "© OpenStreetMap katkıda bulunanlar",
            },
          },
          layers: [{ id: "osm", type: "raster", source: "osm" }],
        },
        center: [lng, lat],
        zoom: 12,
      });
      m.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
      new maplibregl.Marker({ color: "#f97316" }).setLngLat([lng, lat]).addTo(m);
      map = m;
    })();

    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [lng, lat]);

  return (
    <div
      ref={ref}
      aria-label={label}
      className="h-64 w-full overflow-hidden rounded-2xl border border-border"
    />
  );
}
