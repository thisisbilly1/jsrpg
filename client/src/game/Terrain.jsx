import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { useLoader } from '@react-three/fiber'
import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast } from 'three-mesh-bvh'
import * as THREE from 'three'
import { useEffect, useRef } from 'react'

THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree
THREE.Mesh.prototype.raycast = acceleratedRaycast

export function Terrain() {
  const obj = useLoader(OBJLoader, '/models/world/world.obj')
  useEffect(() => {
    obj.children[0].geometry.computeBoundsTree()

    return () => {
      if (obj.children[0].geometry.boundsTree) {
        obj.children[0].geometry.disposeBoundsTree()
      }
    }
  }, [])

  return (
    <mesh receiveShadow castShadow>
      <primitive object={obj} />
    </mesh>
  )
}