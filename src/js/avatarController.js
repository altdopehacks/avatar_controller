import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { VRM, VRMUtils } from '@pixiv/three-vrm';

export class AvatarController {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.vrm = null;
    this.clock = new THREE.Clock();
    
    this.light = null;
    
    this.canvas = null;
  }
  
  async initScene(canvas) {
    this.canvas = canvas;
    
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf5f5f5);
    
    this.camera = new THREE.PerspectiveCamera(
      30,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      20
    );
    this.camera.position.set(0, 1.3, 1.5);
    
    this.renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.set(0, 1, 0);
    this.controls.screenSpacePanning = true;
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(0, 1, -2);
    this.scene.add(directionalLight);
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);
    
    const gridHelper = new THREE.GridHelper(10, 10);
    this.scene.add(gridHelper);
    
    window.addEventListener('resize', this.onWindowResize.bind(this));
    
    this.onWindowResize();
  }
  
  onWindowResize() {
    if (!this.canvas || !this.camera || !this.renderer) return;
    
    this.camera.aspect = this.canvas.clientWidth / this.canvas.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
  }
  
  async loadVRM(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const loader = new GLTFLoader();
      
      loader.load(
        url,
        (gltf) => {
          VRM.from(gltf).then((vrm) => {
            if (this.vrm) {
              this.scene.remove(this.vrm.scene);
              VRMUtils.deepDispose(this.vrm.scene);
            }
            
            this.vrm = vrm;
            this.scene.add(this.vrm.scene);
            
            this.vrm.scene.rotation.y = Math.PI;
            
            this.camera.position.set(0, 1.3, 1.5);
            this.controls.target.set(0, 1, 0);
            this.controls.update();
            
            resolve(vrm);
          });
        },
        (progress) => {
          console.log('Loading VRM model...', (progress.loaded / progress.total) * 100, '%');
        },
        (error) => {
          console.error('Error loading VRM model:', error);
          reject(error);
        }
      );
    });
  }
  
  updatePose(rigData) {
    if (!this.vrm) return;
    
    const { Head, Spine, LeftArm, RightArm, LeftHand, RightHand, LeftLeg, RightLeg } = rigData;
    
    if (Head) {
      const head = this.vrm.humanoid.getNormalizedBoneNode('head');
      if (head) {
        head.rotation.set(Head.x, Head.y, Head.z);
      }
    }
    
    if (Spine) {
      const spine = this.vrm.humanoid.getNormalizedBoneNode('spine');
      if (spine) {
        spine.rotation.set(Spine.x, Spine.y, Spine.z);
      }
    }
    
    if (LeftArm) {
      const leftUpperArm = this.vrm.humanoid.getNormalizedBoneNode('leftUpperArm');
      if (leftUpperArm) {
        leftUpperArm.rotation.set(LeftArm.x, LeftArm.y, LeftArm.z);
      }
      
      const leftLowerArm = this.vrm.humanoid.getNormalizedBoneNode('leftLowerArm');
      if (leftLowerArm && LeftArm.forearm) {
        leftLowerArm.rotation.set(LeftArm.forearm.x, LeftArm.forearm.y, LeftArm.forearm.z);
      }
    }
    
    if (RightArm) {
      const rightUpperArm = this.vrm.humanoid.getNormalizedBoneNode('rightUpperArm');
      if (rightUpperArm) {
        rightUpperArm.rotation.set(RightArm.x, RightArm.y, RightArm.z);
      }
      
      const rightLowerArm = this.vrm.humanoid.getNormalizedBoneNode('rightLowerArm');
      if (rightLowerArm && RightArm.forearm) {
        rightLowerArm.rotation.set(RightArm.forearm.x, RightArm.forearm.y, RightArm.forearm.z);
      }
    }
    
    if (LeftHand) {
      const leftHand = this.vrm.humanoid.getNormalizedBoneNode('leftHand');
      if (leftHand) {
        leftHand.rotation.set(LeftHand.x, LeftHand.y, LeftHand.z);
      }
    }
    
    if (RightHand) {
      const rightHand = this.vrm.humanoid.getNormalizedBoneNode('rightHand');
      if (rightHand) {
        rightHand.rotation.set(RightHand.x, RightHand.y, RightHand.z);
      }
    }
    
    if (LeftLeg) {
      const leftUpperLeg = this.vrm.humanoid.getNormalizedBoneNode('leftUpperLeg');
      if (leftUpperLeg) {
        leftUpperLeg.rotation.set(LeftLeg.x, LeftLeg.y, LeftLeg.z);
      }
      
      const leftLowerLeg = this.vrm.humanoid.getNormalizedBoneNode('leftLowerLeg');
      if (leftLowerLeg && LeftLeg.knee) {
        leftLowerLeg.rotation.set(LeftLeg.knee.x, LeftLeg.knee.y, LeftLeg.knee.z);
      }
    }
    
    if (RightLeg) {
      const rightUpperLeg = this.vrm.humanoid.getNormalizedBoneNode('rightUpperLeg');
      if (rightUpperLeg) {
        rightUpperLeg.rotation.set(RightLeg.x, RightLeg.y, RightLeg.z);
      }
      
      const rightLowerLeg = this.vrm.humanoid.getNormalizedBoneNode('rightLowerLeg');
      if (rightLowerLeg && RightLeg.knee) {
        rightLowerLeg.rotation.set(RightLeg.knee.x, RightLeg.knee.y, RightLeg.knee.z);
      }
    }
    
    if (rigData.expressions) {
      const expressions = this.vrm.expressionManager;
      if (expressions) {
        if (rigData.expressions.mouth) {
          expressions.setValue('aa', rigData.expressions.mouth.a);
          expressions.setValue('ih', rigData.expressions.mouth.i);
          expressions.setValue('ou', rigData.expressions.mouth.u);
          expressions.setValue('ee', rigData.expressions.mouth.e);
          expressions.setValue('oh', rigData.expressions.mouth.o);
        }
        
        if (rigData.expressions.eye) {
          expressions.setValue('blink', rigData.expressions.eye.blink);
        }
        
        if (rigData.expressions.brow) {
          expressions.setValue('angry', rigData.expressions.brow.angry);
          expressions.setValue('fun', rigData.expressions.brow.fun);
        }
      }
    }
  }
  
  render() {
    if (!this.renderer || !this.scene || !this.camera) return;
    
    if (this.vrm && this.vrm.springBoneManager) {
      this.vrm.springBoneManager.update(this.clock.getDelta());
    }
    
    this.renderer.render(this.scene, this.camera);
  }
}
