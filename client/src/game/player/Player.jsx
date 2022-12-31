import { useFrame } from '@react-three/fiber';
import { useRef, Suspense, useState, useContext } from 'react';
import { Model } from './PlayerModel';
import { WorldContext } from '../World';
import { Raycaster, Vector3 } from 'three';


const raycaster = new Raycaster()
const down = new Vector3(0, -1, 0)

function applyTransforms(playerController) {
  const ref = useRef()
  const world = useContext(WorldContext)
  // console.log(world)

  useFrame((_state, delta) => {
    // position
    ref.current?.position.set(...playerController.position)
    // rotation
    ref.current?.rotation.set(0, playerController.rotation, 0)

    // update grounded state for controller (only used for animations)
    if (world) {
      raycaster.set(ref.current.position, down)
      raycaster.firstHitOnly = true
      const res = raycaster.intersectObject(world, true)
      const length = res.length ? res[0].distance : 25
      playerController.grounded = length < 1.6
    }

    // update the player controller
    playerController.update(delta)
  })
  return ref
}

export function Player({ playerController }) {
  // model handlers
  const transforms = applyTransforms(playerController)
  const [state, setState] = useState('walking')
  playerController.setState = setState

  return (
    <group ref={transforms} dispose={null}>
      <Suspense fallback={null}>
        <Model state={state} />
      </Suspense>
    </group>
  )
}