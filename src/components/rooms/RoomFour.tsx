// @ts-nocheck -- ported verbatim from the original project
import { Suspense, useEffect, useRef, useState, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Html, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import roomModel from "@/assets/models/RoomFourModel.glb.asset.json";
import { InteractionNodes } from "@/components/game/InteractionNode";
import { RoomPuzzleHUD } from "@/components/game/RoomPuzzleHUD";

// Camera Debug Component
const CameraDebugOverlay = () => {
  const { camera } = useThree();
  const [cameraInfo, setCameraInfo] = useState({
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 }
  });

  useFrame(() => {
    setCameraInfo({
      position: {
        x: parseFloat(camera.position.x.toFixed(3)),
        y: parseFloat(camera.position.y.toFixed(3)),
        z: parseFloat(camera.position.z.toFixed(3))
      },
      rotation: {
        x: parseFloat(camera.rotation.x.toFixed(3)),
        y: parseFloat(camera.rotation.y.toFixed(3)),
        z: parseFloat(camera.rotation.z.toFixed(3))
      }
    });
  });

  return (
    <Html>
      <div style={{
        position: 'fixed',
        top: '-500px',
        left: '10px',
        background: 'rgba(0, 0, 0, 0.85)',
        color: 'white',
        padding: '15px',
        borderRadius: '8px',
        fontFamily: 'monospace',
        fontSize: '12px',
        zIndex: 1000,
        border: '1px solid rgba(255, 255, 255, 0.3)',
        minWidth: '220px',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '12px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
          paddingBottom: '8px'
        }}>
          <strong style={{ color: '#4FC3F7' }}>CAMERA DEBUG</strong>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#4CAF50',
            animation: 'pulse 1s infinite'
          }}></div>
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <div style={{ color: '#4FC3F7', marginBottom: '5px', fontSize: '11px' }}>POSITION:</div>
          <div>X: <span style={{ color: '#FF9800' }}>{cameraInfo.position.x}</span></div>
          <div>Y: <span style={{ color: '#FF9800' }}>{cameraInfo.position.y}</span></div>
          <div>Z: <span style={{ color: '#FF9800' }}>{cameraInfo.position.z}</span></div>
        </div>
        
        <div>
          <div style={{ color: '#4FC3F7', marginBottom: '5px', fontSize: '11px' }}>ROTATION:</div>
          <div>X: <span style={{ color: '#69F0AE' }}>{cameraInfo.rotation.x}</span></div>
          <div>Y: <span style={{ color: '#69F0AE' }}>{cameraInfo.rotation.y}</span></div>
          <div>Z: <span style={{ color: '#69F0AE' }}>{cameraInfo.rotation.z}</span></div>
        </div>
      </div>
      <style>
        {`
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
          }
        `}
      </style>
    </Html>
  );
};

const LoadModel = () => {
  const { scene } = useGLTF(roomModel.url);

  useEffect(() => {
    if (scene) {
      scene.traverse((child: any) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
    }
  }, [scene]);

  return <primitive object={scene} position={[0, 2.5, 5]} scale={0.12} />;
};

const FirstPersonControls = () => {
  const { camera, gl } = useThree();
  const moveState = useRef({ forward: false, backward: false, left: false, right: false });
  const [isMouseLooking, setIsMouseLooking] = useState(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });

  const velocity = useRef(new THREE.Vector3());
  // reduced movement speed by 50%
  const moveSpeed = 0.005;
  const mouseSensitivity = 0.002;

  // Define the boundary constraints for RoomFour
  const boundary = useRef({
    minX: -0.401,
    maxX: 0.635,
    minZ: 4.446,
    maxZ: 5.826,
    y: 3 // Fixed Y position
  });

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.code === 'KeyW' || e.code === 'ArrowUp') moveState.current.forward = true;
    if (e.code === 'KeyS' || e.code === 'ArrowDown') moveState.current.backward = true;
    if (e.code === 'KeyA' || e.code === 'ArrowLeft') moveState.current.left = true;
    if (e.code === 'KeyD' || e.code === 'ArrowRight') moveState.current.right = true;
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (e.code === 'KeyW' || e.code === 'ArrowUp') moveState.current.forward = false;
    if (e.code === 'KeyS' || e.code === 'ArrowDown') moveState.current.backward = false;
    if (e.code === 'KeyA' || e.code === 'ArrowLeft') moveState.current.left = false;
    if (e.code === 'KeyD' || e.code === 'ArrowRight') moveState.current.right = false;
  }, []);

  const handleMouseDown = useCallback((e: MouseEvent) => {
    if (e.button === 0) {
      setIsMouseLooking(true);
      previousMousePosition.current = { x: e.clientX, y: e.clientY };
      gl.domElement.style.cursor = 'none';
    }
  }, [gl]);

  const handleMouseUp = useCallback(() => {
    setIsMouseLooking(false);
    gl.domElement.style.cursor = 'default';
  }, [gl]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isMouseLooking) return;
    const deltaX = e.clientX - previousMousePosition.current.x;
    camera.rotation.y -= deltaX * mouseSensitivity;
    camera.rotation.x = 0;
    previousMousePosition.current = { x: e.clientX, y: e.clientY };
  }, [camera, isMouseLooking]);

  // Function to clamp camera position within boundaries
  const clampPosition = useCallback((position: THREE.Vector3) => {
    position.x = THREE.MathUtils.clamp(position.x, boundary.current.minX, boundary.current.maxX);
    position.z = THREE.MathUtils.clamp(position.z, boundary.current.minZ, boundary.current.maxZ);
    position.y = boundary.current.y; // Keep Y fixed at 3
    return position;
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    gl.domElement.addEventListener('mousedown', handleMouseDown);
    gl.domElement.addEventListener('mouseup', handleMouseUp);
    gl.domElement.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      gl.domElement.removeEventListener('mousedown', handleMouseDown);
      gl.domElement.removeEventListener('mouseup', handleMouseUp);
      gl.domElement.removeEventListener('mousemove', handleMouseMove);
    };
  }, [handleKeyDown, handleKeyUp, handleMouseDown, handleMouseUp, handleMouseMove, gl]);

  useFrame(() => {
    velocity.current.set(0, 0, 0);
    const direction = new THREE.Vector3();

    if (moveState.current.forward) direction.z -= 1;
    if (moveState.current.backward) direction.z += 1;
    if (moveState.current.left) direction.x -= 1;
    if (moveState.current.right) direction.x += 1;

    if (direction.length() > 0) direction.normalize();

    const cameraEuler = new THREE.Euler(0, camera.rotation.y, 0);
    direction.applyEuler(cameraEuler);

    velocity.current.addScaledVector(direction, moveSpeed);
    
    // Calculate new position
    const newPosition = camera.position.clone().add(velocity.current);
    
    // Apply boundary constraints
    const clampedPosition = clampPosition(newPosition);
    
    // Set the clamped position
    camera.position.copy(clampedPosition);
  });

  return null;
};

const RoomFour = () => {
  const [showDebug, setShowDebug] = useState(true);

  return (
    <div className="h-screen w-screen bg-black">
      <Canvas camera={{ position: [0, 3, 5], fov: 75 }}>
        <PerspectiveCamera makeDefault position={[0, 3, 5]} fov={75} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
        <pointLight position={[0, 5, 0]} intensity={1} />
        <pointLight position={[5, 3, 5]} intensity={0.5} color="#ffffff" />

        <Suspense fallback={null}>
          <LoadModel />
          <InteractionNodes roomKey="server" />
          <FirstPersonControls />
          {showDebug }
        </Suspense>
      </Canvas>
      <RoomPuzzleHUD roomKey="server" />

      {/* Controls Instructions */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black/80 px-6 py-3 rounded-lg border border-white/20">
        <p className="text-white text-sm font-mono">WASD/Arrows: Move • Click + Drag: Look Around</p>
      </div>

      {/* Debug Toggle Button */}
      {/* <button
        onClick={() => setShowDebug(!showDebug)}
        className="absolute top-4 right-4 bg-black/80 hover:bg-black/90 text-white px-4 py-2 rounded-lg border border-white/20 text-sm font-mono z-50 transition-colors duration-200"
      >
        {showDebug ? 'HIDE DEBUG' : 'SHOW DEBUG'}
      </button> */}

      {/* Initial Camera Position Display */}
      {/* <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-lg border border-white/20 text-sm font-mono">
        Initial Camera: (0, 3, 5)
      </div> */}

      {/* Boundary Information Display */}
      {/* <div className="absolute top-20 left-4 bg-black/80 text-white px-4 py-2 rounded-lg border border-white/20 text-sm font-mono">
        <div>Boundary:</div>
        <div>X: {-0.401} to {0.635}</div>
        <div>Z: {4.446} to {5.826}</div>
        <div>Y: Fixed at 3</div>
      </div> */}
    </div>
  );
};

export default RoomFour;