
import { APIProvider, Map } from '@vis.gl/react-google-maps';


// https://github.com/visgl/react-google-maps/blob/main/examples/basic-map/src/app.tsx

export default function MapView() {
const apiKey = globalThis.GOOGLE_MAPS_API_KEY ?? (process.env.GOOGLE_MAPS_API_KEY as string);

  if (!apiKey) {
    return (
      <div className="p-4 text-red-600 bg-red-50 rounded-md">
        Missing GOOGLE_MAPS_API_KEY
      </div>
    );
  }
  return (
    <>
      <APIProvider apiKey={apiKey}>
        <Map
          defaultCenter={{ lat: 43.255203, lng: -79.843826 }}
          defaultZoom={13}
          gestureHandling='greedy'
          disableDefaultUI
        />
      </APIProvider>
    </>
  )
}