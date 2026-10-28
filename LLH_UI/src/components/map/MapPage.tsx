import { useEffect, useState } from "react";
import { useMapsLibrary, AdvancedMarker, APIProvider, Map, Pin } from "@vis.gl/react-google-maps";
import Parks from '../../assets/Parks.json';

type LatLng = {
    lat: number;
    lng: number;
}

type Park = {
    id: number;
    key: string;
    sport: string;
    recArea: string;
    ownership: string | null;
    coordinates: LatLng;
}

type PhotoCredit = {
    name: string;
    url?: string;
};
/**
 * @see https://github.com/visgl/react-google-maps/blob/main/examples/places-ui-kit/src/app.tsx#L53
 * @see https://developers.google.com/maps/documentation/javascript/nearby-search
 * @param param0 
 */
export function ParkImage({ coordinates }: { coordinates: LatLng }) {
    const placesLibrary = useMapsLibrary("places");

    const [photoUrl, setPhotoUrl] = useState<string | null>(null);
    const [credits, setCredits] = useState<PhotoCredit[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!placesLibrary) return;

        let cancelled = false;

        async function fetchPhoto() {
            setLoading(true);
            setPhotoUrl(null);
            setCredits([]);

            try {
                const { places } = await placesLibrary.Place.searchNearby({
                    fields: ["displayName", "location", "photos"],
                    locationRestriction: {
                        center: coordinates,
                        radius: 300,
                    },
                    includedPrimaryTypes: ["park"],
                    maxResultCount: 5,
                    rankPreference:
                        placesLibrary.SearchNearbyRankPreference.DISTANCE,
                });

                // Pick the nearest returned park that has a photo.
                const matchingPark = places.find(
                    (place) => (place.photos?.length ?? 0) > 0
                );

                const photo = matchingPark?.photos?.[0];

                if (cancelled) return;

                if (photo) {
                    setPhotoUrl(
                        photo.getURI({
                            maxWidth: 600,
                            maxHeight: 600,
                        })
                    );

                    setCredits(
                        photo.authorAttributions.map((author) => ({
                            name: author.displayName,
                            url: author.uri ?? undefined,
                        }))
                    );
                }
            } catch (error) {
                if (!cancelled) {
                    console.error("Failed to fetch park photo:", error);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        void fetchPhoto();

        return () => {
            cancelled = true;
        };
    }, [placesLibrary, coordinates.lat, coordinates.lng]);

    if (loading) {
        return (
            <div className="flex h-48 items-center justify-center bg-gray-100 text-sm text-gray-500">
                Fetching park photo...
            </div>
        );
    }

    if (!photoUrl) {
        return (
            <div className="flex h-48 items-center justify-center bg-gray-100 text-sm text-gray-500">
                No image found for this park.
            </div>
        );
    }

    return (
        <div className="mb-6 overflow-hidden">
            <img
                src={photoUrl}
                alt="Nearby park"
                className="h-48 w-full border-2 border-text-main object-cover shadow-hard-hover"
            />

            {credits.length > 0 && (
                <p className="mt-1 text-xs text-muted">
                    Photo attribution:{" "}
                    {credits.map((credit, index) => (
                        <span key={`${credit.name}-${index}`}>
                            {index > 0 && ", "}
                            {credit.url ? (
                                <a
                                    href={credit.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="underline"
                                >
                                    {credit.name}
                                </a>
                            ) : (
                                credit.name
                            )}
                        </span>
                    ))}
                </p>
            )}
        </div>
    );
}

function ParkMarkers({ onParkSelect }: { onParkSelect: (park: Park) => void }) {
    const icons: Record<string, string> = {
        Basketball: '🏀',
        Baseball: '⚾',
        Football: '🏈',
        Soccer: '⚽',
        Bocce: '🟢',
        Tennis: '🎾',
    };

    return (
        <>
            {
                Parks.map((park) => (
                    <AdvancedMarker
                        clickable={true}
                        key={park.key}
                        position={park.coordinates}
                        title={`${park.sport}-${park.ownership ?? ''}: ${park.id}`}
                        onClick={() => onParkSelect(park)}>
                        <Pin
                            glyph={icons[park.sport]}
                        />
                    </AdvancedMarker>
                ))
            }
        </>
    )
}


export default function MapPage() {
    const [selectedPark, setSelectedPark] = useState<Park>(Parks[0]);
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
        <APIProvider apiKey={apiKey}>
            <main className="mx-auto flex min-h-0 w-full flex-1 flex-col overflow-y-auto bg-off-white md:flex-row md:overflow-hidden">
                <aside
                    aria-label="Selected location details"
                    className="z-10 flex w-full shrink-0 flex-col border-b-2 border-text-main md:w-[320px] md:border-r-2 lg:w-100">

                    <div className="flex flex-col p-4 sm:p-6 md:min-h-0 md:flex-1 md:overflow-y-auto">
                        <div className="mb-6 gap-3">
                            <div>
                                <h1 className="mb-1 font-heading text-3xl font-bold leading-tight tracking-tight text-text-main">
                                    {selectedPark.sport} Park
                                </h1>
                                <p className="flex items-center gap-1 text-base font-medium text-muted">
                                    <span aria-hidden="true" className="material-symbols-outlined text-lg">
                                        location_on
                                    </span>
                                    {selectedPark.recArea}
                                </p>
                            </div>
                        </div>
                        <ParkImage coordinates={selectedPark.coordinates} />

                        <section aria-labelledby="sportHeading" className="mb-8">
                            <h2
                                className="mb-3 inline-block border-b-2 border-text-main pb-1 text-lg font-bold uppercase tracking-wide text-text-main"
                                id="sportHeading">
                                Sports
                            </h2>
                            <p>
                                You can play {selectedPark.sport.toLowerCase()}
                            </p>                            
                            {selectedPark.ownership && (
                                <p>Owned by the {selectedPark.ownership}</p>
                            )}
                        </section>

                        {/* <button
                            className="mt-auto flex w-full items-center justify-center gap-2 border-2 border-text-main bg-primary px-6 py-4 text-lg font-bold uppercase tracking-wider text-white shadow-hard transition-all hover:-translate-y-0.5 hover:shadow-hard active:translate-y-1 active:shadow-none"
                            type="button">
                            <span aria-hidden="true" className="material-symbols-outlined">
                                directions
                            </span>
                            Get Directions
                        </button> */}
                    </div>
                </aside>

                <Map
                    defaultCenter={{ lat: 43.2148734767352, lng: -79.8500970787141 }}
                    defaultZoom={13}
                    gestureHandling='greedy'
                    disableDefaultUI
                    mapId={mapId}
                    colorScheme="FOLLOW_SYSTEM">
                    <ParkMarkers onParkSelect={setSelectedPark} />
                </Map>

            </main>
        </APIProvider>
    )
}