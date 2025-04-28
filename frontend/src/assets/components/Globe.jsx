import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { TextureLoader } from 'three';
import { useAuth } from '../../AuthContext';
import ArtifactChat from './ArtifactChat';

function Sphere() {
  const meshRef = useRef();
  const texture = useLoader(TextureLoader, '/earth_texture.jpg');

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[2, 64, 64]} />
      <meshPhongMaterial map={texture} shininess={5} specular="#ffffff" />
    </mesh>
  );
}

function Marker({ artifact, onClick }) {
  const [hovered, setHovered] = useState(false);
  if (
    !artifact ||
    typeof artifact.latitude === 'undefined' ||
    typeof artifact.longitude === 'undefined'
  ) {
    console.warn("Artefact invalid:", artifact); // <<< Adăugat
    return null;
  }

  // Conversie sigură la float
  const lat = parseFloat(artifact.latitude);
  const lng = parseFloat(artifact.longitude);

  if (isNaN(lat) || isNaN(lng)) {
    console.error("Coordonate invalide:", artifact);
    return null;
  }

  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (360 - lng) * (Math.PI / 180);
  const radius = 2.02;

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
      <sphereGeometry args={[0.01, 16, 16]} />
      <meshBasicMaterial color={hovered ? "#ff5555" : "#ff0000"} />
      {hovered && (
        <Html distanceFactor={15}>
          <div className="marker-label">{artifact.name}</div>
        </Html>
      )}
    </mesh>
  );
}

export default function Globe({refreshKey}) {
  const [selectedArtifact, setSelectedArtifact] = useState(null);
  const [markers, setMarkers] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    fetch('http://localhost:3001/api/artifacts')
      .then((res) => res.json())
      .then((data) => setMarkers(data))
      .catch((err) => console.error("Eroare la fetch:", err));
  }, [refreshKey]);

return (
  <div style={{ 
    height: '100vh', 
    width: '100vw', 
    position: 'fixed',
    top: 0,
    left: 0,
    background: '#000'
  }}>
    <Canvas camera={{ position: [0, 0, 5], fov: 60 }} gl={{ antialias: true }}>
      <ambientLight intensity={1.2} />
      <pointLight position={[10, 10, 10]} intensity={1.5} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />
      
      <Sphere />
      <OrbitControls enableZoom minDistance={3} maxDistance={8} enablePan={false} />
      
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          artifact={marker}
          onClick={setSelectedArtifact}
        />
      ))}
    </Canvas>
    
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
