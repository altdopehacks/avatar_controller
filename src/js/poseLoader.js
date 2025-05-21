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
}
