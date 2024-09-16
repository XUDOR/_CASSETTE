document.addEventListener("DOMContentLoaded", function() {
    const playButton = document.getElementById("playButton");
    const stopButton = document.getElementById("stopButton");
    const ejectButton = document.getElementById("ejectButton");
    const volumeControl = document.getElementById("volumeControl");
    const seekBar = document.getElementById("seekBar");
    const fileLabel = document.getElementById("fileLabel");
    const fileUploadWrapper = document.querySelector(".file-upload-wrapper");
    const elapsedTimeElement = document.querySelector(".elapsed-time");
    const totalTimeElement = document.querySelector(".total-time");
    const volAmtElement = document.querySelector(".VolAmt");

    let audioContext, audioElement, sourceNode, gainNode;
    let isPlaying = false;
    let currentTrackIndex = 0;

    console.log("Initial setup complete");

    // Playlist: Update this array when you add or remove MP3s from your assets folder
    const playlist = [
        'NFT1_1.mp3',
        'rdx_NEROLI_24_2A.mp3'
        // Add more MP3 filenames here
    ];

    console.log("Playlist initialized:", playlist);

    // File upload wrapper click event
    fileUploadWrapper.addEventListener("click", function() {
        console.log("File upload wrapper clicked");
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'audio/*';
        fileInput.click();

        fileInput.onchange = function(e) {
            const file = e.target.files[0];
            if (file) {
                console.log("File selected:", file.name);
                loadFile(file);
            } else {
                console.log("File selection cancelled");
            }
        };
    });

    function loadFile(file) {
        const fileURL = URL.createObjectURL(file);
        if (!audioElement) initializeAudio();
        audioElement.src = fileURL;
        fileLabel.textContent = `File: ${file.name}`;
        audioElement.load();
        console.log("File loaded:", file.name);
    }

    function updateLibraryDisplay() {
        console.log("Updating library display");
        const container = document.querySelector('.container1') || document.createElement('div');
        container.innerHTML = '<h2>LIBRARY</h2><ul id="libraryList"></ul>';
        const libraryList = container.querySelector('#libraryList');
        
        playlist.forEach((file, index) => {
            const li = document.createElement('li');
            li.textContent = file;
            li.addEventListener('click', () => loadTrack(index));
            libraryList.appendChild(li);
        });

        if (!document.querySelector('.container1')) {
            container.className = 'container1';
            document.querySelector('main').appendChild(container);
        }
        console.log("Library display updated");
    }

    function initializeAudio() {
        console.log("Initializing audio");
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        audioElement = new Audio();
        sourceNode = audioContext.createMediaElementSource(audioElement);
        gainNode = audioContext.createGain();

        sourceNode.connect(gainNode);
        gainNode.connect(audioContext.destination);

        audioElement.addEventListener('loadedmetadata', function() {
            console.log("Audio metadata loaded");
            totalTimeElement.textContent = formatTime(audioElement.duration);
            seekBar.max = audioElement.duration;
        });

        audioElement.addEventListener('timeupdate', function() {
            elapsedTimeElement.textContent = formatTime(audioElement.currentTime);
            seekBar.value = audioElement.currentTime;
        });

        audioElement.addEventListener('ended', function() {
            console.log("Track ended");
            currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
            loadTrack(currentTrackIndex);
            playTrack();
        });

        console.log("Audio initialized");
    }

    function loadTrack(index) {
        console.log("Loading track", index);
        if (index >= 0 && index < playlist.length) {
            if (!audioElement) initializeAudio();
            audioElement.src = 'assets/' + playlist[index];
            fileLabel.textContent = `File: ${playlist[index]}`;
            currentTrackIndex = index;
            audioElement.load();
            console.log("Track loaded:", playlist[index]);
        } else {
            console.log("Invalid track index:", index);
        }
    }

    function playTrack() {
        console.log("Playing track");
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
        audioElement.play();
        isPlaying = true;
    }

    function stopTrack() {
        console.log("Stopping track");
        if (audioElement) {
            audioElement.pause();
            audioElement.currentTime = 0;
            isPlaying = false;
        }
    }

    playButton.addEventListener("click", function() {
        console.log("Play button clicked");
        if (!audioElement) {
            loadTrack(currentTrackIndex);
        }
        playTrack();
    });

    stopButton.addEventListener("click", function() {
        console.log("Stop button clicked");
        stopTrack();
    });

    ejectButton.addEventListener("click", function() {
        console.log("Eject button clicked");
        stopTrack();
        fileLabel.textContent = "Click to select a file";
        elapsedTimeElement.textContent = "00:00";
        totalTimeElement.textContent = "00:00";
        volAmtElement.textContent = "";
        seekBar.value = 0;
    });

    volumeControl.addEventListener("input", function() {
        console.log("Volume changed:", this.value);
        if (gainNode) {
            gainNode.gain.value = this.value;
            volAmtElement.textContent = `${Math.round(this.value * 100)}`;
        }
    });

    seekBar.addEventListener("input", function() {
        console.log("Seek bar changed:", this.value);
        if (audioElement) {
            audioElement.currentTime = this.value;
        }
    });

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    }

    // Display the library when the page loads
    updateLibraryDisplay();

    console.log("MP3 Player script setup complete");
});