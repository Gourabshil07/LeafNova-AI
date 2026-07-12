const API_KEY = "16eebc898576f57379b774f365a283a1";


async function getCurrentLocation() {

    const btn = document.getElementById("weatherBtn");

    btn.innerHTML = "📍 Detecting...";
    btn.disabled = true;

    if (!navigator.geolocation) {
        alert("Geolocation is not supported.");
        btn.innerHTML = "📍 Detect My Location →";
        btn.disabled = false;
        return;
    }

    navigator.geolocation.getCurrentPosition(

        async (position) => {

            try {

                const lat = position.coords.latitude;
                const lon = position.coords.longitude;

                const response = await fetch(
                    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
                );

                const data = await response.json();

                // Update Weather Cards
                document.getElementById("city").innerText =
                    data.name;

                document.getElementById("temp").innerText =
                    Math.round(data.main.temp) + "°C";

                document.getElementById("humidity").innerText =
                    data.main.humidity + "%";

                document.getElementById("wind").innerText =
                    Math.round(data.wind.speed) + " km/h";

                const rain =
                    data.rain && data.rain["1h"]
                        ? data.rain["1h"] + " mm"
                        : "0 mm";

                document.getElementById("rain").innerText = rain;

                // Weather Recommendation (without Gemini)
                let advice = "";

                if (data.main.humidity >= 80) {
                    advice += "High humidity may increase fungal disease. ";
                }

                if (data.main.temp >= 35) {
                    advice += "High temperature can stress crops. ";
                }

                if (data.wind.speed >= 10) {
                    advice += "Strong wind may spread plant diseases. ";
                }

                if (data.rain && data.rain["1h"]) {
                    advice += "Recent rainfall detected. Avoid unnecessary irrigation.";
                }

                if (advice === "") {
                    advice = "Current weather conditions are favorable for crop growth.";
                }

                document.getElementById("weatherAdvice").innerText =
                    advice;

                btn.innerHTML = "✅ Weather Updated";

            }
            catch (error) {

                console.error(error);
                alert("Unable to fetch weather.");

                btn.innerHTML = "📍 Detect My Location →";
                btn.disabled = false;

            }

        },

        () => {

            alert("Location permission denied.");

            btn.innerHTML = "📍 Detect My Location →";
            btn.disabled = false;

        }

    );

}



async function askAI(language, button) {

    const originalText = button.innerHTML;

    button.disabled = true;
    button.innerHTML = "⏳ Loading...";

    document.getElementById("aiBox").style.display = "block";
    document.getElementById("audioContainer").style.display = "block";

    // Show AI box
    // document.getElementById("aiBox").style.display = "block";

    // Show loading text
    document.getElementById("aiText").innerHTML =
        "<b>🤖 Generating explanation...</b>";

    const audioStatus = document.getElementById("audioStatus");

    audioStatus.style.display = "none";
    audioStatus.innerText = "";

    // Audio player
    const player = document.getElementById("player");

    // Stop current audio
    player.pause();
    player.currentTime = 0;

    // Hide player while new audio is generating
    player.style.display = "none";

    // Remove previous source
    player.removeAttribute("src");
    player.load();

    const diseaseName = document.getElementById("diseaseName").innerText;
    const diseaseCause = document.getElementById("diseaseCause").innerText;
    const diseaseCure = document.getElementById("diseaseCure").innerText;

    try {

        // Generate explanation
        const aiResponse = await fetch("/ask_ai", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                language: language,
                name: diseaseName,
                cause: diseaseCause,
                cure: diseaseCure
            })
        });

        const aiData = await aiResponse.json();

        // Show explanation
        // document.getElementById("aiText").innerText = aiData.answer;

        // Show audio loading
        // audioStatus.style.display = "block";
        // audioStatus.innerText = "🎤 Generating audio...";

        // Show explanation
        document.getElementById("aiText").innerText = aiData.answer;

        // Restore button immediately
        button.disabled = false;
        button.innerHTML = originalText;

        // Show audio loading
        audioStatus.style.display = "block";
        audioStatus.innerText = "🎤 Generating audio...";

        // Generate audio
        const voiceResponse = await fetch("/speak", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                text: aiData.answer,
                lang: language
            })
        });

        const voiceData = await voiceResponse.json();

        // Hide loading
        audioStatus.style.display = "none";

        // Load new audio
        player.src = voiceData.audio_url + "?t=" + Date.now();

        player.controls = true;
        player.style.display = "block";

        player.load();

        // User decides when to press Play

    }

catch (error) {

    console.error(error);

    document.getElementById("aiText").innerText =
        "Failed to generate AI explanation.";

    audioStatus.style.display = "none";

    // Restore button on error
    button.disabled = false;
    button.innerHTML = originalText;

}

    finally {

        // button.disabled = false;
        // button.innerHTML = originalText;

    }

}