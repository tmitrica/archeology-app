import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { TextureLoader } from 'three';
import { useAuth } from '../../AuthContext';
import ArtifactChat from './ArtifactChat';

// 3D Sphere component representing Earth
function Sphere() {
  const meshRef = useRef(); // Reference to mesh object for potential future interactions
  const texture = useLoader(TextureLoader, '/earth_texture.jpg'); // Load Earth texture

  return (
    <mesh ref={meshRef}>
      {/* Sphere geometry with radius 2 and high polygon count for smooth appearance */}
      <sphereGeometry args={[2, 64, 64]} />
      {/* Material with loaded texture and specular highlights */}
      <meshPhongMaterial 
        map={texture} 
        shininess={5} // Controls specular highlight size
        specular="#ffffff" // White specular color
      />
    </mesh>
  );
}

// Marker component for artifact locations
function Marker({ artifact, onClick }) {
  const [hovered, setHovered] = useState(false);
  
  // Safety checks for invalid artifacts
  if (!artifact || typeof artifact.latitude === 'undefined' || typeof artifact.longitude === 'undefined') {
    console.warn("Invalid artifact:", artifact);
    return null;
  }

  // Coordinate validation
  const lat = parseFloat(artifact.latitude);
  const lng = parseFloat(artifact.longitude);
  if (isNaN(lat) || isNaN(lng)) {
    console.error("Invalid coordinates:", artifact);
    return null;
  }

  // Convert geographic coordinates to 3D space
  const phi = (90 - lat) * (Math.PI / 180); // Polar angle conversion
  const theta = (360 - lng) * (Math.PI / 180); // Azimuthal angle conversion
  const radius = 2.02; // Slightly larger than Earth radius for marker placement

  // Cartesian coordinates calculation
  const x = radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);

  return (
    <mesh 
      position={[x, y, z]}
      onClick={() => onClick(artifact)}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Small sphere geometry for marker visualization */}
      <sphereGeometry args={[0.01, 16, 16]} />
      {/* Color changes on hover */}
      <meshBasicMaterial color={hovered ? "#ff5555" : "#ff0000"} />
      
      {/* HTML label displayed on hover */}
      {hovered && (
        <Html distanceFactor={15}> {/* Scaling factor for label size relative to camera */}
          <div className="marker-label">{artifact.name}</div>
        </Html>
      )}
    </mesh>
  );
}

// Main Globe component
export default function Globe({ refreshKey }) {
  const [selectedArtifact, setSelectedArtifact] = useState(null);
  const [markers, setMarkers] = useState([]);
  const { user } = useAuth();

  // Fetch artifacts when refreshKey changes
  useEffect(() => {
    fetch('http://localhost:3001/api/artifacts')
      .then((res) => res.json())
      .then((data) => setMarkers(data))
      .catch((err) => console.error("Fetch error:", err));
  }, [refreshKey]);

  return (
    <div style={{ 
      height: '100vh', 
      width: '100vw', 
      position: 'fixed',
      background: '#000'
    }}>
      {/* Three.js Canvas setup */}
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }} gl={{ antialias: true }}>
        {/* Lighting configuration */}
        <ambientLight intensity={1.2} /> {/* Base scene lighting */}
        <pointLight position={[10, 10, 10]} intensity={1.5} /> {/* Key light */}
        <pointLight position={[-10, -10, -10]} intensity={0.5} /> {/* Fill light */}
        
        <Sphere />
        {/* Camera controls with constraints */}
        <OrbitControls 
          enableZoom 
          minDistance={3} // Prevent camera from getting too close
          maxDistance={8} // Prevent camera from getting too far
          enablePan={false} // Disable panning movement
        />
        
        {/* Render markers for all artifacts */}
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            artifact={marker}
            onClick={setSelectedArtifact}
          />
        ))}
      </Canvas>

      {/* Artifact description panel (top-left) */}
      {selectedArtifact && (
        <div className="artifact-description">
          <div className="description-header">
            <h3>{selectedArtifact.name}</h3>
            <button onClick={() => setSelectedArtifact(null)} className="close-btn">
              &times;
            </button>
          </div>
          <p>{selectedArtifact.description}</p>
        </div>
      )}

      {/* Chat modal (centered) */}
      {selectedArtifact && (
        <div className="artifact-chat-modal">
          <ArtifactChat 
            artifactId={selectedArtifact.id} 
            onClose={() => setSelectedArtifact(null)}
          />
        </div>
      )}
    </div>
  );  
}