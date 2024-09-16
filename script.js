document.addEventListener("DOMContentLoaded", function() {
    const playButton = document.getElementById("playButton");
    const stopButton = document.getElementById("stopButton");
    const ejectButton = document.getElementById("ejectButton");
    const volumeControl = document.getElementById("volumeControl");
    const fileLabel = document.getElementById("fileLabel");
    const elapsedTimeElement = document.querySelector(".elapsed-time");
    const totalTimeElement = document.querySelector(".total-time");
    const volAmtElement = document.querySelector(".VolAmt");

    let audioContext, audioElement, sourceNode, gainNode;
    let isPlaying = false;
    let playlist = ['assets/NFT1_1.mp3', 'assets/rdx_NEROLI_24_2A.mp3']; // Add your MP3 files here
    let currentTrackIndex = 0;

    function initializeAudio() {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        audioElement = new Audio();
        sourceNode = audioContext.createMediaElementSource(audioElement);
        gainNode = audioContext.createGain();

        sourceNode.connect(gainNode);
        gainNode.connect(audioContext.destination);
    }

    function loadTrack(index) {
        if (index >= 0 && index < playlist.length) {
            audioElement.src = playlist[index];
            fileLabel.textContent = `File: ${playlist[index].split('/').pop()}`;
            currentTrackIndex = index;
            audioElement.load();
        }
    }

    function playTrack() {
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
        audioElement.play();
        isPlaying = true;
    }

    function stopTrack() {
        audioElement.pause();
        audioElement.currentTime = 0;
        isPlaying = false;
    }

    playButton.addEventListener("click", function() {
        if (!audioContext) {
            initializeAudio();
            loadTrack(currentTrackIndex);
        }
        playTrack();
    });

    stopButton.addEventListener("click", stopTrack);

    ejectButton.addEventListener("click", function() {
        stopTrack();
        fileLabel.textContent = "File:";
        elapsedTimeElement.textContent = "00:00";
        totalTimeElement.textContent = "00:00";
        volAmtElement.textContent = "";
    });

    volumeControl.addEventListener("input", function() {
        if (gainNode) {
            gainNode.gain.value = this.value;
            volAmtElement.textContent = `${Math.round(this.value * 100)}`;
        }
    });

    audioElement.addEventListener('loadedmetadata', function() {
        totalTimeElement.textContent = formatTime(audioElement.duration);
    });

    audioElement.addEventListener('timeupdate', function() {
        elapsedTimeElement.textContent = formatTime(audioElement.currentTime);
    });

    audioElement.addEventListener('ended', function() {
        currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
        loadTrack(currentTrackIndex);
        playTrack();
    });

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    }

    console.log("Simplified MP3 Player script is running.");
});