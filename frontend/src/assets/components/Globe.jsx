import React, { useRef, useState } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { TextureLoader } from 'three';

function Sphere() {
  const meshRef = useRef();
  const texture = useLoader(TextureLoader, '/earth_texture.jpg');

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[2, 64, 64]} />
      <meshPhongMaterial 
        map={texture}
        shininess={5}
        specular="#ffffff"
      />
    </mesh>
  );
}

function Marker({ lat, lng, label, onClick }) {
  const [hovered, setHovered] = useState(false);
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (360 - lng) * (Math.PI / 180);
  const radius = 2.02;

  const x = radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);

  return (
    <mesh 
      position={[x, y, z]}
      onClick={() => onClick(label)}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <sphereGeometry args={[0.01, 16, 16]} />
      <meshBasicMaterial color={hovered ? "#ff5555" : "#ff0000"} />
      {hovered && (
        <Html distanceFactor={15}>
          <div className="marker-label">{label}</div>
        </Html>
      )}
    </mesh>
  );
}

export default function Globe() {
  const [selectedArtifact, setSelectedArtifact] = useState(null);

  const markers = [
    { lat: 44.4268, lng: 26.1025, label: 'București' },
    { lat: 51.5074, lng: -0.1278, label: 'Londra' },
  ];

  return (
    <div style={{ 
      height: '100vh', 
      width: '100vw', 
      position: 'fixed',
      top: 0,
      left: 0,
      background: '#000'
    }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        gl={{ antialias: true }}
      >
        <ambientLight intensity={1.2} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        <Sphere />
        
        <OrbitControls 
          enableZoom={true}
          minDistance={3}
          maxDistance={8}
          enablePan={false}
        />
        
        {markers.map((marker, index) => (
          <Marker
            key={index}
            {...marker}
            onClick={(label) => setSelectedArtifact(label)}
          />
        ))}
      </Canvas>

      {selectedArtifact && (
        <div 
          className="artifact-popup"
          onClick={() => setSelectedArtifact(null)}
        >
          <h3>{selectedArtifact}</h3>
          <p>Detalii despre artefact...</p>
        </div>
      )}
    </div>
  );
}