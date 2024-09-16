document.addEventListener("DOMContentLoaded", function() {
    const playButton = document.getElementById("playButton");
    const stopButton = document.getElementById("stopButton");
    const ejectButton = document.getElementById("ejectButton");
    const volumeControl = document.getElementById("volumeControl");
    const fileInput = document.querySelector(".fileInput");
    const fileLabel = document.getElementById("fileLabel");
    const elapsedTimeElement = document.querySelector(".elapsed-time");
    const totalTimeElement = document.querySelector(".total-time");
    const volAmtElement = document.querySelector(".VolAmt");
    const sampleCountElement = document.querySelector(".sampleCount");
    const fftSizeElement = document.getElementById("fftSize"); // New element for FFT size display
    const leftContainer = document.querySelector(".Left");
    const rightContainer = document.querySelector(".Right");

    let audioContext, audioElement, sourceNode, analyserNode, dataArray, bufferLength, frequencyData;
    let isPlaying = false; // Control flag for visualization loop
    let updateInterval; // To control the interval

    // Create the 8x8 grid dynamically for both left and right containers
    createGrid(leftContainer);
    createGrid(rightContainer);

    fileInput.addEventListener("change", function() {
        const file = fileInput.files[0];
        if (file) {
            fileLabel.textContent = file.name;
            const fileURL = URL.createObjectURL(file);
            audioContext = new (window.AudioContext || window.webkitAudioContext)();

            fetch(fileURL)
                .then(response => response.arrayBuffer())
                .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
                .then(audioBuffer => {
                    const totalSamples = audioBuffer.length;
                    sampleCountElement.textContent = `Samples: ${totalSamples}`;

                    // Set up the audio element and nodes for playback
                    audioElement = new Audio(fileURL);
                    sourceNode = audioContext.createMediaElementSource(audioElement);
                    const gainNode = audioContext.createGain();
                    analyserNode = audioContext.createAnalyser();

                    // Configure analyserNode settings
                    analyserNode.fftSize = 2048; // You can adjust this as needed
                    analyserNode.minDecibels = -90;
                    analyserNode.maxDecibels = -20;
                    analyserNode.smoothingTimeConstant = 0.85;

                    // Display FFT settings
                    displayAnalyserSettings(analyserNode);

                    // Connect nodes: source -> analyser -> gain -> destination
                    sourceNode.connect(analyserNode);
                    analyserNode.connect(gainNode);
                    gainNode.connect(audioContext.destination);

                    // Set analyser properties for frequency data
                    bufferLength = analyserNode.frequencyBinCount;
                    dataArray = new Uint8Array(bufferLength);
                    frequencyData = new Float32Array(bufferLength);

                    volumeControl.addEventListener("input", function() {
                        gainNode.gain.value = this.value;
                        volAmtElement.textContent = `${Math.round(this.value * 100)}`;
                    });

                    audioElement.addEventListener('loadedmetadata', function() {
                        const totalTime = formatTime(audioElement.duration);
                        totalTimeElement.textContent = totalTime;
                    });

                    audioElement.addEventListener('timeupdate', function() {
                        const elapsedTime = formatTime(audioElement.currentTime);
                        elapsedTimeElement.textContent = elapsedTime;
                    });

                    playButton.addEventListener("click", function() {
                        if (audioContext.state === 'suspended') {
                            audioContext.resume();
                        }
                        audioElement.play();
                        isPlaying = true;
                        draw();
                    });

                    stopButton.addEventListener("click", function() {
                        audioElement.pause();
                        audioElement.currentTime = 0;
                        isPlaying = false;
                    });

                    ejectButton.addEventListener("click", function() {
                        if (audioElement) {
                            audioElement.pause();
                            audioElement.src = "";
                            audioContext.close();
                            fileLabel.textContent = "File:";
                            elapsedTimeElement.textContent = "00:00";
                            totalTimeElement.textContent = "00:00";
                            volAmtElement.textContent = "";
                            sampleCountElement.textContent = "#";
                            fftSizeElement.textContent = "FFT Size: 2048"; // Reset to default value
                            clearInterval(updateInterval);
                            isPlaying = false;
                            console.log("Audio file ejected and all data reset.");
                        }
                    });

                    // Start interval to update containers only when audio is loaded
                    clearInterval(updateInterval);
                    updateInterval = setInterval(updateGrid, 1000);
                })
                .catch(error => console.error('Error decoding audio data:', error));
        }
    });

    function displayAnalyserSettings(analyserNode) {
        // Display FFT settings in the toolbar
        fftSizeElement.textContent = analyserNode.fftSize;
        console.log("FFT Size:", analyserNode.fftSize);
        console.log("Frequency Bin Count:", analyserNode.frequencyBinCount);
        console.log("Min Decibels:", analyserNode.minDecibels);
        console.log("Max Decibels:", analyserNode.maxDecibels);
        console.log("Smoothing Time Constant:", analyserNode.smoothingTimeConstant);
    }

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    }

    function draw() {
        if (!isPlaying) return;

        requestAnimationFrame(draw);
        if (analyserNode) {
            analyserNode.getByteFrequencyData(dataArray);
            updateGrid();
        }
    }

    function createGrid(container) {
        for (let i = 0; i < 8; i++) { // Changed to create an 8x8 grid
            for (let j = 0; j < 8; j++) {
                const cell = document.createElement('div');
                cell.className = 'gridCell';
                cell.style.width = '12.5%'; // Adjusted for 8 cells per row
                cell.style.height = '12.5%'; // Adjusted for 8 cells per column
                cell.style.float = 'left';
                cell.style.border = '1px solid #333';
                cell.style.boxSizing = 'border-box';
                cell.style.textAlign = 'center';
                cell.style.fontSize = '10px';
                container.appendChild(cell);
            }
        }
    }

    function updateGrid() {
        if (!dataArray) return; // Ensure data array is initialized
    
        const leftCells = leftContainer.querySelectorAll('.gridCell');
        const rightCells = rightContainer.querySelectorAll('.gridCell');
    
        // Update left grid with 64 bins
        leftCells.forEach((cell, index) => {
            if (index < 64) { // Ensure we stay within bounds
                const bin = Math.floor(index * (bufferLength / 64));
                const intensity = dataArray[bin];
                cell.textContent = intensity;
            }
        });
    
        // Update right grid with the next 64 bins
        rightCells.forEach((cell, index) => {
            if (index < 64) { // Ensure we stay within bounds
                const bin = Math.floor((index + 64) * (bufferLength / 64));
                const intensity = dataArray[bin];
                cell.textContent = intensity;
            }
        });
    }

    console.log("Page is loaded and script is running.");
});
