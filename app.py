
from email.mime import image
from flask import Flask, render_template, request, redirect, send_from_directory, jsonify
import numpy as np
import json
import uuid
import tensorflow as tf
import google.generativeai as genai
import PIL.Image
from groq import Groq
import traceback


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
You are a highly experienced agricultural scientist, horticulture expert, and plant care advisor with over 25 years of practical experience.

Your advice is for EVERYONE, including:
- Farmers
- Home gardeners
- People growing flowers, vegetables, fruits, or indoor plants
- Beginners with no knowledge of farming or plant care

Your task is to analyze ONLY the current weather conditions.
Do NOT assume any plant disease.
Do NOT mention diseases unless the weather creates a high risk.


Weather Details

City: {weather['city']}
Temperature: {weather['temperature']} °C
Humidity: {weather['humidity']} %
Wind Speed: {weather['wind']} km/h
Weather Condition: {weather['weather']}
Visibility: {weather['visibility']}
Rainfall Chance: {weather['rain']}

Write advice using simple, friendly English that anyone can understand.
Avoid scientific or technical words whenever possible.

Your recommendations should be applicable to all types of plants, including agricultural crops,
vegetables, fruits, flowers, ornamental plants, medicinal plants, herbs, trees, shrubs, and indoor plants.
Provide practical, easy-to-follow actions that users can take today based only on the current weather conditions.


Focus on:

• Is today's weather suitable for planting or transplanting?
• Should plants be watered today, or should watering be reduced or postponed?
• Is the weather good for outdoor gardening or farming activities?
• Should fertilizer be applied today or should it be delayed?
• Is today a good day to spray pesticides or fungicides, or should spraying be avoided because of rain, strong wind, or high temperature?
• Is there any risk from rain, humidity, heat, cold, or strong wind?
• Does today's weather increase the chance of fungal diseases or pest attacks?
• What can users do today to keep plants healthy and growing well?
• Mention any important precautions or activities that should be avoided today.

Guidelines:
- Use short, clear sentences.
- Keep each recommendation to one or two sentences.
- Give practical advice that users can follow immediately.
- Do not recommend chemicals unless weather conditions are suitable for spraying.
- If the weather is excellent for farming or gardening, clearly mention that.
- If weather conditions are risky, explain why and what users should do instead.
- Make every recommendation easy enough for someone with zero plant knowledge to understand.

Give at least most effective 6-7 most effective advise not more then that.

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



@app.route("/result_weather_ai", methods=["POST"])
def result_weather_ai():

    data = request.json

    prompt = f"""
You are an experienced plant doctor and agricultural expert with over 25 years of practical experience.
Your advice is for EVERYONE, including:
- Farmers
- Home gardeners
- People with little or no knowledge of plants

The plant disease has already been detected by the AI, and current weather information is available.

Plant Disease Information

Disease:
{data["disease"]}

Cause:
{data["cause"]}

Treatment:
{data["cure"]}

Current Weather

City:
{data["city"]}

Temperature:
{data["temperature"]} °C

Humidity:
{data["humidity"]} %

Wind Speed:
{data["wind"]} km/h

Weather:
{data["weather"]}

Visibility:
{data["visibility"]}

Rainfall:
{data["rain"]}

Your task is to give practical advice that combines BOTH:

1. The detected disease.
2. The current weather.

Write advice using simple, everyday English.

Avoid technical or scientific terms whenever possible.
If a technical term is necessary, briefly explain it in simple words.

Provide practical, step-by-step actions that the user can do TODAY to reduce the disease and help the plant recover.

• What should the user do immediately after seeing this disease?
• Should the plant be watered today, or should watering be reduced?
• Should the plant be kept in sunlight or moved to shade?
• Should infected leaves or branches be removed?
• Is it safe to spray fungicide or pesticide today considering the weather?
• Should spraying be avoided because of rain or strong wind?
• How can the disease be prevented from spreading to healthy leaves or nearby plants?
• How can the plant recover faster?
• Are any nutrients or fertilizers recommended now, or should they be avoided?
• Mention any important precautions or mistakes the user should avoid.


Guidelines:
- Keep every recommendation short (1-2 sentences).
- Give only practical advice.
- Never suggest unnecessary chemicals.
- Recommend pesticides or fungicides only if they are appropriate for the detected disease.
- Mention if no chemical treatment is needed.
- If weather conditions make spraying ineffective (rain, strong wind, high temperature), clearly tell the user to wait.
- If the disease is severe, advise consulting a local agricultural expert or plant nursery.
- Make the advice easy enough for someone with zero plant knowledge to understand.

Return ONLY valid JSON.

Do not use markdown.

Format:

{{
    "advisory":[
        "...",
        "...",
        "...",
        "...",
        "..."
    ]
}}
"""

    response = groq_client.chat.completions.create(

        model="llama-3.3-70b-versatile",

        messages=[
            {
                "role":"system",
                "content":"Return only valid JSON."
            },
            {
                "role":"user",
                "content":prompt
            }
        ],

        temperature=0.3

    )

    text = response.choices[0].message.content.strip()

    text = text.replace("```json","").replace("```","").strip()

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


def gemini_image_analysis(image_path):

    print(">>>> GEMINI VISION CALLED <<<<")

    try:

        image = PIL.Image.open(image_path)

        prompt = """
You are a highly experienced agricultural scientist, plant pathologist, and crop protection specialist with over 30 years of practical field experience.

Your task is to analyze ONLY the uploaded plant leaf.

Ignore:
- Background
- Soil
- Pot
- Hands
- Sky
- Shadows
- Any object other than the leaf

Identify the plant disease.

Return ONLY valid JSON.

{
    "name":"",
    "cause":"",
    "cure":""
}

Rules:

1. Disease Name
- Return the complete disease name.
- If the leaf is healthy return "Healthy Leaf".
- If the disease cannot be confidently identified return "Unknown Disease".

2. Cause
Explain:
- Cause
- Disease type
- Spread
- Effect on plant

Use simple English.

3. Cure
Include:
- Remove infected leaves
- Water management
- Air circulation
- Recommended fungicide/insecticide only if necessary
- Organic treatment if available
- Prevention tips

Return ONLY JSON.
Do NOT use Markdown.
"""

        response = gemini_model.generate_content(
            [prompt, image],
            generation_config={
                "temperature": 0
            }
        )

        text = response.text.strip()

        print("=" * 80)
        print(text)
        print("=" * 80)

        if text.startswith("```json"):
            text = text.replace("```json", "").replace("```", "").strip()

        elif text.startswith("```"):
            text = text.replace("```", "").strip()

        data = json.loads(text)

        return (
            data.get("name", "Unknown Disease"),
            data.get("cause", "Not Available"),
            data.get("cure", "Not Available")
        )

    except Exception:

        traceback.print_exc()

        return (
            "Unknown Disease",
            "Not Available",
            "Not Available"
        )

def model_predict(image):

    img = extract_features(image)

    prediction = model.predict(img, verbose=0)

    confidence = float(np.max(prediction)) * 100

    index = np.argmax(prediction)

    data = plant_disease[index]

    name = data["name"]
    cause = data["cause"]
    cure = data["cure"]

    print("=" * 60)
    print(f"TensorFlow Prediction : {name}")
    print(f"Confidence : {confidence:.2f}%")
    print("=" * 60)

    # Background image
    if name == "Background without leaves":
        print("Background detected -> Gemini Vision")
        return gemini_image_analysis(image)

    # Low confidence
    if confidence < 90:
        print("Confidence below 90% -> Gemini Vision")
        return gemini_image_analysis(image)

    print("TensorFlow prediction accepted.")

    return name, cause, cure





def get_ai_explanation(name, cause, cure, language):
    try:

        prompt = f"""
You are an experienced agricultural scientist and plant disease expert.

Explain the following plant disease in {language}.

Disease:
{name}

Cause:
{cause}

Treatment:
{cure}

Requirements:
- Use simple, easy-to-understand language.
- Explain what the disease is.
- Explain why it happens.
- Explain how it spreads (if applicable).
- Explain the treatment.
- Give prevention tips.
- Make the explanation useful for farmers and beginners.
- Keep the response around 180-250 words.
- Do NOT use Markdown.
- Do NOT return JSON.
- Return only plain text.
"""

        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            temperature=0.4,
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert agricultural scientist. Explain plant diseases in simple language."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

        return response.choices[0].message.content.strip()

    except Exception as e:
        print("Groq Explanation Error:", e)
        return "Unable to generate AI explanation at the moment."
    


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


@app.route("/result_weather")
def result_weather():

    lat = request.args.get("lat")
    lon = request.args.get("lon")

    url = (
        f"https://api.openweathermap.org/data/2.5/weather?"
        f"lat={lat}&lon={lon}"
        f"&appid={OPENWEATHER_API_KEY}"
        f"&units=metric"
    )

    response = requests.get(url)

    return jsonify(response.json())

if __name__ == "__main__":
    app.run(debug=True)