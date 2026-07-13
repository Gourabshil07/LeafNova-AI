
from email.mime import image
from flask import Flask, render_template, request, redirect, send_from_directory, jsonify
import numpy as np
import json
import uuid
import tensorflow as tf
import google.generativeai as genai
import PIL.Image
from groq import Groq


# from googletrans import Translator
from gtts import gTTS

# translator = Translator()
import os
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")



app = Flask(__name__)
os.makedirs("uploadimages", exist_ok=True)

# Gemini API Key

genai.configure(api_key=GEMINI_API_KEY)

gemini_model = genai.GenerativeModel("gemini-2.5-flash")

groq_client = Groq(api_key=GROQ_API_KEY)

model = tf.keras.models.load_model("models/plant_disease_prediction_model.keras")

# Load disease JSON
with open("plant_disease.json", "r") as file:
    plant_disease = json.load(file)


@app.route('/uploadimages/<path:filename>')
def uploaded_images(filename):
    return send_from_directory('./uploadimages', filename)


@app.route('/', methods=['GET'])
def home():
    return render_template('home.html')

@app.route("/weather")
def weather():
    return render_template("weather.html")

@app.route("/about")
def About():
    return render_template("about.html")

@app.route("/weather_ai", methods=["POST"])
def weather_ai():

    weather = request.json


    prompt = f"""
You are a highly experienced agricultural scientist, agronomist, and crop protection specialist with more than 25 years of practical farming experience.

Analyze the following weather conditions carefully and provide professional farming recommendations.

Weather Details

City: {weather['city']}
Temperature: {weather['temperature']} °C
Humidity: {weather['humidity']} %
Wind Speed: {weather['wind']} km/h
Weather Condition: {weather['weather']}
Visibility: {weather['visibility']}
Rainfall Chance: {weather['rain']}

Your recommendations should help farmers make better farming decisions for the current weather.

Think like a real agricultural officer.

Consider:

• Irrigation scheduling
• Water management
• Fertilizer application
• Pest management
• Disease prevention
• Fungal infection risk
• Weed management
• Spraying conditions
• Harvesting precautions
• Soil moisture management
• Heat stress or cold stress
• Wind damage
• Crop monitoring

just give 5 advise not more then that according to the weather and above considaration.
Return ONLY valid JSON.

Do NOT use markdown.

Do NOT write any explanation outside JSON.

Do NOT wrap JSON inside ```json.

Return exactly in this format:

{{
    "advisory":[
        "...",
        "...",
        "..."
    ],

    "diseaseRisk":{{
        "level":"LOW/MEDIUM/HIGH",
        "reason":"..."
    }},

    "alerts":[
        "...",
        "..."
    ]
}}
"""




    response = groq_client.chat.completions.create(

        model="llama-3.3-70b-versatile",

        messages=[
            {
                "role": "system",
                "content": "You are an expert agriculture advisor. Always return valid JSON only."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],

        temperature=0.3

    )

    text = response.choices[0].message.content.strip()

    if text.startswith("```json"):
        text = text.replace("```json", "").replace("```", "").strip()

    elif text.startswith("```"):
        text = text.replace("```", "").strip()

    return jsonify(json.loads(text))







@app.route('/speak', methods=['POST'])
def speak():

    data = request.get_json()

    text = data.get("text")
    lang = data.get("lang")

    filename = f"voice_{uuid.uuid4().hex}.mp3"

    filepath = os.path.join("uploadimages", filename)

    tts = gTTS(
        text=text,
        lang=lang
    )

    tts.save(filepath)

    return {
        "audio_url": f"/uploadimages/{filename}"
    }

@app.route('/ask_ai', methods=['POST'])
def ask_ai():

    data = request.get_json()

    language = data.get("language")
    name = data.get("name")
    cause = data.get("cause")
    cure = data.get("cure")

    if language == "bn":
        lang_name = "Bengali"

    elif language == "hi":
        lang_name = "Hindi"

    else:
        lang_name = "English"

    explanation = get_ai_explanation(
        name,
        cause,
        cure,
        lang_name
    )

    return {
        "answer": explanation
    }

def extract_features(image):
    image = tf.keras.utils.load_img(image, target_size=(160, 160))
    feature = tf.keras.utils.img_to_array(image)
    feature = np.array([feature])
    return feature


def model_predict(image):

    img = extract_features(image)

    prediction = model.predict(img)

    index = prediction.argmax()

    data = plant_disease[index]

    name = data["name"]
    cause = data["cause"]
    cure = data["cure"]

    verified, ai_name, ai_cause, ai_cure = verify_prediction(
        image,
        name
    )

    if verified:
        return name, cause, cure

    return ai_name, ai_cause, ai_cure


def verify_prediction(image_path, predicted_name):

    image = PIL.Image.open(image_path)

    prompt = f"""
You are an agriculture expert.

The TensorFlow model predicted:

{predicted_name}

Look carefully at the uploaded leaf.

If the TensorFlow prediction is correct,
return ONLY this JSON:

{{
    "match":"YES"
}}

If the prediction is wrong or you are not confident,
analyze the image yourself and return ONLY this JSON:

{{
    "match":"NO",
    "name":"Disease Name",
    "cause":"Cause",
    "cure":"Treatment"
}}

Return ONLY JSON.
Do not use markdown.
"""

    try:

        response = gemini_model.generate_content([prompt, image])

        text = response.text.strip()

        text = text.replace("```json", "").replace("```", "").strip()

        data = json.loads(text)

        if data["match"] == "YES":
            return True, None, None, None

        return (
            False,
            data.get("name","Unknown Disease"),
            data.get("cause","Not Available"),
            data.get("cure","Not Available")
        )

    except Exception as e:

        print(e)

        return False, "Unknown Disease", "Not Available", "Not Available"
    
def get_ai_explanation(name, cause, cure, language):

    prompt = f"""
You are an agriculture expert.

Explain this plant disease in very simple words for farmers.

Disease Name:
{name}

Cause:
{cause}

Treatment:
{cure}

Rules:

1. Explain in {language}.
2. Use very easy language.
3. Maximum 150 words.
4. Explain:
- What is this disease?
- Why does it happen?
- How can the farmer cure it?
- How can it be prevented?
5. Do not use difficult scientific terms.
6. Do not use markdown.
7. Do not use HTML.
8. Do not use bullet points.
"""

    try:
        response = gemini_model.generate_content(prompt)
        return response.text

    except Exception as e:
        return f"Error: {str(e)}"

ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png"}
def allowed_file(filename):
    return (
        "." in filename and
        filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS
    )


@app.route('/upload/', methods=['POST', 'GET'])
def uploadimage():
    if request.method == "POST":
        # image = request.files['img']

        # filename = f"temp_{uuid.uuid4().hex}_{image.filename}"
        # save_path = os.path.join("uploadimages", filename)
        # image.save(save_path)

        # # Get prediction details
        # name,cause,cure = model_predict(save_path)

        image = request.files["img"]

        if image.filename == "":
            return redirect("/")

        if not allowed_file(image.filename):
            return """
            <script>
                alert("Only JPG, JPEG and PNG images are allowed.");
                window.location.href="/";
            </script>
            """
        
        filename = f"temp_{uuid.uuid4().hex}_{image.filename}"
        save_path = os.path.join("uploadimages", filename)
        image.save(save_path)

        # Get prediction details
        name, cause, cure = model_predict(save_path)

        return render_template(
            "result.html",
            imagepath=f"/uploadimages/{filename}",
            name=name,
            cause=cause,
            cure=cure
        )
    return redirect('/')



print("\nREGISTERED ROUTES ")
for rule in app.url_map.iter_rules():
    print(rule)
print("==\n")

import requests

@app.route("/weather_api")
def weather_api():

    city = request.args.get("city")
    lat = request.args.get("lat")
    lon = request.args.get("lon")

    if city:

        url = (
            "https://api.openweathermap.org/data/2.5/weather"
            f"?q={city}"
            f"&appid={OPENWEATHER_API_KEY}"
            "&units=metric"
        )

    else:

        url = (
            "https://api.openweathermap.org/data/2.5/weather"
            f"?lat={lat}"
            f"&lon={lon}"
            f"&appid={OPENWEATHER_API_KEY}"
            "&units=metric"
        )

    # return jsonify(requests.get(url).json())
    response = requests.get(url)

    print(response.status_code)
    print(response.json())

    return jsonify(response.json())

@app.route("/forecast_api")
def forecast_api():

    lat = request.args.get("lat")
    lon = request.args.get("lon")

    url = (
        "https://api.openweathermap.org/data/2.5/forecast"
        f"?lat={lat}"
        f"&lon={lon}"
        f"&appid={OPENWEATHER_API_KEY}"
        "&units=metric"
    )

    return jsonify(requests.get(url).json())


@app.route("/aqi_api")
def aqi_api():

    lat = request.args.get("lat")
    lon = request.args.get("lon")

    url = (
        "https://api.openweathermap.org/data/2.5/air_pollution"
        f"?lat={lat}"
        f"&lon={lon}"
        f"&appid={OPENWEATHER_API_KEY}"
    )

    return jsonify(requests.get(url).json())

if __name__ == "__main__":
    app.run(debug=True)
