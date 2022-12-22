import { useFrame } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';


function usePosition(playerController) {
  const bind = useRef()
  useFrame(() => bind.current.position.set(...playerController.position))
  return bind
}

export function Player({ playerController }) {
  const bind = usePosition(playerController)
  // const [position, setPosition] = useState([0, 0, 0])
  // useFrame(() => {
  //   setPosition(playerController.position)
  //   // setPosition([
  //   //   lerp(position[0], playerController.position[0], 0.1),
  //   //   lerp(position[1], playerController.position[1], 0.1),
  //   //   lerp(position[2], playerController.position[2], 0.1)
  //   // ])
  // })
  return (
    <mesh ref={bind}>
      <RoundedBox />
      <meshBasicMaterial color="green" />
    </mesh>
  )
}

function RoundedBox({
  width = 1,
  height = 2,
  depth = 1,
  color = "green",
}) {
  const geometry = new RoundedBoxGeometry(width, height, depth);
  geometry.translate(0, - 0.5, 0);
  return (
    <mesh
      geometry={geometry}
    >
      <boxGeometry />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}