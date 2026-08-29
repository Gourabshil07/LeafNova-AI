
# 🌿 LeafNova AI

LeafNova AI is an AI-powered smart gardening assistant that helps users detect plant diseases, understand weather conditions, get planting recommendations, and learn how to properly care for plants.

## 🚀 Live Application

🔗 **Live Demo:** https://leafnova-ai.onrender.com/

---

## ✨ Features

### 🌱 Plant Disease Detection

- Detect plant diseases using uploaded plant images.
- Provides information about the detected disease.
- Provides disease-related cause and cure information.
- Disease detection data is stored in Supabase PostgreSQL.

### 🌦️ Weather-Based Planting Recommendation

LeafNova AI uses weather information to provide intelligent planting recommendations.

It provides:

- Current weather conditions.
- Current temperature and weather information.
- Planting recommendations based on current weather.
- Upcoming **5-day weather forecast**.
- Recommendations based on both current and upcoming weather conditions.

This helps users decide whether the current weather is suitable for planting a particular plant.

### 🌍 Multilingual AI Explanation

LeafNova AI supports explanations in multiple languages.

Users can receive plant disease and gardening information in their preferred language, making the application easier to use for people from different language backgrounds.

### 🔊 Audio Support

AI-generated explanations can also be provided with audio support.

This allows users to listen to the explanation instead of only reading the information.

### 🌿 Plant Guide for New Gardeners

LeafNova AI provides detailed plant guides designed especially for beginners.

The plant guide provides information such as:

- Plant name
- Scientific name
- Plant type
- Difficulty level
- Growing season
- Overview
- Soil requirements
- Soil pH
- Organic matter
- Soil preparation
- Temperature
- Humidity
- Sunlight requirements
- Watering frequency
- Watering method
- Watering tips
- Fertilizer type
- Fertilizer schedule
- Fertilizer quantity
- Pest and disease information
- Plant maintenance
- Weekly care
- Growth timeline
- Common mistakes
- Harvest time
- Harvest signs
- Storage
- Professional gardening tips

### 📅 Season-Based Plant Care

Plant guides provide recommendations based on the selected season.

This helps users understand how plant care and growing requirements can change depending on the season.

### 🧪 Fertilizer Recommendations

LeafNova AI provides fertilizer recommendations as part of the plant-care guide.

Users can get information about:

- Suitable fertilizer type
- Fertilizer schedule
- Recommended quantity

---

## 🗄️ Supabase Database

LeafNova AI uses **Supabase PostgreSQL** for storing application data.

The main tables are:

### `plant_guides`

Stores generated plant-care guides based on:

- Plant
- Season
- AI-generated guide

### `disease_detections`

Stores plant disease detection information.

### `weather_cache`

Stores weather information used by the application to reduce unnecessary repeated weather API requests.

---

## 🤖 AI and APIs

LeafNova AI uses several technologies and external services:

- **Groq AI** — AI-powered plant validation and plant guide generation.
- **OpenWeather API** — Current weather and 5-day weather forecast.
- **Supabase** — PostgreSQL database.
- **Flask** — Backend web framework.
- **Gunicorn** — Production WSGI server.
- **Render** — Cloud deployment.

---

## 🏗️ Application Architecture

```text
                         LeafNova AI
                              │
             ┌────────────────┼────────────────┐
             │                │                │
             ▼                ▼                ▼
      Disease Detection    Weather         Plant Guide
             │                │                │
             │                │                │
             ▼                ▼                ▼
        AI Analysis     Current + 5-Day    AI Generation
                          Forecast
             │                │                │
             └────────────────┼────────────────┘
                              │
                              ▼
                         Supabase
                              │
              ┌───────────────┼───────────────┐
              │               │               │
              ▼               ▼               ▼
       disease_detections  weather_cache  plant_guides
```
