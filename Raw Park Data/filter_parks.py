"""
Used to filter out the raw park data from: https://open.hamilton.ca/datasets/SpatialSolutions::park-sports-fields/about

Reads the GeoJSON and keeps only City-owned sports fields in Hamilton Mountain
and Lower Hamilton
Bocce is the exception thats allowed a null owner.

It then picks 3 parks per sport, alternating between the two areas where
possible, and writes them to a plain JSON file as a list of objects with
sport, recArea, ownership and coordinates.

Usage: python filter_parks.py [input.geojson] [output.json]
"""
import json
import random
import sys
from collections import defaultdict

INPUT_FILE = sys.argv[1] if len(sys.argv) > 1 else "Raw_Parks.geojson"
OUTPUT_FILE = sys.argv[2] if len(sys.argv) > 2 else "Parks.json"

ALLOWED_AREAS = ["Hamilton Mountain", "Lower Hamilton"]
ALLOWED_OWNERSHIP = "City"
ALLOWED_TYPES = ["Basketball", "Baseball", "Football", "Soccer", "Bocce", "Tennis"]
NULL_OWNERSHIP_TYPES = {"Bocce"}  # these types may also have OWNERSHIP = null
PER_TYPE = 5
SEED = 42  # set to None for a different random pick every run


def passes_filters(props):
    """Criteria: REC_AREA, OWNERSHIP and TYPE must all be allowed values.
    Bocce is the exception: its OWNERSHIP may also be null."""
    if props["REC_AREA"] not in ALLOWED_AREAS or props["TYPE"] not in ALLOWED_TYPES:
        return False

    allowed_ownership = [ALLOWED_OWNERSHIP]
    if props["TYPE"] in NULL_OWNERSHIP_TYPES:
        allowed_ownership.append(None)
    return props["OWNERSHIP"] in allowed_ownership


def reshape(feature):
    """Flat object: sport, recArea, ownership + coordinates (no OBJECTID, PARK_NAME or geometry)."""
    props = feature["properties"]
    # GeoJSON stores coordinates as [lng, lat]; Google Maps wants {lat, lng}
    lng, lat = feature["geometry"]["coordinates"]
    return {
        "sport": props["TYPE"],
        "recArea": props["REC_AREA"],
        "ownership": props["OWNERSHIP"],
        "coordinates": {"lat": lat, "lng": lng},
    }

def to_camel_case(text):
    """'Basketball' -> 'basketball', 'Table Tennis' -> 'tableTennis'"""
    first, *rest = text.replace("_", " ").split()
    return first.lower() + "".join(word.capitalize() for word in rest)


def pick_diverse(parks, n):
    """Pick up to n parks, alternating between the allowed REC_AREAs so that
    both areas show up whenever both have parks of this type."""
    by_area = defaultdict(list)
    for p in parks:
        by_area[p["recArea"]].append(p)
    for group in by_area.values():
        random.shuffle(group)

    picked = []
    while len(picked) < n and any(by_area[a] for a in ALLOWED_AREAS):
        for area in ALLOWED_AREAS:
            if by_area[area] and len(picked) < n:
                picked.append(by_area[area].pop())
    return picked


def main():
    if SEED is not None:
        random.seed(SEED)

    with open(INPUT_FILE, encoding="utf-8") as f:
        data = json.load(f)

    parks = [reshape(ft) for ft in data["features"] if passes_filters(ft["properties"])]

    by_type = defaultdict(list)
    for p in parks:
        by_type[p["sport"]].append(p)

    result = []
    for sport in ALLOWED_TYPES:
        chosen = pick_diverse(by_type[sport], PER_TYPE)
        areas = {p["recArea"] for p in chosen}

        if len(chosen) < PER_TYPE:
            print(f"Note: only {len(chosen)} {sport} park(s) match the criteria.")
        elif len(areas) < 2:
            print(f"Note: all {sport} parks that match are in {areas.pop()}.")

        # id counts every park in the output (starting at 1);
        # key is <sportName>_<n>, counting parks within that sport (starting at 1)
        for n, park in enumerate(chosen, start=1):
            result.append({
                "id": len(result) + 1,
                "key": f"{to_camel_case(sport)}_{n}",
                **park,
            })

    # Plain JSON: just the list of parks
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=4)

    print(f"Wrote {len(result)} parks to {OUTPUT_FILE}")



if __name__ == "__main__":
    main()