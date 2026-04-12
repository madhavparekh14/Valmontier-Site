import React, { Suspense, useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, useGLTF } from "@react-three/drei";
import * as THREE from "three";

function AviatorModel({ options }) {
  const { scene } = useGLTF("/valmontieraviator.glb");

  const STRAP_COLORS = useMemo(
    () => ({
      "Black Leather": "#111111",
      "Navy Leather": "#0a1e3f",
      "Brown Leather": "#5a3a22",
      "Tan Leather": "#8a5a3a",
      "Leather Strap": "#111111",
    }),
    []
  );

  const DIAL = useMemo(
    () => ({
      "White Roman": "#f6f6f6",
      Ivory: "#efe6d2",
      Silver: "#d9dde2",
      "Sky Blue": "#8fb8d8",
      Black: "#121316",
      Blue: "#173a63",
    }),
    []
  );

  const HANDS = useMemo(
    () => ({
      Blue: { base: "#1e4cff", lume: "#1e4cff" },
      Black: { base: "#151515", lume: "#151515" },
      Steel: { base: "#cfd6dd", lume: "#cfd6dd" },
      Gold: { base: "#caa24a", lume: "#caa24a" },

      "Blue (Lume)": { base: "#1e4cff", lume: "#e7f6ff" },
      "Black (Lume)": { base: "#151515", lume: "#e9f0e6" },
      "Steel (Lume)": { base: "#cfd6dd", lume: "#e9f0e6" },
      "Gold (Lume)": { base: "#caa24a", lume: "#fff2c6" },
    }),
    []
  );

  const INK = useMemo(() => ({ Dark: "#141518", Navy: "#0e1a2a" }), []);

  const dialInkFor = (dialColor) => {
    if (dialColor === "White Roman" || dialColor === "Ivory" || dialColor === "Silver") return INK.Dark;
    if (dialColor === "Black") return "#f2f2f2";
    if (dialColor === "Blue") return "#e9eef6";
    if (dialColor === "Sky Blue") return INK.Navy;
    return INK.Dark;
  };

  const ensureStd = (mat) => {
    if (!mat) return null;
    if (Array.isArray(mat)) return mat.map(ensureStd);
    return mat.clone ? mat.clone() : mat;
  };

  const setMat = (mat, props) => {
    if (!mat) return;
    if (Array.isArray(mat)) {
      mat.forEach((m) => setMat(m, props));
      return;
    }

    if (props.color && mat.color) mat.color.set(props.color);
    if (typeof props.metalness === "number" && typeof mat.metalness === "number") mat.metalness = props.metalness;
    if (typeof props.roughness === "number" && typeof mat.roughness === "number") mat.roughness = props.roughness;

    if (typeof props.transparent === "boolean") mat.transparent = props.transparent;
    if (typeof props.opacity === "number") mat.opacity = props.opacity;

    if (typeof props.clearcoat === "number" && "clearcoat" in mat) mat.clearcoat = props.clearcoat;
    if (typeof props.clearcoatRoughness === "number" && "clearcoatRoughness" in mat)
      mat.clearcoatRoughness = props.clearcoatRoughness;

    if (props.emissive && mat.emissive) mat.emissive.set(props.emissive);
    if (typeof props.emissiveIntensity === "number" && "emissiveIntensity" in mat)
      mat.emissiveIntensity = props.emissiveIntensity;

    if (typeof props.envMapIntensity === "number" && "envMapIntensity" in mat)
      mat.envMapIntensity = props.envMapIntensity;

    mat.needsUpdate = true;
  };

  const stripColorMaps = (mat) => {
    if (!mat) return;

    const apply = (m) => {
      if (!m) return;
      if ("map" in m) m.map = null;
      if ("aoMap" in m) m.aoMap = null;
      if ("metalnessMap" in m) m.metalnessMap = null;
      if ("roughnessMap" in m) m.roughnessMap = null;
      if ("emissiveMap" in m) m.emissiveMap = null;
      if ("vertexColors" in m) m.vertexColors = false;
      m.needsUpdate = true;
    };

    if (Array.isArray(mat)) mat.forEach(apply);
    else apply(mat);
  };

  useEffect(() => {
    const STEEL = "#c9d0d6";
    const isBracelet = options.strap === "Steel Bracelet";
    const isLeather = !isBracelet;

    // Bracelet meshes to hide when leather is selected
    const BRACELET_MESHES = new Set([
      "clasp_part2",
      "clasppart",
      "metalpin",
      "metalpin2",
      "metalpin3",
      "metalpins",
      "quickrelease",
      "straplinks",
      "claspbuttons",
      "bracelet",
      "braceletscrews",
      "butterflyclasp",
      "butterflyclasprelease",
      "backcover",
    ]);

    // Leather meshes to hide when bracelet is selected
    const LEATHER_MESHES = new Set(["leatherstrap"]);
    const LEATHER_HW_MESHES = new Set(["leatherstrap_hardware"]);

    // Stainless steel parts (case + bracelet + hardware)
    const STEEL_MESHES = new Set([
      "case",
      "watchcasepart",
      "bezel",
      "bezel_screws",
      "backcover",
      "backcoverscrews",
      "crownwheel",
      "bracelet",
      "braceletscrews",
      "butterflyclasp",
      "butterflyclasprelease",
      "clasp_part2",
      "clasppart",
      "metalpin",
      "metalpin2",
      "metalpin3",
      "metalpins",
      "quickrelease",
      "straplinks",
      "claspbuttons",
      "leatherstrap_hardware",
    ]);

    const DIAL_BASE_MESHES = new Set(["dial", "dialmiddle"]);
    const NUMERAL_MESHES = new Set(["SBD0001", "SBD0002", "SBD0003", "SBD0"]);

    scene.traverse((obj) => {
      if (!obj?.isMesh) return;

      // clone first so changes stick
      obj.material = ensureStd(obj.material);

      // show/hide strap vs bracelet
      if (BRACELET_MESHES.has(obj.name)) obj.visible = isBracelet;
      if (LEATHER_MESHES.has(obj.name)) obj.visible = isLeather;
      if (LEATHER_HW_MESHES.has(obj.name)) obj.visible = isLeather;

      // leather strap tint
      if (obj.name === "leatherstrap") {
        const col = STRAP_COLORS[options.strap] || "#111111";
        stripColorMaps(obj.material);
        setMat(obj.material, {
          color: col,
          metalness: 0.0,
          roughness: 0.9,
          transparent: false,
          opacity: 1,
          envMapIntensity: 0.6,
        });
        return;
      }

      // leather hardware matches steel/case
      if (obj.name === "leatherstrap_hardware") {
        stripColorMaps(obj.material);
        setMat(obj.material, {
          color: STEEL,
          metalness: 0.92,
          roughness: 0.22,
          envMapIntensity: 1.4,
        });
        return;
      }

      // clear front glass
      if (obj.name === "frontglass") {
        setMat(obj.material, {
          color: "#ffffff",
          metalness: 0.0,
          roughness: 0.03,
          transparent: true,
          opacity: 0.12,
          clearcoat: 1.0,
          clearcoatRoughness: 0.02,
          envMapIntensity: 1.2,
        });
        return;
      }

      // crown crystal
      if (obj.name === "dobj") {
        setMat(obj.material, {
          color: "#002e99",
          metalness: 0.0,
          roughness: 0.08,
          transparent: true,
          opacity: 0.7,
          clearcoat: 1.0,
          clearcoatRoughness: 0.02,
          envMapIntensity: 1.2,
        });
        return;
      }

      // steel everywhere for case and bracelet so bracelet matches case (no gunmetal)
      if (STEEL_MESHES.has(obj.name)) {
        setMat(obj.material, {
          color: STEEL,
          metalness: 0.92,
          roughness: 0.22,
          envMapIntensity: 1.4,
        });

        return;
      }

      // dial base
      if (DIAL_BASE_MESHES.has(obj.name)) {
        setMat(obj.material, {
          color: DIAL[options.dialColor] || "#f6f6f6",
          metalness: 0.05,
          roughness: 0.55,
          envMapIntensity: 1.0,
        });
        return;
      }

      // numerals
      if (NUMERAL_MESHES.has(obj.name)) {
        setMat(obj.material, {
          color: dialInkFor(options.dialColor),
          metalness: 0.0,
          roughness: 0.85,
          transparent: false,
          opacity: 1,
          envMapIntensity: 0.2,
        });
        return;
      }

      // hands
      if (obj.name === "hourhand" || obj.name === "minutehand" || obj.name === "secondshand") {
        const spec = HANDS[options.handColor] || HANDS.Steel;
        setMat(obj.material, {
          color: spec.base,
          metalness: 0.98,
          roughness: 0.18,
          emissive: "#000000",
          emissiveIntensity: 0,
          envMapIntensity: 1.6,
        });
        return;
      }

      // lume meshes: only visible for "(Lume)" options (your default ones have lume matching base already)
      if (obj.name === "hourhandlume" || obj.name === "minutehandlume") {
        const spec = HANDS[options.handColor] || HANDS.Steel;

        // show always so default looks like one solid hand
        // if you want ONLY lume options to show, change to: const show = options.handColor.includes("(Lume)");
        const show = true;

        obj.visible = show;

        if (show) {
          setMat(obj.material, {
            color: spec.lume,
            metalness: 0.98,
            roughness: 0.18,
            emissive: "#000000",
            emissiveIntensity: 0,
            transparent: false,
            opacity: 1,
            envMapIntensity: 1.6,
          });
        }
        return;
      }
    });
  }, [
    scene,
    options.dialColor,
    options.handColor,
    options.strap,
    options.quickRelease,
    DIAL,
    HANDS,
    INK,
    STRAP_COLORS,
  ]);

  // rotate to face front if your GLB is sideways
  return <primitive object={scene} rotation={[0, -Math.PI / 2, 0]} />;
}

export default function AviatorViewer({ options }) {
  const safe =
    options ?? {
      dialColor: "White Roman",
      handColor: "Blue",
      strap: "Steel Bracelet",
      quickRelease: false,
    };

  const [showHint, setShowHint] = useState(true);

  return (
    <div
      className="relative h-[420px] w-full overflow-hidden rounded-2xl border border-black/10 bg-white"
      onPointerDown={() => setShowHint(false)}
      onTouchStart={() => setShowHint(false)}
    >
      <Canvas camera={{ position: [0, 0.02, 0.2], fov: 35, near: 0.01, far: 50 }}>
        <ambientLight intensity={0.85} />
        <directionalLight position={[3, 3, 3]} intensity={1.3} />
        <Environment preset="city" />
        <Suspense fallback={null}>
          <AviatorModel options={safe} />
        </Suspense>

        <OrbitControls
          autoRotate
          makeDefault
          enablePan
          target={[0, 0.02, 0]}
          enableDamping
          dampingFactor={0.08}
          rotateSpeed={0.9}
          zoomSpeed={1.0}
          panSpeed={0.8}
          minDistance={0.03}
          maxDistance={2.5}
          minPolarAngle={0.2}
          maxPolarAngle={Math.PI - 0.2}
        />
      </Canvas>

     {/*} {showHint ? (
        <div className="pointer-events-none absolute inset-0 flex items-end justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl border border-black/10 bg-white/80 px-4 py-3 backdrop-blur">
            <div className="text-sm font-medium text-zinc-900">Controls</div>

            <div className="mt-2 grid grid-cols-1 gap-1 text-xs text-zinc-700">
              <div className="flex items-center justify-between">
                <span>Rotate</span>
                <span className="font-medium">Drag</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Zoom</span>
                <span className="font-medium">Scroll / Pinch</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Pan</span>
                <span className="font-medium">Right drag / Two-finger drag</span>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-zinc-900 animate-pulse" />
              <div className="text-[11px] text-zinc-600">Click the viewer to dismiss</div>
            </div>
          </div>
        </div>
      ) */}
    </div>
  );
}

useGLTF.preload("/valmontieraviator.glb");