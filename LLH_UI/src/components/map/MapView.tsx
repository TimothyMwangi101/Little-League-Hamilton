import { AdvancedMarker, APIProvider, Map, Pin } from '@vis.gl/react-google-maps';
import Parks from '../../assets/Parks.json';

export type LatLng = {
  lat: number;
  lng: number;
}

export type Park = {
  id: number;
  key: string;
  sport: string;
  recArea: string;
  ownership: string | null;
  coordinates: LatLng
}

export type Poi = {
  key: string;
  location: LatLng
}


function ParkMarkers() {


  return (
    <>
      {
        Parks.map((park) => (
          <AdvancedMarker
            key={park.key}
            position={park.coordinates}>
            <Pin background={'#FBBC04'} glyphColor={'red'} borderColor={'#000'} />
          </AdvancedMarker>
        ))
      }

    </>
  )
}

export default function MapView() {
  // https://github.com/visgl/react-google-maps/blob/main/examples/basic-map/src/app.tsx
  const apiKey = GOOGLE_MAPS_API_KEY;
  const mapId = GOOGLE_MAPS_MAP_ID;


  if (!apiKey) {
    return (
      <div className="p-4 text-red-600 bg-red-50 rounded-md">
        Missing GOOGLE_MAPS_API_KEY
      </div>
    );
  } else if (!mapId) {
    return (
      <div className="p-4 text-red-600 bg-red-50 rounded-md">
        Missing GOOGLE_MAPS_MAP_ID
      </div>
    );
  }

  return (
    <>
      <APIProvider apiKey={apiKey}>
        <Map
          defaultCenter={{ lat: 43.2148734767352, lng: -79.8500970787141 }}
          defaultZoom={13}
          gestureHandling='greedy'
          disableDefaultUI
          mapId={mapId}
          colorScheme="FOLLOW_SYSTEM">

          <ParkMarkers />
        </Map>
      </APIProvider>
    </>
  )
}