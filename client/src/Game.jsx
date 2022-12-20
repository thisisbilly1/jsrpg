import { ChatBox } from "./ui/ChatBox"
import { Canvas, useThree } from '@react-three/fiber'
import { useEffect } from "react";
import { OrbitControls } from "three/addons/controls/OrbitControls";
import { AxesHelper } from 'three';
import { Terrain } from "./Terrain";
import { Player } from "./Player";


const CameraController = () => {
  const { camera, gl } = useThree();
  useEffect(
    () => {
      const controls = new OrbitControls(camera, gl.domElement);

      controls.minDistance = 3;
      controls.maxDistance = 20;
      return () => {
        controls.dispose();
      };
    },
    [camera, gl]
  );
  return null;
};



export function Game({ client }) {
  return (
    <>
      <ChatBox client={client} />
      <Canvas>

        <ambientLight />
        <spotLight intensity={0.3} position={[5, 10, 50]} />
        <primitive object={new AxesHelper(10)} />
        <Player client={client} isPlayer>
          <CameraController />
        </Player>
        <Terrain />
      </Canvas>
    </>
  )
}