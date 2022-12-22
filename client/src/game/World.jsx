import useKeyboard from './useKeyboard'
import { Player } from "./Player";
import { Terrain } from "./Terrain";
import { CameraController } from './CameraController';
import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import networkConstants from '../../../networkConstants.json';

const keybinds = ['KeyA', 'KeyD', 'KeyW', 'KeyS', 'Space']

export function World({ client }) {
  const keyboard = useKeyboard()
  const prevKeyBoard = useRef({})
  const [cameraAngle, setCameraAngle] = useState(0)
  const [cameraAnglePrev, setCameraAnglePrev] = useState(0)

  useFrame(() => {
    let shouldUpdate = false;
    for (const key of keybinds) {
      if (keyboard[key] !== prevKeyBoard.current[key]) shouldUpdate = true;
      if (keyboard[key] && (cameraAngle !== cameraAnglePrev)) shouldUpdate = true;
    }

    prevKeyBoard.current = { ...keyboard };
    setCameraAnglePrev(cameraAngle)

    if (shouldUpdate) {
      client.send({
        id: networkConstants.move,
        forward: keyboard['KeyW'],
        back: keyboard['KeyS'],
        left: keyboard['KeyA'],
        right: keyboard['KeyD'],
        jump: keyboard['Space'],
        angle: cameraAngle,
      })
    }
  })

  return (
    <>
      <group>
        <Player playerController={client.playerSelf} />
        <CameraController playerController={client.playerSelf} setCameraAngle={setCameraAngle} />
      </group>
      <Terrain />
    </>
  )
}