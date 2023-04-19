const playButton = document.getElementById("player-btn-play")
const playIcon = playButton.querySelector(".fa-play")
const pauseIcon = playButton.querySelector(".fa-pause")
const stopButton = document.querySelector(".fa-stop")

const progress = document.querySelector(".player-progress")
const progressFilled = document.querySelector(".player-progress-filled")
const playerCurrentTime = document.querySelector(".player-time-current")
const playerDuration = document.querySelector(".player-time-duration")

let wavesurfer = WaveSurfer.create({
    container: '#waveform',
    waveColor: 'white',
    progressColor: 'blue',
    backend: 'MediaElement',
    hideScrollbar: true,
});
wavesurfer.load('songs/relaxing.mp3');

let canvas = document.getElementById('meter');
const audioElement = document.querySelector("audio")
try {
    const ctx = canvas.getContext("2d");
    const audioCtx = new AudioContext();
    const track = audioCtx.createMediaElementSource(audioElement);
    const analyser = audioCtx.createAnalyser();

    analyser.smoothingTimeConstant = 0.9;
    analyser.fftSize = 1024 * 2;
    canvas.width = window.innerWidth * 0.70;
    canvas.height = window.innerHeight * 0.30;
    track.connect(analyser);
    track.connect(audioCtx.destination);

    function volcano() {
        let barPos, barHeight, barCount, bufferLength;
        window.RequestAnimationFrame =
            window.requestAnimationFrame(volcano) ||
            window.msRequestAnimationFrame(volcano) ||
            window.mozRequestAnimationFrame(volcano) ||
            window.webkitRequestAnimationFrame(volcano);

        bufferLength = new Uint8Array(analyser.frequencyBinCount);
        barCount = window.innerWidth * 0.06;

        analyser.getByteFrequencyData(bufferLength);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // create gradient
        let gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(1, '#00ff0d');
        gradient.addColorStop(0.45, '#ffff00');
        gradient.addColorStop(0.25, '#f69839');
        gradient.addColorStop(0, '#fa0606');

        // set the fill style
        ctx.fillStyle = gradient;

        let x = 0;
        barWidth = 4;
        for (let i = 0; i < barCount; i++) {
            //barPos = i * 4;
            barPos = (canvas.width * 0.5) - x;
            barHeight = -(bufferLength[i]);
            ctx.fillRect(barPos, canvas.height, barWidth, barHeight);
            x += barWidth + 2;
        }

        for (let i = 0; i < barCount; i++) {
            barPos = x;
            barHeight = -(bufferLength[i]);
            ctx.fillRect(barPos, canvas.height, barWidth, barHeight);
            x += barWidth + 2;
        }
    }

    window.addEventListener("load", () => {
        volcano();
        setTimes();

        // audio track update
        audioElement.addEventListener("timeupdate", () => {
            progressUpdate();
            setTimes();
        });

        // Stop button
        stopButton.addEventListener("click", () => {
            audioElement.pause();
            audioElement.currentTime = 0;
            progressFilled.style.flexBasis = "0%";
            if (playButton.dataset.playing === "true") {
                playButton.dataset.playing = "false";
                pauseIcon.classList.add("hidden");
                playIcon.classList.remove("hidden");
            }
        });

        // Play/pause button
        playButton.addEventListener("click", () => {

            // Resume
            if (audioCtx.state === "suspended") {
                audioCtx.resume();
            }

            // Play or pause track depending on state
            if (playButton.dataset.playing === "false") {
                audioElement.play();
                playButton.dataset.playing = "true";
                playIcon.classList.add("hidden");
                pauseIcon.classList.remove("hidden");
            } else if (playButton.dataset.playing === "true") {
                audioElement.pause();
                playButton.dataset.playing = "false";
                pauseIcon.classList.add("hidden");
                playIcon.classList.remove("hidden");
            }
        });

        // Finished audio
        audioElement.addEventListener("ended", () => {
            playButton.dataset.playing = "false";
            pauseIcon.classList.add("hidden");
            playIcon.classList.remove("hidden");
            progressFilled.style.flexBasis = "0%";
            audioElement.currentTime = 0;
        })

        // Display currentTime and duration properties in real-time
        function setTimes() {
            playerCurrentTime.textContent = new Date(audioElement.currentTime * 1000).toISOString().substr(11, 8);
            let endTime = (audioElement.duration * 1000) - (audioElement.currentTime * 1000);
            endTime = endTime ? endTime : 1;
            playerDuration.textContent = new Date(endTime).toISOString().substr(11, 8);
        }

        // Update player timeline progress visually
        function progressUpdate() {
            const percent = (audioElement.currentTime / audioElement.duration) * 100;
            progressFilled.style.flexBasis = `${percent}%`;
        }

        // Jump player timeline to skip forward and back
        let mousedown = false;

        function jump(event) {
            let jumpTime = (event.offsetX / progress.offsetWidth) * audioElement.duration;
            audioElement.currentTime = jumpTime;
        }

        // Jump in progress bar
        progress.addEventListener("click", jump);
        progress.addEventListener("mousemove", (e) => mousedown && jump(e));
        progress.addEventListener("mousedown", () => (mousedown = true));
        progress.addEventListener("mouseup", () => (mousedown = false));
    }, false);

} catch (e) {
    alert("Web Audio API is not supported by this browser");
}

document.getElementById("open-file").onchange = function (evt) {
    let file = evt.target.files[0];
    document.querySelector("audio").setAttribute('src', URL.createObjectURL(file));
    wavesurfer.load(document.querySelector("audio"))
    document.querySelector("audio").load()
    stopButton.dispatchEvent(new Event('click'));
}