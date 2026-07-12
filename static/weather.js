

// DOM Elements


const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");

// Hero Card

const temperature = document.getElementById("temperature");
const weatherCondition = document.getElementById("weatherCondition");
const aqi = document.getElementById("aqi");

// Location Card

const cityName = document.getElementById("cityName");

const sunrise = document.getElementById("sunrise");
const sunset = document.getElementById("sunset");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const visibility = document.getElementById("visibility");
// const uvIndex = document.getElementById("uvIndex");

// Weather Cards

const tempCard = document.getElementById("tempCard");
const humidityCard = document.getElementById("humidityCard");
const rainCard = document.getElementById("rainCard");
const windCard = document.getElementById("windCard");

// Forecast

const dayEls = [
    document.getElementById("day1"),
    document.getElementById("day2"),
    document.getElementById("day3"),
    document.getElementById("day4"),
    document.getElementById("day5"),
    document.getElementById("day6"),
    document.getElementById("day7")
    
];

const iconEls = [
    document.getElementById("icon1"),
    document.getElementById("icon2"),
    document.getElementById("icon3"),
    document.getElementById("icon4"),
    document.getElementById("icon5"),
    document.getElementById("icon6"),
    document.getElementById("icon7")
];

const tempEls = [
    document.getElementById("temp1"),
    document.getElementById("temp2"),
    document.getElementById("temp3"),
    document.getElementById("temp4"),
    document.getElementById("temp5"),
    document.getElementById("temp6"),
    document.getElementById("temp7")
];

// Advisory

const advisoryList = document.getElementById("advisoryList");

// Disease

const riskLevel = document.getElementById("riskLevel");
const riskText = document.getElementById("riskText");

// Alerts

const weatherAlerts = document.getElementById("weatherAlerts");





// Search Button

searchBtn.addEventListener("click", () => {

    const city = cityInput.value.trim();

    if(city===""){

        alert("Please enter a city.");

        return;

    }

    getWeatherByCity(city);

});

// Press Enter

cityInput.addEventListener("keypress",(e)=>{

    if(e.key==="Enter"){

        searchBtn.click();

    }

});

// Detect Current Location

locationBtn.addEventListener("click",()=>{

    getCurrentLocation();

});



// async function getWeatherByCity(city){

//     try{



//         const response = await fetch(
//         `/weather_api?city=${encodeURIComponent(city)}`
//         );

//         if(!response.ok){

//             throw new Error("City not found");

//         }

//         const data = await response.json();

//         updateUI(data);

//     }

//     catch(error){

//         alert(error.message);

//     }

// }

async function getWeatherByCity(city){

    try{

        const response = await fetch(
            `/weather_api?city=${encodeURIComponent(city)}`
        );

        const data = await response.json();
       

        console.log(data);

        if(data.cod && Number(data.cod) !== 200){

            throw new Error(data.message);

        }

        updateUI(data);

    }

    catch(error){

        alert(error.message);

    }

}


function getCurrentLocation(){

    if(!navigator.geolocation){

        alert("Geolocation not supported.");

        return;

    }

    navigator.geolocation.getCurrentPosition(

        async(position)=>{

            const lat=position.coords.latitude;

            const lon=position.coords.longitude;

            console.log("Latitude:", lat);
            console.log("Longitude:", lon);


            const response = await fetch(
            `/weather_api?lat=${lat}&lon=${lon}`
            );

            const data=await response.json();

            updateUI(data);

        },

        ()=>{

            alert("Unable to detect location.");

        }

    );

}

function formatTime(unix){

    return new Date(unix * 1000).toLocaleTimeString([],{
        hour:'2-digit',
        minute:'2-digit'
    });

}

function updateUI(data){

    temperature.textContent = Math.round(data.main.temp) + "°C";
    weatherCondition.textContent = data.weather[0].main;

    cityName.textContent = "📍 " + data.name + ", " + data.sys.country;

    humidity.textContent = "💧 Humidity : " + data.main.humidity + "%";
    wind.textContent = "🌬 Wind : " + data.wind.speed + " km/h";
    visibility.textContent =
        "👁 Visibility : " + (data.visibility / 1000) + " km";

    // uvIndex.textContent = "☀ UV Index : N/A";

    tempCard.textContent = Math.round(data.main.temp) + "°C";
    humidityCard.textContent = data.main.humidity + "%";
    windCard.textContent = data.wind.speed + " km/h";
    rainCard.textContent =
        (data.rain && data.rain["1h"]) ? data.rain["1h"] + "%" : "0%";

    sunrise.textContent = "🌅 Sunrise : " + formatTime(data.sys.sunrise);
    sunset.textContent = "🌇 Sunset : " + formatTime(data.sys.sunset);

    getAQI(data.coord.lat, data.coord.lon);
    getForecast(data.coord.lat, data.coord.lon);

    // generateAdvice(data);
    // updateDiseaseRisk(data);
    // updateAlerts(data);
    getGeminiAdvice(data);

}


async function getAQI(lat, lon) {

    try {


        const response = await fetch(
            `/aqi_api?lat=${lat}&lon=${lon}`
        );

        const data = await response.json();

        const aqiValue = data.list[0].main.aqi;

        let text = "";

        switch (aqiValue) {

            case 1:
                text = "AQI • Good";
                break;

            case 2:
                text = "AQI • Fair";
                break;

            case 3:
                text = "AQI • Moderate";
                break;

            case 4:
                text = "AQI • Poor";
                break;

            case 5:
                text = "AQI • Very Poor";
                break;

            default:
                text = "AQI • Unknown";

        }

        aqi.textContent = text;

    } catch (error) {

        aqi.textContent = "AQI Unavailable";

        console.error(error);

    }

}

function generateAdvice(data){

    advisoryList.innerHTML="";

    const advice=[];

    const temp=data.main.temp;

    const humidity=data.main.humidity;

    const weather=data.weather[0].main;

    const wind=data.wind.speed;

    if(weather==="Rain"){

        advice.push("🌧 Delay irrigation today.");

        advice.push("⚠ Avoid pesticide spraying.");

    }

    if(temp>35){

        advice.push("🥵 Irrigate crops during the evening.");

    }

    if(humidity>80){

        advice.push("🍄 High humidity may increase fungal diseases.");

    }

    if(wind>7){

        advice.push("💨 Avoid fertilizer spraying due to strong wind.");

    }

    if(advice.length===0){

        advice.push("✅ Weather conditions are suitable for farming.");

    }

    advice.forEach(item=>{

        advisoryList.innerHTML+=`<li>${item}</li>`;

    });

}

function updateDiseaseRisk(data){

    const humidity=data.main.humidity;

    const weather=data.weather[0].main;

    if(humidity>85 || weather==="Rain"){

        riskLevel.textContent="HIGH";

        riskLevel.style.color="#ff5252";

        riskText.textContent=
        "High chance of fungal diseases.";

    }

    else if(humidity>65){

        riskLevel.textContent="MEDIUM";

        riskLevel.style.color="#ffc107";

        riskText.textContent=
        "Moderate disease risk. Monitor crops.";

    }

    else{

        riskLevel.textContent="LOW";

        riskLevel.style.color="#5cff9d";

        riskText.textContent=
        "Disease risk is currently low.";

    }

}

function updateAlerts(data){

    weatherAlerts.innerHTML="";

    if(data.weather[0].main==="Rain"){

        weatherAlerts.innerHTML+=
        "<p>🌧 Heavy rainfall expected.</p>";

    }

    if(data.wind.speed>10){

        weatherAlerts.innerHTML+=
        "<p>💨 Strong wind advisory.</p>";

    }

    if(data.main.temp>38){

        weatherAlerts.innerHTML+=
        "<p>🔥 Heatwave conditions.</p>";

    }

    if(weatherAlerts.innerHTML===""){

        weatherAlerts.innerHTML=
        "<p>✅ No weather alerts.</p>";

    }

}

async function getForecast(lat, lon){

    try{


        const response = await fetch(
            `/forecast_api?lat=${lat}&lon=${lon}`
        );

        const data = await response.json();
        console.log(data);

        updateForecast(data);

    }

    catch(error){

        console.log(error);

    }

}

function updateForecast(data){

    let index = 0;

    // Forecast from OpenWeather (5 days)
    for(let i = 7; i < data.list.length && index < 5; i += 8){

        const item = data.list[i];

        const date = new Date(item.dt * 1000);

        // Show Today, Tomorrow, then weekday
        if(index === 0){

            dayEls[index].textContent = "Today";

        }
        else if(index === 1){

            dayEls[index].textContent = "Tomorrow";

        }
        else{

            dayEls[index].textContent =
                date.toLocaleDateString("en-US",{
                    weekday:"short"
                });

        }

        tempEls[index].textContent =
            Math.round(item.main.temp) + "°C";

        iconEls[index].textContent =
            getWeatherEmoji(item.weather[0].main);

        dayEls[index].parentElement.classList.remove("placeholder");

        index++;

    }

    // Remaining two cards
    const remainingDays = ["Sun","Mon"];

    while(index < 7){

        const lastDate = new Date(data.list[data.list.length - 1].dt * 1000);

        lastDate.setDate(lastDate.getDate() + (index - 4));

        dayEls[index].textContent =
            lastDate.toLocaleDateString("en-US",{
                weekday:"short"
            });

        iconEls[index].textContent = "🔒";

        tempEls[index].textContent = "--";

        dayEls[index].parentElement.classList.add("placeholder");

        index++;

    }

}

function getWeatherEmoji(weather){

    switch(weather){

        case "Clear":

            return "☀️";

        case "Clouds":

            return "☁️";

        case "Rain":

            return "🌧";

        case "Thunderstorm":

            return "⛈";

        case "Snow":

            return "❄️";

        case "Drizzle":

            return "🌦";

        case "Mist":

        case "Fog":

            return "🌫";

        default:

            return "⛅";

    }

}

async function getGeminiAdvice(weather){

    advisoryList.innerHTML = "<li>Loading advice...</li>";

    riskLevel.textContent = "...";
    riskText.textContent = "Generating prediction...";

    weatherAlerts.innerHTML = "<p>Loading...</p>";

    const response = await fetch("/weather_ai",{

        method:"POST",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify({

            city:weather.name,

            temperature:weather.main.temp,

            humidity:weather.main.humidity,

            wind:weather.wind.speed,

            weather:weather.weather[0].main,

            visibility:weather.visibility,

            rain:

            weather.rain ?
            weather.rain["1h"] || 0 : 0

        })

    });

    const result = await response.json();

    updateGemini(result);

}

function updateGemini(data){

    // AI Advice

    advisoryList.innerHTML="";

    data.advisory.forEach(item=>{

        advisoryList.innerHTML+=`<li>${item}</li>`;

    });

    // Disease Risk

    riskLevel.textContent=data.diseaseRisk.level;

    riskText.textContent=data.diseaseRisk.reason;

    if(data.diseaseRisk.level==="HIGH"){

        riskLevel.style.color="#ff5252";

    }

    else if(data.diseaseRisk.level==="MEDIUM"){

        riskLevel.style.color="#ffc107";

    }

    else{

        riskLevel.style.color="#5cff9d";

    }

    // Alerts

    weatherAlerts.innerHTML="";

    data.alerts.forEach(item=>{

        weatherAlerts.innerHTML+=`<p>${item}</p>`;

    });

}