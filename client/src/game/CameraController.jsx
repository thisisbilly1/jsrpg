import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react';
import { OrbitControls } from "three/addons/controls/OrbitControls";

export function CameraController({ playerController, setCameraAngle }) {
  const { camera, gl } = useThree();
  const controls = useRef();

  useFrame((_state, delta) => {
    // adjust the camera
    camera.position.sub(controls.current.target)
    // controls.current.target.set(
    //   mainPlayerPosition[0],
    //   mainPlayerPosition[1],
    //   mainPlayerPosition[2]
    // )
    // camera.position.set(
    //   camera.position.x + mainPlayerPosition[0],
    //   camera.position.y + mainPlayerPosition[1],
    //   camera.position.z + mainPlayerPosition[2],
    // )
    controls.current.target.set(
      playerController.position[0],
      playerController.position[1],
      playerController.position[2]
    )
    camera.position.set(
      camera.position.x + playerController.position[0],
      camera.position.y + playerController.position[1],
      camera.position.z + playerController.position[2],
    )
    // controls.current.target.copy(playerController.position)
    // camera.position.add(playerController.position)

    setCameraAngle(controls.current.getAzimuthalAngle())
  })
  useEffect(
    () => {
      controls.current = new OrbitControls(camera, gl.domElement);

      controls.current.minDistance = 3;
      controls.current.maxDistance = 20;
      return () => {
        controls.current.dispose();
      };
    },
    [camera, gl]
  );
  return null;
};
