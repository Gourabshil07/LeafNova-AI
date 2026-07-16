const seasonCards = document.querySelectorAll(".season-card");
const generateBtn = document.querySelector(".generate-btn");

const loadingOverlay = document.getElementById("loadingOverlay");
const loadingText = document.getElementById("loadingText");
const progressFill = document.getElementById("progressFill");
const progressPercent = document.getElementById("progressPercent");


const popup = document.getElementById("customPopup");
const popupTitle = document.getElementById("popupTitle");
const popupMessage = document.getElementById("popupMessage");
const popupBtn = document.getElementById("popupBtn");
const popupIcon = document.getElementById("popupIcon");


let loadingInterval;

function showLoading() {

    loadingOverlay.classList.add("active");

    let progress = 0;

    progressFill.style.width = "0%";
    progressPercent.textContent = "0%";

    const messages = [
        "Analyzing Plant...",
        "Checking Growing Conditions...",
        "Preparing Cultivation Guide...",
        "Optimizing Recommendations...",
        "Almost Ready..."
    ];

    let messageIndex = 0;

    loadingText.textContent = messages[0];

    loadingInterval = setInterval(() => {

        if (progress < 90) {

            progress += 2;

            progressFill.style.width = progress + "%";
            progressPercent.textContent = progress + "%";

        }

        if (progress % 20 === 0 && messageIndex < messages.length - 1) {

            messageIndex++;

            loadingText.textContent = messages[messageIndex];

        }

    }, 120);

}

// function hideLoading() {

//     loadingOverlay.classList.remove("active");

// }

function hideLoading() {

    clearInterval(loadingInterval);

    progressFill.style.width = "100%";
    progressPercent.textContent = "100%";
    loadingText.textContent = "Guide Ready ✓";

    setTimeout(() => {

        loadingOverlay.classList.remove("active");

    }, 500);

}

let selectedSeason = "";

// -------------------------------
// Season Selection
// -------------------------------

seasonCards.forEach(card => {

    card.addEventListener("click", () => {

        seasonCards.forEach(c => c.classList.remove("active"));

        card.classList.add("active");

        selectedSeason = card.dataset.season;

    });

});




// -------------------------------
// Generate Guide
// -------------------------------

generateBtn.addEventListener("click", generateGuide);

async function generateGuide() {

    const plant = document.getElementById("plantName").value.trim();

    if (plant === "") {

        showPopup(
            "Plant Required",
            "Please enter a plant name before generating the cultivation guide."
        );

        return;

    }

    if (selectedSeason === "") {

        showPopup(
            "Season Required",
            "Please choose the growing season to generate an accurate AI cultivation guide."
        );

        return;

    }

    try {

        generateBtn.disabled = true;
        generateBtn.innerHTML = "Generating Guide...";
        showLoading();

        await new Promise(resolve => setTimeout(resolve, 100));

        // const response = await fetch("/generate_guide", {

        //     method: "POST",

        //     headers: {
        //         "Content-Type": "application/json"
        //     },

        //     body: JSON.stringify({

        //         plant,
        //         season: selectedSeason

        //     })

        // });

        const response = await fetch("/generate_guide", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                plant,
                season: selectedSeason
            })
        });

        // const data = await response.json();

        // if (!data.success) {

        //     showPopup("Generation Failed", data.message);

        //     return;

        // }
        const data = await response.json();
        

        if (!response.ok || !data.success) {

            hideLoading();

            showPopup(
                "Generation Failed",
                data.message || "Unable to generate the plant guide.",
                "warning"
            );

            return;

        }
        console.log(JSON.stringify(data, null, 2));

        updateGuide(data);

    }

    catch(error){

        console.error(error);

        showPopup("Unexpected Error", error.message);

    }

    finally {

        hideLoading();
        generateBtn.disabled = false;
        generateBtn.innerHTML = `
            Generate Growing Guide
            <i class="fa-solid fa-arrow-right"></i>
        `;

    }

}

// function updateGuide(data){

//     document.getElementById("guideResult").style.display = "block";

//     document.getElementById("plantTitle").textContent =
//         data.overview.plant_name + " 🌱";

//     document.getElementById("scientificName").textContent =
//         data.overview.scientific_name;

//     document.getElementById("plantType").textContent =
//         data.overview.plant_type;

//     document.getElementById("growingSeason").textContent =
//         data.overview.growing_season;

//     document.getElementById("difficulty").textContent =
//         data.overview.difficulty;

//     document.getElementById("description").textContent =
//         data.overview.description;

// }

function updateGuide(data) {

    document.querySelector(".guide-placeholder").style.display = "none";
    document.getElementById("guideResult").style.display = "block";

    // Prevent crashes if AI misses any object
    data.soil = data.soil || {};
    data.climate = data.climate || {};
    data.watering = data.watering || {};
    data.fertilizer = data.fertilizer || {};
    data.harvest = data.harvest || {};

    data.pest_disease = data.pest_disease || [];
    data.maintenance = data.maintenance || [];
    data.weekly_care = data.weekly_care || [];
    data.growth_timeline = data.growth_timeline || [];
    data.common_mistakes = data.common_mistakes || [];
    data.pro_tips = data.pro_tips || [];

    // Header
    // document.getElementById("plantTitle").textContent =
    //     data.plant + " 🌱";



    // document.getElementById("scientificName").textContent =
    //     data.scientific_name;

    // document.getElementById("plantType").textContent =
    //     data.plant_type;

    // document.getElementById("growingSeason").textContent =
    //     data.growing_season;

    // document.getElementById("difficulty").textContent =
    //     data.difficulty;

    // document.getElementById("description").textContent =
    //     data.overview;

    document.getElementById("plantTitle").textContent =
    (data.plant || "Unknown Plant") + " 🌱";

    document.getElementById("scientificName").textContent =
        data.scientific_name || "-";

    document.getElementById("plantType").textContent =
        data.plant_type || "-";

    document.getElementById("growingSeason").textContent =
        data.growing_season || "-";

    document.getElementById("difficulty").textContent =
        data.difficulty || "-";

    document.getElementById("description").textContent =
        data.overview || "No overview available.";


    // ==========================
    // Soil
    // ==========================

    document.getElementById("bestSoil").textContent =
         data.soil.best_soil || "-";

    document.getElementById("soilPH").textContent =
        data.soil.soil_ph || "-";

    document.getElementById("organicMatter").textContent =
       data.soil.organic_matter || "-";

    document.getElementById("soilPreparation").textContent =
         data.soil.preparation || "-";

    // ==========================
    // Climate
    // ==========================

    document.getElementById("temperature").textContent =
        data.climate.temperature || "-";

    document.getElementById("humidity").textContent =
         data.climate.humidity || "-";


    document.getElementById("sunlight").textContent =
        data.climate.sunlight || "-";

    // ==========================
    // Watering
    // ==========================

    document.getElementById("wateringFrequency").textContent =
         data.watering.frequency || "-";


    document.getElementById("wateringMethod").textContent =
        data.watering.method || "-";


    document.getElementById("wateringTips").textContent =
        data.watering.tips || "-";

    // ==========================
    // Fertilizer
    // ==========================

    document.getElementById("fertilizerType").textContent =
        data.fertilizer.type || "-"

    document.getElementById("fertilizerSchedule").textContent =
        data.fertilizer.schedule || "-";

    document.getElementById("fertilizerQuantity").textContent =
        data.fertilizer.quantity || "-";

    // ==========================
    // Lists
    // ==========================

    fillList("pestList", data.pest_disease);
    fillList("maintenanceList", data.maintenance);
    fillList("weeklyCareList", data.weekly_care);
    fillList("timelineList", data.growth_timeline);
    fillList("mistakesList", data.common_mistakes);
    fillList("tipsList", data.pro_tips);

    // ==========================
    // Harvest
    // ==========================

    document.getElementById("harvestTime").textContent =
        data.harvest.harvest_time || "-";

    document.getElementById("harvestSigns").textContent =
        data.harvest.signs || "-";

    document.getElementById("storageTips").textContent =
        data.harvest.storage || "-";

}

function fillList(id, items) {

    console.log(id, items);

    const ul = document.getElementById(id);

    ul.innerHTML = "";

    if (!Array.isArray(items)) {

        console.error(id + " is NOT an array");

        console.log(items);

        return;

    }

    items.forEach(item => {

        const li = document.createElement("li");

        li.textContent = item?.text || "-";

        ul.appendChild(li);

    });

}

function updateMaintenance(items){

    const list = document.getElementById("maintenanceList");

    list.innerHTML = "";

    items.forEach(item=>{

        list.innerHTML += `
            <li>
                <i class="fa-solid fa-circle-check"></i>
                ${item}
            </li>
        `;

    });

}

function showPopup(title, message, type = "warning") {

    popupTitle.textContent = title;
    popupMessage.textContent = message;

    if(type === "warning"){

        popupIcon.className =
        "fa-solid fa-circle-exclamation";

        popupIcon.style.color = "#ffb347";

    }

    if(type === "success"){

        popupIcon.className =
        "fa-solid fa-circle-check";

        popupIcon.style.color = "#38ef7d";

    }

    popup.classList.add("active");

}

popupBtn.onclick = () => {

    popup.classList.remove("active");

};

// =============================
// Mobile Menu
// =============================

const menuBtn = document.getElementById("menuBtn");
const mobileMenu = document.getElementById("mobileMenu");
const closeMenu = document.getElementById("closeMenu");

menuBtn.addEventListener("click", () => {

    mobileMenu.classList.add("active");

});

closeMenu.addEventListener("click", () => {

    mobileMenu.classList.remove("active");

});