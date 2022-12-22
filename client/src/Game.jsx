import { ChatBox } from "./ui/ChatBox"
import { Canvas } from '@react-three/fiber'
import { World } from "./game/World"

export function Game({ client }) {

  return (
    <>
      <ChatBox client={client} />
      <Canvas>

        <ambientLight />
        <spotLight intensity={0.3} position={[5, 10, 50]} />

        <World client={client} />
      </Canvas>
    </>
  )
}