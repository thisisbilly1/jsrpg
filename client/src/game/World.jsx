import useKeyboard from './useKeyboard'
import { Player } from "./player/Player";
import { Terrain } from "./Terrain";
import { CameraController } from './CameraController';
import { createContext, useRef, useState, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import networkConstants from '../../../networkConstants.json';

const keybinds = ['KeyA', 'KeyD', 'KeyW', 'KeyS', 'Space']

export const WorldContext = createContext()

export function World({ client }) {
  const world = useRef()
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
      <WorldContext.Provider value={world.current}>
        <Suspense fallback={null}>
          <group>
            <Player playerController={client.playerSelf} key={'player-self'} />
            <CameraController playerController={client.playerSelf} setCameraAngle={setCameraAngle} />
          </group>
          {/* other players*/}
          {Object.values(client.playerOthers).map(player => <Player playerController={player} key={`player-other-${player.pid}`} />)}

          {/* npcs*/}
          {Object.values(client.npcs).map(npc => <Player playerController={npc} key={`npc-${npc.npcId}`} />)}
        </Suspense>
        <group ref={world}>
          <Terrain />
        </group>
      </WorldContext.Provider>
    </>
  )
}