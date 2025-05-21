export class PoseLoader {
  constructor() {}
  
  async loadFromFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          let jsonData;
          const text = event.target.result;
          
          const bomStripped = text.replace(/^\uFEFF/, '');
          
          jsonData = JSON.parse(bomStripped);
          resolve(this.validatePoseData(jsonData));
        } catch (error) {
          console.error('JSON parse error:', error);
          reject(new Error(`Invalid JSON format: ${error.message}`));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };
      
      reader.readAsText(file);
    });
  }
  
  async loadFromURL(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const jsonData = await response.json();
      return this.validatePoseData(jsonData);
    } catch (error) {
      throw new Error(`Failed to load from URL: ${error.message}`);
    }
  }
  
  validatePoseData(data) {
    if (Array.isArray(data)) {
      console.log('Detected alternative JSON format (array of arrays)');
      return this.convertArrayFormat(data);
    }
    
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid data format');
    }
    
    if (!data.fps || typeof data.fps !== 'number' || data.fps <= 0) {
      throw new Error('Invalid or missing fps value');
    }
    
    if (!Array.isArray(data.frames) || data.frames.length === 0) {
      throw new Error('Invalid or empty frames array');
    }
    
    const firstFrame = data.frames[0];
    if (!firstFrame || !Array.isArray(firstFrame.poseLandmarks)) {
      throw new Error('Invalid frame structure');
    }
    
    return data;
  }
  
  convertArrayFormat(arrayData) {
    console.log('Converting array format to standard format...');
    
    const validFrames = arrayData.filter(frame => Array.isArray(frame) && frame.length > 0);
    
    if (validFrames.length === 0) {
      throw new Error('No valid frames found in the data');
    }
    
    console.log(`Found ${validFrames.length} valid frames out of ${arrayData.length} total frames`);
    
    const frames = validFrames.map((landmarks, frameIndex) => {
      return {
        timestamp: frameIndex / 30, // Assuming 30 fps
        poseLandmarks: landmarks.map(landmark => {
          return {
            id: landmark.landmark_id !== undefined ? landmark.landmark_id : 0,
            x: landmark.x !== undefined ? landmark.x : 0,
            y: landmark.y !== undefined ? landmark.y : 0,
            z: landmark.z !== undefined ? landmark.z : 0,
            visibility: landmark.visibility !== undefined ? landmark.visibility : 1.0
          };
        })
      };
    });
    
    return {
      fps: 30, // Using default 30 fps since it's not provided in the array format
      frames: frames
    };
  }
}
