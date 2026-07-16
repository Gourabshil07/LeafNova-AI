import json
from config import groq_client


def generate_plant_guide(plant, season):

    prompt = f"""
You are a world-class agricultural scientist, botanist, and horticulture expert with over 30 years of experience.

Generate a COMPLETE cultivation guide.

Plant:
{plant}

Season:
{season}

Return ONLY valid JSON.

Do NOT use markdown.

Do NOT explain anything.

The JSON structure MUST EXACTLY match the schema below.

Never rename keys.

Never remove keys.

Never flatten nested objects.

If information is unavailable, return an empty string "" instead.

{{
    "success": true,

    "plant":"",

    "scientific_name":"",

    "plant_type":"",

    "difficulty":"Easy / Moderate /Hard",

    "growing_season":"",

    "overview":"",

    "soil":{{

        "best_soil":"",

        "soil_ph":"",

        "organic_matter":"",

        "preparation":""

    }},

    "climate":{{

        "temperature":"",

        "humidity":"",

        "sunlight":""

    }},

    "watering":{{

        "frequency":"",

        "method":"",

        "tips":""

    }},

    "fertilizer":{{

        "type":"",

        "schedule":"",

        "quantity":""

    }},

    "pest_disease":[

        {{"text":""}},
        {{"text":""}},
        {{"text":""}},
        {{"text":""}}

    ],

    "maintenance":[

        {{"text":""}},
        {{"text":""}},
        {{"text":""}},
        {{"text":""}}

    ],

    "weekly_care":[

        {{"text":""}},
        {{"text":""}},
        {{"text":""}},
        {{"text":""}}

    ],

    "growth_timeline":[

        {{"text":""}},
        {{"text":""}},
        {{"text":""}},
        {{"text":""}}

    ],

    "common_mistakes":[

        {{"text":""}},
        {{"text":""}},
        {{"text":""}},
        {{"text":""}}

    ],

    "harvest":{{

        "harvest_time":"",

        "signs":"",

        "storage":""

    }},

    "pro_tips":[

        {{"text":""}},
        {{"text":""}},
        {{"text":""}},
        {{"text":""}}

    ]

}}

Rules:

1. Output ONLY JSON.
2. Do not add extra keys.
3. Do not remove any keys.
4. Every nested object must exist.
5. Every array must contain exactly 4 objects.
6. Use the exact key names shown above.
7. All information must be specific to the plant and season.
"""

    response = groq_client.chat.completions.create(

        model="llama-3.3-70b-versatile",

        temperature=0.2,

        response_format={"type": "json_object"},

        messages=[
            {
                "role": "system",
                "content": "You are an agricultural expert."
            },
            {
                "role": "user",
                "content": prompt
            }
        ]

    )

    return json.loads(response.choices[0].message.content)