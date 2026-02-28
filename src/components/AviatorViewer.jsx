import React, { Suspense, useEffect, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, useGLTF } from "@react-three/drei";
import * as THREE from "three";

function tuneMaterialForColor(mat) {
  if (!mat) return mat;
  const m = mat.clone();

  // Ensure color is not ignored
  if (m.color) m.color.set("#ffffff");

  // PBR tuning so color shows (esp. if it looks gray/unstyled)
  if (typeof m.metalness === "number") m.metalness = Math.min(m.metalness, 0.25);
  if (typeof m.roughness === "number") m.roughness = Math.max(m.roughness, 0.35);

  // If the GLB uses textures that overpower color, keep them but still allow tint.
  // (If you want pure flat colors, uncomment these 2 lines.)
  // m.map = null;
  // m.emissiveMap = null;

  m.needsUpdate = true;
  return m;
}

function AviatorModel({ options }) {
  const { scene } = useGLTF("/valmontieraviator.glb");

  const DIAL = useMemo(
    () => ({
      "White Roman": "#f6f6f6",
      Ivory: "#efe7d6",
      "Sky Blue": "#86c8ff",
      Black: "#121417",
      Silver: "#d8d8d8",
    }),
    []
  );

  const HANDS = useMemo(
    () => ({
      Blue: "#1e4cff",
      Black: "#1c1c1c",
      "Polished Steel": "#cfd3d6",
      Gold: "#c9a24a",
    }),
    []
  );

  const STRAP = useMemo(
    () => ({
      "Steel Bracelet": "#cfd3d6",
      "Black Leather": "#111111",
      "Navy Leather": "#0a1e3f",
      "Brown Leather": "#5a3a22",
    }),
    []
  );

  useEffect(() => {
  scene.traverse((obj) => {
    if (!obj.isMesh) return;

    // Always clone materials so updates apply reliably
    obj.material = tuneMaterialForColor(obj.material);

    // ===== FRONT GLASS (clear) =====
    if (obj.name === "Cartier_SantosDumont38_case_frontGlass") {
      // Ensure it's a physical material so transmission works
      const base = obj.material;
      const glass =
        base && base.isMeshPhysicalMaterial
          ? base
          : new THREE.MeshPhysicalMaterial();

      glass.color?.set("#ffffff");
      glass.metalness = 0;
      glass.roughness = 0;
      glass.transmission = 1; // clear
      glass.transparent = true;
      glass.opacity = 1;
      glass.thickness = 0.35;
      glass.ior = 1.5;
      glass.clearcoat = 1;
      glass.clearcoatRoughness = 0;

      obj.material = glass;
      obj.material.needsUpdate = true;
    }

    // ===== STAINLESS STEEL CASE =====
    if (
      obj.name === "Cartier_SantosDumont38_case_body" ||
      obj.name === "Cartier_SantosDumont38_case_chrome" ||
      obj.name === "Cartier_SantosDumont38_case_bezel" ||
      obj.name === "Cartier_SantosDumont38_case_bolts" ||
      obj.name === "Cartier_SantosDumont38_case_frontRim" ||
      obj.name === "Cartier_SantosDumont38_case_adjuster" ||
      obj.name === "Cartier_SantosDumont38_case_back_bolts" ||
      obj.name === "Cartier_SantosDumont38_case_back_type00"
    ) {
      if (obj.material?.color) obj.material.color.set("#cfd3d6"); // stainless tone
      if (typeof obj.material.metalness === "number") obj.material.metalness = 0.9;
      if (typeof obj.material.roughness === "number") obj.material.roughness = 0.25;
      obj.material.needsUpdate = true;
      // do not return; let other rules apply if needed
    }
    if (obj.name === "Cartier_SantosDumont38_case_dial") {
      if (obj.material?.map) obj.material.map = null; // important if texture overrides color
      if (obj.material?.color) obj.material.color.set(DIAL[options.dialColor] || "#f6f6f6");
      if (typeof obj.material.metalness === "number") obj.material.metalness = 0.05;
      if (typeof obj.material.roughness === "number") obj.material.roughness = 0.55;
      obj.material.needsUpdate = true;
    }

    // Roman numeral decal / dial print (make sure it stays visible)
    if (obj.name === "Cartier_SantosDumont38_case_dialDecal") {
    // keep it visible
    obj.visible = true;
    // decals often come in with weird transparency/alpha settings
    if (obj.material) {
        obj.material.transparent = true;
        obj.material.opacity = 1;
        obj.material.depthWrite = true;
        obj.material.depthTest = true;

        // prevent it from being fully black due to lighting
        if ("emissive" in obj.material) {
        obj.material.emissive?.set("#111111");
        obj.material.emissiveIntensity = 0.35;
        }

        // keep decal non-metallic so it reads like print
        if (typeof obj.material.metalness === "number") obj.material.metalness = 0.0;
        if (typeof obj.material.roughness === "number") obj.material.roughness = 0.7;

        obj.material.needsUpdate = true;
    }
    }

    // Hands color (hour + minute)
    if (
      obj.name === "Cartier_SantosDumont38_hand_hour" ||
      obj.name === "Cartier_SantosDumont38_hand_minute"
    ) {
      if (obj.material?.color) obj.material.color.set(HANDS[options.handColor] || "#1e4cff");
      // Hands often look best a bit metallic
      if (typeof obj.material.metalness === "number") obj.material.metalness = 0.5;
      if (typeof obj.material.roughness === "number") obj.material.roughness = 0.25;
      obj.material.needsUpdate = true;
    }

    // Strap vs bracelet visibility
    if (obj.name === "Santos_Dumont_Small_Leather") {
      const isLeather = options.strap !== "Steel Bracelet";
      obj.visible = isLeather;

      // Tint leather strap
      if (isLeather && obj.material?.color) {
        obj.material.color.set(STRAP[options.strap] || "#111111");
        if (typeof obj.material.metalness === "number") obj.material.metalness = 0.0;
        if (typeof obj.material.roughness === "number") obj.material.roughness = 0.85;
        obj.material.needsUpdate = true;
      }
    }

    if (obj.name === "Santos_Dumont_Small_Metal") {
      const isMetal = options.strap === "Steel Bracelet";
      obj.visible = isMetal;

      // Slight tint for bracelet (optional)
      if (isMetal && obj.material?.color) {
        obj.material.color.set(STRAP["Steel Bracelet"]);
        if (typeof obj.material.metalness === "number") obj.material.metalness = 0.85;
        if (typeof obj.material.roughness === "number") obj.material.roughness = 0.25;
        obj.material.needsUpdate = true;
      }
    }
  });
}, [scene, options.dialColor, options.handColor, options.strap, DIAL, HANDS, STRAP]);

  return <primitive object={scene} />;
}

export default function AviatorViewer({ options }) {
  const safe =
    options ?? {
      dialColor: "White Roman",
      handColor: "Blue",
      strap: "Steel Bracelet",
    };

  return (
    <div className="h-[420px] w-full overflow-hidden rounded-3xl border border-black/10 bg-white">
      <Canvas camera={{ position: [0, 0.6, 2.2], fov: 40 }}>
        <ambientLight intensity={0.9} />
        <directionalLight position={[3, 3, 3]} intensity={1.3} />
        <Environment preset="city" />
        <Suspense fallback={null}>
          <AviatorModel options={safe} />
        </Suspense>
        <OrbitControls enablePan={false} />
      </Canvas>
    </div>
  );
}