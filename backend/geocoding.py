import time
import requests


NOMINATIM_URL = "https://nominatim.openstreetmap.org/reverse"

_cache = {}
_last_request_time = 0.0


def reverse_geocode(latitude: float, longitude: float):

    global _last_request_time

    print("\n================ REVERSE GEOCODING ================")
    print(f"Latitude  : {latitude}")
    print(f"Longitude : {longitude}")

    if latitude is None or longitude is None:
        print("ERROR: Coordinates are missing")
        return None

    key = (
        round(float(latitude), 6),
        round(float(longitude), 6)
    )

    if key in _cache:
        print("CACHE HIT")
        print(_cache[key])
        return _cache[key]

    elapsed = time.monotonic() - _last_request_time

    if elapsed < 1.0:
        time.sleep(1.0 - elapsed)

    params = {
        "lat": latitude,
        "lon": longitude,
        "format": "jsonv2",
        "addressdetails": 1,
        "namedetails": 1,
        "zoom": 18,
        "accept-language": "en",
    }

    headers = {
        "User-Agent": "BusVisionAI/1.0"
    }

    try:

        print("Calling Nominatim...")

        response = requests.get(
            NOMINATIM_URL,
            params=params,
            headers=headers,
            timeout=15,
        )

        _last_request_time = time.monotonic()

        print("HTTP STATUS:", response.status_code)

        response.raise_for_status()

        data = response.json()

        print("NOMINATIM RESPONSE:")
        print(data)

        address = data.get("address", {})

        road_name = (
            address.get("road")
            or address.get("pedestrian")
            or address.get("residential")
            or address.get("footway")
            or address.get("cycleway")
            or address.get("path")
            or address.get("service")
            or address.get("street")
            or data.get("name")
        )

        neighbourhood = (
            address.get("neighbourhood")
            or address.get("quarter")
            or address.get("hamlet")
        )

        suburb = (
            address.get("suburb")
            or address.get("city_district")
        )

        city = (
            address.get("city")
            or address.get("town")
            or address.get("municipality")
            or address.get("village")
        )

        result = {
            "display_name": data.get("display_name"),

            "road": road_name,

            "neighbourhood": neighbourhood,

            "suburb": suburb,

            "city": city,

            "state": address.get("state"),

            "postcode": address.get("postcode"),

            "country": address.get("country"),

            "county": address.get("county"),

            "district": address.get("district"),

            "latitude": latitude,

            "longitude": longitude,
        }

        print("FINAL GEOCODE RESULT:")
        print(result)

        _cache[key] = result

        return result

    except requests.exceptions.Timeout as e:

        print("ERROR: Nominatim TIMEOUT")
        print(e)

        return None

    except requests.exceptions.ConnectionError as e:

        print("ERROR: Nominatim CONNECTION ERROR")
        print(e)

        return None

    except requests.exceptions.HTTPError as e:

        print("ERROR: Nominatim HTTP ERROR")
        print(e)

        return None

    except Exception as e:

        print("ERROR: Reverse geocoding failed")
        print(type(e).__name__)
        print(e)

        return None