let controller = null;


let lastScroll = 0;

const navbar = document.querySelector(".navbar");

window.addEventListener("scroll", () => {

    const currentScroll = window.pageYOffset;

    if (currentScroll > lastScroll && currentScroll > 20) {

        // Scroll Down → Hide navbar
        navbar.style.transform = "translate(-50%, -180%)";

    } else {

        // Scroll Up → Show navbar
        navbar.style.transform = "translate(-50%, 0)";

    }

    lastScroll = currentScroll;

});




async function askAI(language){

    // Cancel previous request if still running
    if(controller){
        controller.abort();
    }

    controller = new AbortController();

    const signal = controller.signal;

    const player = document.getElementById("player");

    // Stop current audio immediately
    player.pause();
    player.currentTime = 0;
    player.removeAttribute("src");
    player.load();

    //Hide previous audio player
    player.style.display = "none";

    // Clear previous explanation
    document.getElementById("aiText").innerHTML = "";

    // Show loading message
    document.getElementById("aiBox").style.display = "block";
    document.getElementById("aiText").innerHTML = `
    <div style="text-align:center;">
        <div class="loader"></div>
        <p>Generating AI explanation...</p>
    </div>
    `;
    // Disable buttons
    document.getElementById("bnBtn").disabled = true;
    document.getElementById("hiBtn").disabled = true;

    try{

        //  Gemini Request 
        const response = await fetch("/ask_ai",{

            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            signal: signal,

            body:JSON.stringify({

                language:language,

                name:document.getElementById("diseaseName").innerText,

                cause:document.getElementById("diseaseCause").innerText,

                cure:document.getElementById("diseaseCure").innerText

            })

        });

        const data = await response.json();

        // If this request was cancelled, stop here
        if(signal.aborted) return;

        document.getElementById("aiText").innerHTML =
        data.answer +
        "<br><br><b>🔊 Preparing audio...</b>";

        //Voice Request 
        const voice = await fetch("/speak",{

            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            signal: signal,

            body:JSON.stringify({

                text:data.answer,

                lang:language

            })

        });

        const audio = await voice.json();

        if(signal.aborted) return;

        
        // Remove "Preparing audio..." text
        document.getElementById("aiText").innerHTML = data.answer;

        // Show new audio player
        player.src = audio.audio_url + "?t=" + Date.now();

        player.style.display = "block";

        // Auto play
        await player.play();

    }

    catch(error){

        if(error.name === "AbortError"){
            // Previous request was cancelled intentionally
            return;
        }

        document.getElementById("aiText").innerHTML =
        " Failed to generate explanation.";

        console.log(error);

    }

    finally{

        document.getElementById("bnBtn").disabled = false;
        document.getElementById("hiBtn").disabled = false;

    }

}


const uploadForm = document.querySelector("form");

uploadForm.addEventListener("submit", function(){

    document.getElementById("loadingScreen").style.display="flex";

});



const messages=[

"📤 Uploading leaf image...",

"🧠 AI is analyzing disease...",

"🔬 Comparing with trained model...",

"🤖 Gemini is verifying prediction...",

"💊 Preparing treatment...",

"🌿 Almost Done..."

];

let i=0;

setInterval(()=>{

    const text=document.getElementById("loadingText");

    if(text){

        text.innerHTML=messages[i];

        i=(i+1)%messages.length;

    }

},1200);




const fileInput = document.getElementById("img");

const fileName = document.getElementById("selectedFile");

fileInput.addEventListener("change", function(){

    if(this.files.length){

        fileName.textContent = this.files[0].name;

    }

    else{

        fileName.textContent = "No image selected";

    }

});