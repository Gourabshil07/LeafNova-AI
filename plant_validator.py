import json
from config import groq_client


def validate_plant_name(plant):

    prompt = f"""
You are a botanist.

Determine whether the following input is a real and recognized plant.

Plant:
{plant}

Rules:

- Accept vegetables
- Accept fruits
- Accept flowers
- Accept herbs
- Accept crops
- Accept trees
- Accept ornamental plants
- Accept medicinal plants

Reject:

- Random words
- Keyboard mashing
- Numbers
- Symbols
- Unknown words
- Fictional plants

Return ONLY JSON.

If valid:

{{
    "success": true
}}

If invalid:

{{
    "success": false,
    "message": "Invalid plant name. Please enter a valid plant."
}}
"""

    response = groq_client.chat.completions.create(

        model="llama-3.3-70b-versatile",

        temperature=0,

        response_format={"type": "json_object"},

        messages=[
            {
                "role": "system",
                "content": "You are a plant taxonomy expert."
            },
            {
                "role": "user",
                "content": prompt
            }
        ]

    )

    return json.loads(response.choices[0].message.content)