/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.0.9 ..\public\models\player\player.glb
*/

import React, { useEffect, useRef } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'

function usePreviouos(value) {
  const ref = useRef()
  useEffect(() => {
    ref.current = value
  }, [value])
  return ref.current
}

export function Model({ state }) {
  const group = useRef()
  const { nodes, materials, animations } = useGLTF('/models/player/player.glb')
  const { actions } = useAnimations(animations, group)

  const previousState = usePreviouos(state)

  useEffect(() => {
    // stop previous actions
    actions[previousState]?.stop()
    // play new action
    actions[state]?.play()
  }, [actions, state])

  return (
    <group ref={group} dispose={null}>
      <group rotation={[Math.PI / 2, 0, Math.PI]} scale={0.0015} position={[0, -1.5, 0]}>
        <primitive object={nodes.mixamorigHips} />
        <skinnedMesh name="arml" geometry={nodes.arml.geometry} material={materials['leather.004']} skeleton={nodes.arml.skeleton} />
        <skinnedMesh name="armr" geometry={nodes.armr.geometry} material={materials['leather.004']} skeleton={nodes.armr.skeleton} />
        <skinnedMesh name="body" geometry={nodes.body.geometry} material={materials['leather.004']} skeleton={nodes.body.skeleton} />
        <skinnedMesh name="head" geometry={nodes.head.geometry} material={materials['Skin.004']} skeleton={nodes.head.skeleton} />
        <skinnedMesh name="legl" geometry={nodes.legl.geometry} material={materials['leather.004']} skeleton={nodes.legl.skeleton} />
        <skinnedMesh name="legr" geometry={nodes.legr.geometry} material={materials['leather.004']} skeleton={nodes.legr.skeleton} />
      </group>
    </group>
  )
}

useGLTF.preload('/models/player/player.glb')
