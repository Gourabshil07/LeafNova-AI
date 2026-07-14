const API_KEY = "16eebc898576f57379b774f365a283a1";


function showLoading(message = "Loading Weather") {

    const loader = document.getElementById("weatherLoader");

    loader.style.display = "flex";

    document.getElementById("loaderTitle").innerText = message;
}

function hideLoading() {

    document.getElementById("weatherLoader").style.display = "none";
}




async function getCurrentLocation() {

    const btn = document.getElementById("weatherBtn");

    btn.innerHTML = "📍 Detecting...";
    btn.disabled = true;

    showLoading("📍 Detecting your location...");

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

                showLoading("☁️ Fetching weather...");

                const response = await fetch(
                    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
                );

                showLoading("🤖 Generating AI farming advice...");
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

                let rainfall = "0 mm";

                if (data.rain) {
                    if (data.rain["1h"] !== undefined) {
                        rainfall = data.rain["1h"] + " mm";
                    }
                else if (data.rain["3h"] !== undefined) {
                    rainfall = data.rain["3h"] + " mm";
                    }
                }

               


                hideLoading();

                btn.innerHTML = "✅ Weather Updated";
                btn.disabled = false;

                document.getElementById("rain").innerText = rainfall;

                // Ask Groq AI for professional farming advice

                const aiResponse = await fetch("/result_weather_ai", {

                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({

                        disease: document.getElementById("diseaseName").innerText,

                        cause: document.getElementById("diseaseCause").innerText,

                        cure: document.getElementById("diseaseCure").innerText,

                        city: data.name,

                        temperature: Math.round(data.main.temp),

                        humidity: data.main.humidity,

                        wind: Math.round(data.wind.speed),

                        weather: data.weather[0].main,

                        visibility: (data.visibility / 1000) + " km",

                        rain: rainfall

                    })

                });

                const result = await aiResponse.json();

                updateWeatherAdvice(result);



                hideLoading();
                btn.innerHTML = "✅ Weather Updated";

            
                btn.disabled = false;

            }
            catch (error) {

                hideLoading();

                console.error("FULL ERROR:", error);

                alert(error.message);

                btn.innerHTML = "📍 Detect My Location →";
                btn.disabled = false;

            }

        },

        () => {
            hideLoading();

            alert("Location permission denied.");

            btn.innerHTML = "📍 Detect My Location →";
            btn.disabled = false;

        }

    );

}


function updateWeatherAdvice(data){

    const box = document.getElementById("weatherAdvice");

    box.innerHTML = "";

    data.advisory.forEach(item => {

        box.innerHTML += `
            <div class="advice-item">
                🌿 ${item}
            </div>
        `;

    });

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