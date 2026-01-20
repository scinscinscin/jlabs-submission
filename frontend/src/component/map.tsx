import { GoogleMap, useLoadScript, MarkerF } from "@react-google-maps/api";
import "./map.css";

type Props = {
  coordinates: {
    lat: number;
    lng: number;
  };
};

/**
 * Display Google Maps, render a single marker or multiple markers with as center
 * @params props - could either be a single coordinate or multiplec oordinates with a center
 * @example ```tsx
 *      <Map latitude={props.latitude} longitude={props.longitude} />
 *      <Map
 *        center={{ latitude: currentCoordinates.latitude, longitude: currentCoordinates.longitude }}
 *        coordinates={sortedList.map((r) => ({ latitude: r.lat, longitude: r.long }))}
 *      />
 * ```
 */
export function GoogleMaps(props: Props & { className?: string }) {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  if (isLoaded == false) return <h1> Loading Google Maps... </h1>;
  return (
    <GoogleMap
      zoom={18}
      center={props.coordinates}
      mapContainerClassName={"map_container" + " " + (props.className ?? "")}
    >
      <MarkerF position={props.coordinates} />
    </GoogleMap>
  );
}
