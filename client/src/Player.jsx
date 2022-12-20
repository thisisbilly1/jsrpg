import { useState, useEffect, useRef } from "react";
import networkContants from '../../networkConstants.json';
import useKeyboard from './useKeyboard'
import { useFrame } from '@react-three/fiber'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

const keybinds = ['KeyA', 'KeyD', 'KeyW', 'KeyS', 'Space']

export function Player({ client, isPlayer, children }) {
  const keyboard = useKeyboard()
  const prevKeyBoard = useRef({})

  const [position, setPosition] = useState([0, 0, 0]);

  // set movement handler for client
  client.movementHandlers[client.pid] = ({ x, y, z }) => {
    console.log(x, y, z)
    setPosition([x, y, z]);
  }

  useFrame(() => {
    let shouldUpdate = false;
    for (const key of keybinds) {
      if (keyboard[key] !== prevKeyBoard.current[key]) shouldUpdate = true;
    }
    prevKeyBoard.current = { ...keyboard };
    if (shouldUpdate) {
      console.log('sending');
      client.send({
        id: networkContants.move,
        forward: keyboard['KeyW'],
        back: keyboard['KeyS'],
        left: keyboard['KeyA'],
        right: keyboard['KeyD'],
        jump: keyboard['Space'],
        angle: 0,
      })
    }
  });

  return (
    <mesh position={position}>
      <RoundedBox />
      <meshBasicMaterial color="green" />
      {children}
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