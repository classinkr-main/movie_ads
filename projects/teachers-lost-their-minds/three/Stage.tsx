import React, { useLayoutEffect } from "react";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Cam, V3 } from "../lib/motion";

/** 장면별 조명·그림자 설정 */
export type Look = {
  ambient: number;
  ambientColor?: string;
  key: number;
  keyColor?: string;
  keyPos?: V3;
  fill?: number;
  fillColor?: string;
  /** 바닥 그림자 진하기 */
  shadow?: number;
  shadowColor?: string;
  /** 그림자 카메라 반경 */
  reach?: number;
};

export const DAY: Look = { ambient: 1.3, key: 2.85, keyColor: "#FFF4E2", keyPos: [5, 10, 6], fill: 0.7, fillColor: "#DDE8FF", shadow: 0.2, shadowColor: "#3A2E1E" };
export const NIGHT: Look = { ambient: 0.75, ambientColor: "#8FA0E8", key: 1.1, keyColor: "#AFC2FF", keyPos: [-4, 9, 5], fill: 0.25, fillColor: "#6A78C8", shadow: 0.32, shadowColor: "#070A1A" };

const applyCam = (camera: THREE.PerspectiveCamera, cam: Cam, aspect: number) => {
  camera.position.set(cam.p[0], cam.p[1], cam.p[2]);
  camera.up.set(0, 1, 0);
  camera.lookAt(cam.t[0], cam.t[1], cam.t[2]);
  if (cam.roll) camera.rotateZ(cam.roll);
  camera.fov = cam.fov;
  camera.aspect = aspect;
  camera.near = 0.1;
  camera.far = 400;
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld(true);
};

// 레이아웃 이펙트에서 카메라를 맞춥니다 — Remotion 의 프레임 advance(패시브 이펙트)보다 먼저 실행됩니다.
const Rig: React.FC<{ cam: Cam; aspect: number }> = ({ cam, aspect }) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  useLayoutEffect(() => {
    applyCam(camera, cam, aspect);
  });
  return null;
};

export const Stage: React.FC<{ cam: Cam; look: Look; width: number; height: number; children: React.ReactNode }> = ({ cam, look, width, height, children }) => {
  const reach = look.reach ?? 11;
  const kp = look.keyPos ?? [5, 10, 6];
  return (
    <ThreeCanvas
      width={width}
      height={height}
      flat
      dpr={1}
      shadows={{ type: THREE.PCFSoftShadowMap }}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
      camera={{ fov: cam.fov, near: 0.1, far: 400, position: cam.p }}
      style={{ position: "absolute", inset: 0 }}
    >
      <Rig cam={cam} aspect={width / height} />
      <ambientLight intensity={look.ambient} color={look.ambientColor ?? "#ffffff"} />
      <directionalLight
        castShadow
        position={kp}
        intensity={look.key}
        color={look.keyColor ?? "#ffffff"}
        shadow-mapSize={[1536, 1536]}
        shadow-bias={-0.0006}
        shadow-normalBias={0.03}
        shadow-radius={5}
        shadow-camera-left={-reach}
        shadow-camera-right={reach}
        shadow-camera-top={reach}
        shadow-camera-bottom={-reach}
        shadow-camera-near={0.5}
        shadow-camera-far={45}
      />
      <directionalLight position={[-6, 4, 3]} intensity={look.fill ?? 0.6} color={look.fillColor ?? "#ffffff"} />
      <directionalLight position={[0, 3, -8]} intensity={(look.fill ?? 0.6) * 0.6} color="#ffffff" />
      {/* 바닥: 색은 HTML 종이 배경이 담당하고, 3D 바닥은 그림자만 받습니다(지평선 없는 무한 호리존트). */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.34, 0]} receiveShadow>
        <planeGeometry args={[300, 300]} />
        <shadowMaterial opacity={look.shadow ?? 0.2} color={look.shadowColor ?? "#3A2E1E"} />
      </mesh>
      {children}
    </ThreeCanvas>
  );
};

/** HTML 오버레이가 3D 좌표를 화면 좌표로 옮길 때 쓰는 투영기. Stage 와 같은 카메라 수식을 씁니다. */
export type Projector = (p: V3) => { x: number; y: number; behind: boolean; depth: number };

const _cam = new THREE.PerspectiveCamera();
const _v = new THREE.Vector3();
export const makeProjector = (cam: Cam, width: number, height: number): Projector => {
  const c = _cam.clone();
  applyCam(c, cam, width / height);
  c.matrixWorldInverse.copy(c.matrixWorld).invert();
  return (p: V3) => {
    _v.set(p[0], p[1], p[2]).project(c);
    return { x: ((_v.x + 1) / 2) * width, y: ((1 - _v.y) / 2) * height, behind: _v.z > 1, depth: _v.z };
  };
};
