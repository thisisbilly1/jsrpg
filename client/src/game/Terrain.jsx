import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { useLoader } from '@react-three/fiber'

export function Terrain() {
  const obj = useLoader(OBJLoader, '/world.obj')
  return <primitive object={obj} />
}