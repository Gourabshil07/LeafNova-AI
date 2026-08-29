

import os
from datetime import datetime, timezone, timedelta

from supabase import create_client, Client


# ==========================================
# SUPABASE CONNECTION
# ==========================================

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")


if not SUPABASE_URL:
    raise RuntimeError("SUPABASE_URL is not configured")


if not SUPABASE_KEY:
    raise RuntimeError("SUPABASE_KEY is not configured")


supabase: Client = create_client(
    SUPABASE_URL,
    SUPABASE_KEY
)


# ==========================================
# PLANT GUIDE CACHE
# ==========================================

def get_plant_guide(plant, season):

    response = (
        supabase
        .table("plant_guides")
        .select("*")
        .eq("plant_name", plant)
        .eq("season", season)
        .limit(1)
        .execute()
    )

    if response.data:
        return response.data[0]["guide"]

    return None


def save_plant_guide(plant, season, guide):

    response = (
        supabase
        .table("plant_guides")
        .insert({
            "plant_name": plant,
            "season": season,
            "guide": guide
        })
        .execute()
    )

    return response.data



from datetime import datetime, timezone, timedelta


# ==========================================
# WEATHER CACHE
# ==========================================

def get_weather_cache(lat=None, lon=None, city=None, max_age_minutes=10):

    try:

        cutoff = (
            datetime.now(timezone.utc)
            - timedelta(minutes=max_age_minutes)
        ).isoformat()

        query = (
            supabase
            .table("weather_cache")
            .select("*")
            .eq("data_type", "current")
            .gte("fetched_at", cutoff)
        )

        if lat is not None and lon is not None:

            query = (
                query
                .eq("latitude", float(lat))
                .eq("longitude", float(lon))
            )

        elif city:

            query = query.eq("city", city)

        else:

            return None

        response = (
            query
            .order("fetched_at", desc=True)
            .limit(1)
            .execute()
        )

        if response.data:

            print("Weather found in PostgreSQL cache.")

            return response.data[0]

        print("No valid weather cache found.")

        return None

    except Exception as e:

        print("Weather cache read error:", e)

        return None


def save_weather_cache(weather_data):

    try:

        coord = weather_data.get("coord", {})

        latitude = coord.get("lat")
        longitude = coord.get("lon")

        city = weather_data.get("name")

        if latitude is None or longitude is None:

            print("Weather cache save skipped: coordinates missing.")

            return None

        data = {
            "city": city,
            "latitude": latitude,
            "longitude": longitude,
            "weather_data": weather_data,
            "data_type": "current"
        }

        response = (
            supabase
            .table("weather_cache")
            .insert(data)
            .execute()
        )

        print("Weather saved to PostgreSQL cache.")

        return response.data

    except Exception as e:

        print("Weather cache save error:", e)

        return None