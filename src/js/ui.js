export class UIController {
  constructor(app) {
    this.app = app;
    
    this.elements = {
      poseFileInput: document.getElementById('pose-file'),
      poseUrlInput: document.getElementById('pose-url'),
      loadUrlButton: document.getElementById('load-url'),
      vrmFileInput: document.getElementById('vrm-file'),
      playButton: document.getElementById('play-button'),
      pauseButton: document.getElementById('pause-button'),
      stopButton: document.getElementById('stop-button'),
      seekBar: document.getElementById('seek-bar'),
      currentFrameDisplay: document.getElementById('current-frame'),
      totalFramesDisplay: document.getElementById('total-frames'),
      fpsDisplay: document.getElementById('fps-display'),
      durationDisplay: document.getElementById('duration-display'),
      statusDisplay: document.getElementById('status-display'),
      videoFileInput: document.getElementById('video-file'),
      originalVideo: document.getElementById('original-video')
    };
  }
  
  initEventListeners() {
    this.elements.poseFileInput.addEventListener('change', (event) => {
      if (event.target.files.length > 0) {
        this.app.loadPoseFromFile(event.target.files[0]);
      }
    });
    
    this.elements.loadUrlButton.addEventListener('click', () => {
      const url = this.elements.poseUrlInput.value.trim();
      if (url) {
        this.app.loadPoseFromURL(url);
      } else {
        this.updateStatus('Please enter a valid URL');
      }
    });
    
    this.elements.vrmFileInput.addEventListener('change', (event) => {
      if (event.target.files.length > 0) {
        this.app.loadVRMModel(event.target.files[0]);
      }
    });
    
    this.elements.playButton.addEventListener('click', () => {
      this.app.play();
    });
    
    this.elements.pauseButton.addEventListener('click', () => {
      this.app.pause();
    });
    
    this.elements.stopButton.addEventListener('click', () => {
      this.app.stop();
    });
    
    this.elements.seekBar.addEventListener('input', (event) => {
      const frameIdx = Math.floor(parseInt(event.target.value));
      this.app.seekToFrame(frameIdx);
    });
    
    this.elements.videoFileInput.addEventListener('change', (event) => {
      if (event.target.files.length > 0) {
        const file = event.target.files[0];
        const url = URL.createObjectURL(file);
        this.elements.originalVideo.src = url;
        this.elements.originalVideo.load();
      }
    });
    
    document.addEventListener('keydown', (event) => {
      switch (event.key) {
        case ' ': // Space bar
          if (this.app.isPlaying) {
            this.app.pause();
          } else {
            this.app.play();
          }
          break;
        case 'ArrowLeft': // Left arrow
          this.app.seekToFrame(this.app.currentFrameIdx - 1);
          break;
        case 'ArrowRight': // Right arrow
          this.app.seekToFrame(this.app.currentFrameIdx + 1);
          break;
      }
    });
  }
  
  updateUI(data) {
    if (data.fps) {
      this.elements.fpsDisplay.textContent = data.fps;
    }
    
    if (data.totalFrames) {
      this.elements.totalFramesDisplay.textContent = data.totalFrames;
    }
    
    if (data.duration) {
      this.elements.durationDisplay.textContent = data.duration;
    }
    
    if (data.status) {
      this.updateStatus(data.status);
    }
  }
  
  updateStatus(message) {
    this.elements.statusDisplay.textContent = message;
  }
  
  updateCurrentFrame(frameIdx) {
    this.elements.currentFrameDisplay.textContent = frameIdx;
    this.elements.seekBar.value = frameIdx;
  }
  
  updateSeekBar(min, max) {
    this.elements.seekBar.min = min;
    this.elements.seekBar.max = max - 1;
    this.elements.seekBar.value = 0;
  }
  
  updatePlaybackButtons(isPlaying) {
    this.elements.playButton.disabled = isPlaying;
    this.elements.pauseButton.disabled = !isPlaying;
  }
}
