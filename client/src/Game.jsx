import { ChatBox } from "./ui/ChatBox"
import { Canvas } from '@react-three/fiber'
import { useState } from "react";
// import { Box, OrbitControls } from "@react-three/drei";

function Player({ client }) {
  const [position, setPosition] = useState([0, 0, 0]);
  client.movementHandlers[client.pid] = ({ x, y, z }) => {
    setPosition([x, y, z]);
  }

  return (
    <mesh position={position}>
      <boxGeometry attach="geometry" args={[1, 1, 1]} />
      <meshBasicMaterial attach="material" color="green" />
    </mesh>
  )
}

export function Game({ client }) {
  return (
    <>
      <ChatBox client={client} />
      <Canvas>
        <Player client={client} />
      </Canvas>
    </>
  )
}