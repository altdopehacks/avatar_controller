import * as THREE from 'three';
import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';
import * as Kalidokit from 'kalidokit';
import { PoseLoader } from './poseLoader.js';
import { AvatarController } from './avatarController.js';
import { UIController } from './ui.js';

class App {
  constructor() {
    this.poseLoader = new PoseLoader();
    this.avatarController = new AvatarController();
    this.uiController = new UIController(this);
    
    this.isPlaying = false;
    this.currentFrameIdx = 0;
    this.rigFrames = [];
    this.fps = 30;
    this.lastFrameTime = null;
    
    this.init();
  }
  
  async init() {
    await this.avatarController.initScene(document.getElementById('avatar-canvas'));
    
    this.uiController.initEventListeners();
    
    window.debugAnimation = (enable = true) => {
      this.debugAnimation = enable;
    };
    
    this.animate();
  }
  
  async loadPoseFromFile(file) {
    try {
      const poseData = await this.poseLoader.loadFromFile(file);
      this.processPoseData(poseData);
    } catch (error) {
      console.error('Error loading pose data from file:', error);
      this.uiController.updateStatus('Error loading pose data');
    }
  }
  
  async loadPoseFromURL(url) {
    try {
      const poseData = await this.poseLoader.loadFromURL(url);
      this.processPoseData(poseData);
    } catch (error) {
      console.error('Error loading pose data from URL:', error);
      this.uiController.updateStatus('Error loading pose data from URL');
    }
  }
  
  processPoseData(poseData) {
    if (!poseData || !poseData.frames || !poseData.fps) {
      console.error('Invalid pose data format:', poseData);
      this.uiController.updateStatus('Invalid pose data format');
      return;
    }
    
    this.fps = poseData.fps;
    console.log('Loaded pose data with fps:', this.fps);
    
    this.frames = poseData.frames;
    console.log('Loaded frames count:', this.frames.length);
    
    this.currentFrameIdx = 0;
    this.lastFrameTime = null; // Reset frame timer
    
    try {
      this.rigFrames = this.frames.map(frame => {
        if (!frame.poseLandmarks || !Array.isArray(frame.poseLandmarks)) {
          throw new Error('Invalid poseLandmarks format');
        }
        
        const validLandmarks3D = frame.poseLandmarks.map((landmark, index) => {
          if (!landmark) {
            return {
              id: index,
              x: 0,
              y: 0,
              z: 0,
              visibility: 0
            };
          }
          
          return {
            id: landmark.id !== undefined ? landmark.id : index,
            x: landmark.x !== undefined ? landmark.x : 0,
            y: landmark.y !== undefined ? landmark.y : 0,
            z: landmark.z !== undefined ? landmark.z : 0,
            visibility: landmark.visibility !== undefined ? landmark.visibility : 1.0
          };
        });
        
        const validLandmarks2D = validLandmarks3D.map(landmark => ({
          id: landmark.id,
          x: landmark.x,
          y: landmark.y,
          visibility: landmark.visibility
        }));
        
        return Kalidokit.Pose.solve(validLandmarks3D, validLandmarks2D);
      });
      
      const duration = this.frames.length / this.fps;
      
      this.uiController.updateUI({
        fps: this.fps,
        totalFrames: this.frames.length,
        duration: duration.toFixed(2),
        status: 'Pose data loaded'
      });
      
      this.uiController.updateSeekBar(0, this.frames.length);
    } catch (error) {
      console.error('Error processing pose data:', error);
      this.uiController.updateStatus('Error processing pose data');
    }
  }
  
  async loadVRMModel(file) {
    try {
      await this.avatarController.loadVRM(file);
      this.uiController.updateStatus('VRM model loaded');
    } catch (error) {
      console.error('Error loading VRM model:', error);
      this.uiController.updateStatus('Error loading VRM model');
    }
  }
  
  play() {
    if (this.rigFrames.length === 0) {
      this.uiController.updateStatus('No pose data loaded');
      return;
    }
    
    console.log('Starting playback with', this.rigFrames.length, 'frames at', this.fps, 'fps');
    this.isPlaying = true;
    this.lastFrameTime = performance.now();
    this.uiController.updatePlaybackButtons(true);
  }
  
  pause() {
    this.isPlaying = false;
    this.lastFrameTime = null;
    this.uiController.updatePlaybackButtons(false);
  }
  
  stop() {
    this.isPlaying = false;
    this.currentFrameIdx = 0;
    this.lastFrameTime = null;
    this.uiController.updatePlaybackButtons(false);
    this.uiController.updateCurrentFrame(0);
    this.syncVideoTime(0);
  }
  
  seekToFrame(frameIdx) {
    if (this.rigFrames.length === 0) return;
    
    this.currentFrameIdx = Math.min(Math.max(0, frameIdx), this.rigFrames.length - 1);
    this.uiController.updateCurrentFrame(this.currentFrameIdx);
    
    if (this.rigFrames[this.currentFrameIdx]) {
      this.avatarController.updatePose(this.rigFrames[this.currentFrameIdx]);
    }
    
    this.syncVideoTime(this.currentFrameIdx / this.fps);
  }
  
  syncVideoTime(time) {
    const video = document.getElementById('original-video');
    if (video && video.readyState >= 2) {
      video.currentTime = time;
    }
  }
  
  animate() {
    requestAnimationFrame(this.animate.bind(this));
    
    const now = performance.now();
    if (!this.lastFrameTime) {
      this.lastFrameTime = now;
    }
    
    const elapsed = now - this.lastFrameTime;
    const fpsInterval = 1000 / this.fps; // Convert fps to ms interval
    
    if (this.isPlaying && this.rigFrames.length > 0 && elapsed > fpsInterval) {
      this.lastFrameTime = now - (elapsed % fpsInterval);
      
      const rig = this.rigFrames[this.currentFrameIdx];
      
      if (rig) {
        this.avatarController.updatePose(rig);
      }
      
      this.uiController.updateCurrentFrame(this.currentFrameIdx);
      
      this.syncVideoTime(this.currentFrameIdx / this.fps);
      
      this.currentFrameIdx = (this.currentFrameIdx + 1) % this.rigFrames.length;
      
      if (this.debugAnimation) {
        console.log('Frame update:', this.currentFrameIdx, 'of', this.rigFrames.length);
      }
    }
    
    this.avatarController.render();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});
