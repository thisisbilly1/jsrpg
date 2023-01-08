import { ChatBox } from "./ui/ChatBox"
import { Inventory } from "./ui/Inventory"
import { Canvas } from '@react-three/fiber'
import { World } from "./game/World"
import { Stats, Environment } from '@react-three/drei'
import { Equipment } from "./ui/Equipment"
import { NpcChatBox } from "./ui/NpcChatBox"

export function Game({ client }) {

  return (
    <>
      <ChatBox client={client} />
      <Inventory client={client} />
      <Equipment client={client} />
      <NpcChatBox client={client} />
      <Canvas shadows shadowMap>
        <directionalLight
          intensity={1}
          castShadow={true}
          shadow-bias={-0.00015}
          shadow-radius={4}
          shadow-blur={10}
          shadow-mapSize={[2048, 2048]}
          position={[85.0, 80.0, 70.0]}
          shadow-camera-left={-30}
          shadow-camera-right={30}
          shadow-camera-top={30}
          shadow-camera-bottom={-30}
        />

        <Environment
          files="https://cdn.jsdelivr.net/gh/Sean-Bradley/React-Three-Fiber-Boilerplate@octree/public/img/rustig_koppie_puresky_1k.hdr"
          background
        />

        <World client={client} />
        <Stats />
      </Canvas>
    </>
  )
}