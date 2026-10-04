// @ts-nocheck -- ported verbatim from the original project
import { Suspense, useEffect, useRef, useState, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Html, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import roomModel from "@/assets/models/RoomOneModel.glb.asset.json";
import { InteractionNodes } from "@/components/game/InteractionNode";
import { RoomPuzzleHUD } from "@/components/game/RoomPuzzleHUD";

const LoadModel = ({ position = [0, 2, 0], rotation = [0, 0, 0] }) => {
  const ModelRef = useRef();
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

  return (
    <group position={position as [number, number, number]} rotation={rotation as [number, number, number]} scale={0.1}>
      <primitive ref={ModelRef} object={scene} />
    </group>
  );
};

function CameraCoordinates({ position }: { position: number[] }) {
  return (
    <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white p-3 rounded-lg font-mono text-sm z-10">
      <div>Player Position:</div>
      <div>X: {position[0].toFixed(2)}</div>
      <div>Y: {position[1].toFixed(2)}</div>
      <div>Z: {position[2].toFixed(2)}</div>
    </div>
  );
}

const FirstPersonControls = ({ onPositionUpdate }: { onPositionUpdate?: (pos: number[]) => void }) => {
  const { camera, gl } = useThree();
  const moveState = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });

  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());

  const boundary = {
    minX: -1.65,
    maxX: 1.52,
    minZ: -1.58,
    maxZ: 1.97,
    y: 3.00
  };

  const [isMouseLooking, setIsMouseLooking] = useState(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });

  const moveSpeed = 0.028;
  const damping = 0.8;
  const mouseSensitivity = 0.002;

  const cameraPosRef = useRef(new THREE.Vector3(0, 3, 0));

  const clampPosition = useCallback((position: THREE.Vector3) => {
    const clampedPosition = position.clone();
    clampedPosition.x = THREE.MathUtils.clamp(clampedPosition.x, boundary.minX, boundary.maxX);
    clampedPosition.z = THREE.MathUtils.clamp(clampedPosition.z, boundary.minZ, boundary.maxZ);
    clampedPosition.y = boundary.y;
    return clampedPosition;
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        moveState.current.forward = true;
        break;
      case 'KeyS':
      case 'ArrowDown':
        moveState.current.backward = true;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        moveState.current.left = true;
        break;
      case 'KeyD':
      case 'ArrowRight':
        moveState.current.right = true;
        break;
    }
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        moveState.current.forward = false;
        break;
      case 'KeyS':
      case 'ArrowDown':
        moveState.current.backward = false;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        moveState.current.left = false;
        break;
      case 'KeyD':
      case 'ArrowRight':
        moveState.current.right = false;
        break;
    }
  }, []);

  const handleMouseDown = useCallback((e: MouseEvent) => {
    if (e.button === 0) {
      setIsMouseLooking(true);
      previousMousePosition.current = { x: e.clientX, y: e.clientY };
      gl.domElement.style.cursor = 'none';
    }
  }, [gl]);

  const handleMouseUp = useCallback((e: MouseEvent) => {
    if (e.button === 0) {
      setIsMouseLooking(false);
      gl.domElement.style.cursor = 'default';
    }
  }, [gl]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isMouseLooking) return;

    const deltaX = e.clientX - previousMousePosition.current.x;
    camera.rotation.y -= deltaX * mouseSensitivity;
    camera.rotation.x = 0;
    camera.rotation.z = 0;

    previousMousePosition.current = { x: e.clientX, y: e.clientY };
  }, [camera, isMouseLooking]);

  const handleMouseLeave = useCallback(() => {
    setIsMouseLooking(false);
    gl.domElement.style.cursor = 'default';
  }, [gl]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    gl.domElement.addEventListener('mousedown', handleMouseDown);
    gl.domElement.addEventListener('mouseup', handleMouseUp);
    gl.domElement.addEventListener('mousemove', handleMouseMove);
    gl.domElement.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      gl.domElement.removeEventListener('mousedown', handleMouseDown);
      gl.domElement.removeEventListener('mouseup', handleMouseUp);
      gl.domElement.removeEventListener('mousemove', handleMouseMove);
      gl.domElement.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleKeyDown, handleKeyUp, handleMouseDown, handleMouseUp, handleMouseMove, handleMouseLeave, gl]);

  useFrame(() => {
    velocity.current.set(0, 0, 0);
    direction.current.set(0, 0, 0);

    if (moveState.current.forward) direction.current.z -= 0.5;
    if (moveState.current.backward) direction.current.z += 0.5;
    if (moveState.current.left) direction.current.x -= 0.5;
    if (moveState.current.right) direction.current.x += 0.5;

    if (direction.current.length() > 0) {
      direction.current.normalize();
    }

    const cameraEuler = new THREE.Euler(0, camera.rotation.y, 0, 'XYZ');
    direction.current.applyEuler(cameraEuler);

    velocity.current.addScaledVector(direction.current, moveSpeed);
    velocity.current.multiplyScalar(damping);

    const tempPosition = cameraPosRef.current.clone().add(velocity.current);
    const clampedPosition = clampPosition(tempPosition);

    cameraPosRef.current.copy(clampedPosition);
    camera.position.copy(clampedPosition);

    const newPosition = [clampedPosition.x, clampedPosition.y, clampedPosition.z];
    if (onPositionUpdate) {
      onPositionUpdate(newPosition);
    }
  });

  return null;
};

const RoomOne = () => {
  const [cameraPosition, setCameraPosition] = useState([0, 3, 0]);

  const handleCameraPositionUpdate = useCallback((newPosition: number[]) => {
    setCameraPosition(newPosition);
  }, []);

  return (
    <div className="h-screen w-screen bg-black relative">
      <CameraCoordinates position={cameraPosition} />

      <Canvas
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 3, 0], fov: 75 }}
      >
        <PerspectiveCamera makeDefault position={[0, 3, 0]} fov={75} near={0.1} far={1000} />

        <ambientLight intensity={0.09} />
        <directionalLight position={[2, 5, 1]} intensity={0.1} color="#8da6ce" castShadow />
        <pointLight position={[0, 3, 0]} intensity={0.2} color="#ffecd6" distance={10} decay={2} />
        <spotLight color="#ff00a6ff" intensity={5} position={[1, -1, 0]} distance={3} decay={2} castShadow />

        <fog attach="fog" args={['#1a2332', 5, 15]} />

        <Suspense fallback={null}>
          <LoadModel position={[0, 2, 0]} rotation={[0, 0, 0]} />
          <InteractionNodes roomKey="verma" />
          <FirstPersonControls onPositionUpdate={handleCameraPositionUpdate} />
        </Suspense>
      </Canvas>
      <RoomPuzzleHUD roomKey="verma" />

      {/* Instructions */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black/80 px-6 py-3 rounded-lg border border-white/20">
        <p className="text-white text-sm font-mono">
          WASD/Arrows: Move • Click + Drag: Look Around
        </p>
      </div>
    </div>
  );
};

export default RoomOne;
