'use client';
import { useRef, MutableRefObject, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Instances, Instance, Text } from '@react-three/drei';
import * as THREE from 'three';

// ─── Camera spline (computed once at module load) ──────────────────────────────
const camPosCurve = new THREE.CatmullRomCurve3([
  [0,14,62],[0,9,50],[-4,7,38],[0,5.5,24],
  [6,4.5,8],[0,4.5,-6],[-5,5,-20],[-3,6,-32],
  [5,4.5,-44],[0,9,-55],[9,4.5,-64],[0,5,-74],
  [-6,4.5,-87],[5,4,-100],[0,6,-112],[6,7,-126],
  [-8,5,-139],[0,7,-150],
  // Smoothed dispatch→destination (no wild lateral swing)
  [2,6,-162],[0,5.5,-172],[0,5,-182],[0,4.5,-190],[0,4,-196],
].map(p => new THREE.Vector3(p[0],p[1],p[2])), false, 'catmullrom', 0.5);

const camTgtCurve = new THREE.CatmullRomCurve3([
  [0,5,42],[0,3,38],[0,2,22],[0,2,8],
  [0,2,-2],[0,2,-15],[0,2,-28],[0,2,-40],
  [0,2,-52],[0,2,-62],[0,2,-62],[0,2,-80],
  [0,2,-93],[0,2,-106],[0,2,-118],[0,3,-132],
  [0,2,-146],[0,2,-156],
  // Smoothed: gently track truck then settle into interior
  [0,2,-168],[0,2,-178],[0,2,-188],[0,2,-194],[0,2,-200],
].map(p => new THREE.Vector3(p[0],p[1],p[2])), false, 'catmullrom', 0.5);

// ─── Shared geometries (one instance for entire scene) ────────────────────────
const GEO = {
  box:   new THREE.BoxGeometry(1,1,1),
  cyl8:  new THREE.CylinderGeometry(0.5,0.5,1,8),
  cyl12: new THREE.CylinderGeometry(0.5,0.5,1,12),
  cyl16: new THREE.CylinderGeometry(0.5,0.5,1,16),
  cyl24: new THREE.CylinderGeometry(0.5,0.5,1,24),
};

// ─── Shared materials (one instance for entire scene) ─────────────────────────
// MeshLambertMaterial for non-metallic opaque surfaces → MUCH cheaper than Standard
const ML = {
  log:      new THREE.MeshLambertMaterial({ color: '#5A3010' }),
  bark:     new THREE.MeshLambertMaterial({ color: '#3E2008' }),
  veneer:   new THREE.MeshLambertMaterial({ color: '#B8864E' }),
  ply:      new THREE.MeshLambertMaterial({ color: '#C4935A' }),
  plyEdge:  new THREE.MeshLambertMaterial({ color: '#A0763C' }),
  concrete: new THREE.MeshLambertMaterial({ color: '#808078' }),
  wall:     new THREE.MeshLambertMaterial({ color: '#A8A49C', side: THREE.DoubleSide }),
  rubber:   new THREE.MeshLambertMaterial({ color: '#1A1A18' }),
  warmWood: new THREE.MeshLambertMaterial({ color: '#8B5A2B' }),
  cream:    new THREE.MeshLambertMaterial({ color: '#F5F0E8' }),
  red:      new THREE.MeshLambertMaterial({ color: '#C0392B' }),
  white:    new THREE.MeshLambertMaterial({ color: '#EEEAE2' }),
};

// MeshStandardMaterial only where metalness/emissive matters visually
const MS = {
  metal:    new THREE.MeshStandardMaterial({ color: '#8A9BAA', roughness: 0.35, metalness: 0.85 }),
  metalDk:  new THREE.MeshStandardMaterial({ color: '#3A4550', roughness: 0.5,  metalness: 0.7  }),
  metalYel: new THREE.MeshStandardMaterial({ color: '#D4920E', roughness: 0.45, metalness: 0.4  }),
  emit:     new THREE.MeshStandardMaterial({ color: '#FFF3AA', emissive: '#FFD060', emissiveIntensity: 0.9, roughness: 1 }),
  // White non-transparent material replaces glass (saves a render pass)
  glassOp:  new THREE.MeshStandardMaterial({ color: '#AACCEE', roughness: 0.05, metalness: 0.1 }),
};

// ─── Reusable tmp vectors (never re-allocate per frame) ───────────────────────
const _tmpPos = new THREE.Vector3();
const _tmpTgt = new THREE.Vector3();

// ─── Single unified animation state (all useFrame logic lives here) ───────────
// We collect refs from each station and drive everything from ONE useFrame call
interface AnimRefs {
  drum?:    THREE.Mesh | null;
  blade?:   THREE.Mesh | null;
  sandDrum?:THREE.Mesh | null;
  sheets?:  (THREE.Mesh | null)[];
  droplet?: THREE.Mesh | null;
  pressUp?: THREE.Mesh | null;
  pistons?: (THREE.Mesh | null)[];
  forklift?:THREE.Group | null;
  truck?:   THREE.Group | null;
}

// ─── Camera + unified animation controller ────────────────────────────────────
function SceneController({
  progress, anim,
}: { progress: MutableRefObject<number>; anim: MutableRefObject<AnimRefs> }) {
  const { camera } = useThree();
  const curPos = useRef(new THREE.Vector3(0, 14, 62));
  const curTgt = useRef(new THREE.Vector3(0, 5, 42));

  useFrame((_, delta) => {
    const t = Math.max(0, Math.min(1, progress.current));

    // ── Camera ────────────────────────────────────────────────────────────────
    camPosCurve.getPoint(t, _tmpPos);
    camTgtCurve.getPoint(t, _tmpTgt);
    // delta-independent lerp factor capped at dt to avoid overshooting
    const lf = Math.min(1, 12 * delta);
    curPos.current.lerp(_tmpPos, lf * 0.5);
    curTgt.current.lerp(_tmpTgt, lf * 0.5);
    camera.position.copy(curPos.current);
    camera.lookAt(curTgt.current);

    const a = anim.current;

    // ── Veneer drum ───────────────────────────────────────────────────────────
    if (a.drum && t > 0.06) a.drum.rotation.x += delta * 0.9;

    // ── Saw blade ─────────────────────────────────────────────────────────────
    if (a.blade && t > 0.62) a.blade.rotation.z += delta * 3.5;

    // ── Sanding drum ──────────────────────────────────────────────────────────
    if (a.sandDrum && t > 0.68) a.sandDrum.rotation.x += delta * 2.4;

    // ── Layering sheets ───────────────────────────────────────────────────────
    if (a.sheets) {
      const lp = Math.max(0, (t - 0.23) / 0.13);
      for (let i = 0; i < a.sheets.length; i++) {
        const m = a.sheets[i];
        if (!m) continue;
        const tgt = i * 0.028;
        const from = -0.8 + i * 0.028;
        m.position.y = THREE.MathUtils.lerp(from, tgt, Math.min(1, lp * 2 - i * 0.15));
      }
    }

    // ── Adhesive drip ─────────────────────────────────────────────────────────
    if (a.droplet) {
      a.droplet.position.y = 3.5 - ((t * 15) % 1) * 0.8;
    }

    // ── Hydraulic press ───────────────────────────────────────────────────────
    if (a.pressUp && a.pistons) {
      const lp = Math.max(0, Math.min(1, (t - 0.47) / 0.09));
      const op = Math.max(0, Math.min(1, (t - 0.56) / 0.06));
      const comp = lp - op;
      a.pressUp.position.y = 1.8 - comp * 1.5;
      const sy = 1 + comp * 0.6;
      for (const p of a.pistons) { if (p) p.scale.y = sy; }
    }

    // ── Forklift ──────────────────────────────────────────────────────────────
    if (a.forklift) {
      const fp = Math.max(0, (t - 0.84) / 0.08);
      a.forklift.position.x = THREE.MathUtils.lerp(3, -2.5, Math.min(1, fp));
      a.forklift.position.z = THREE.MathUtils.lerp(0, -1,   Math.min(1, fp));
    }

    // ── Truck ─────────────────────────────────────────────────────────────────
    if (a.truck) {
      const tp = Math.max(0, (t - 0.91) / 0.08);
      a.truck.position.z = THREE.MathUtils.lerp(-4, -22, Math.min(1, tp));
    }
  });

  return null;
}

// ─── Primitive helpers (no React overhead per call) ───────────────────────────
type P3 = [number,number,number];
type Rot = P3 | undefined;

function B({ p, s, m }: { p: P3; s: P3; m: THREE.Material }) {
  return <mesh position={p} scale={s} geometry={GEO.box} material={m} />;
}
function C({ p, r, s, m, sides = 12 }: { p: P3; r?: Rot; s: P3; m: THREE.Material; sides?: number }) {
  const g = sides === 8 ? GEO.cyl8 : sides === 16 ? GEO.cyl16 : sides === 24 ? GEO.cyl24 : GEO.cyl12;
  return <mesh position={p} rotation={r} scale={s} geometry={g} material={m} />;
}

// ─── Factory Structure ─────────────────────────────────────────────────────────
function FactoryStructure() {
  return (
    <group>
      {/* Floor — single draw call */}
      <B p={[0,-0.05,-70]} s={[28,0.1,260]} m={ML.concrete} />
      <B p={[0,-0.05,50]}  s={[40,0.1,30]}  m={ML.concrete} />
      {/* Walls */}
      <B p={[-11,5,-67]} s={[0.3,10,250]} m={ML.wall} />
      <B p={[11, 5,-67]} s={[0.3,10,250]} m={ML.wall} />
      <B p={[0,10,-67]}  s={[22,0.3,250]} m={ML.wall} />
      {/* Entrance frame */}
      <B p={[-8,5,20]} s={[0.5,10,0.5]} m={MS.metalDk} />
      <B p={[8, 5,20]} s={[0.5,10,0.5]} m={MS.metalDk} />
      <B p={[0,10,20]} s={[17,0.6,0.5]} m={MS.metalDk} />

      {/* ── ECOLUSH BRANDING ──────────────────────────────────────────────── */}
      {/* Entrance sign board — red background with emissive glow */}
      <B p={[0,8.5,20.3]} s={[8,1.5,0.15]} m={ML.red} />
      {/* Emissive highlight strip on sign */}
      <B p={[0,8.5,20.42]} s={[7.4,1.1,0.04]} m={MS.emit} />
      {/* 3D Brand Title on Entrance Archway */}
      <Text
        position={[0, 8.5, 20.48]}
        fontSize={0.65}
        letterSpacing={0.12}
        color="#FFFFFF"
        anchorX="center"
        anchorY="middle"
        font="/fonts/Alpino-Variable.woff"
      >
        ECOLUSH PLY
      </Text>
      {/* Secondary brand panel — inside factory, right wall */}
      <B p={[10.8,6,-30]} s={[0.05,2.5,6]} m={ML.red} />
      <B p={[10.8,6,-30]} s={[0.04,2.0,5.4]} m={MS.emit} />
      <Text
        position={[10.74, 6, -30]}
        rotation={[0, -Math.PI / 2, 0]}
        fontSize={0.52}
        letterSpacing={0.1}
        color="#FFFFFF"
        anchorX="center"
        anchorY="middle"
        font="/fonts/Alpino-Variable.woff"
      >
        ECOLUSH PLY
      </Text>
      {/* Brand accent strip along factory floor edge (both sides) */}
      <B p={[-10.8,0.06,-70]} s={[0.15,0.12,250]} m={ML.red} />
      <B p={[10.8, 0.06,-70]} s={[0.15,0.12,250]} m={ML.red} />

      {/* Skylight emitters — cheap emissive meshes, no point lights */}
      {([-40,-80,-120,-160] as number[]).map(z => (
        <group key={z}>
          <B p={[-4,10.1,z]} s={[3,0.05,8]} m={MS.emit} />
          <B p={[4, 10.1,z]} s={[3,0.05,8]} m={MS.emit} />
        </group>
      ))}
      {/* Columns (instanced: 4 positions × 2 sides = 8 meshes → 1 draw call) */}
      <Instances geometry={GEO.box} material={MS.metalDk} limit={8}>
        {([-20,-60,-100,-140] as number[]).flatMap(z => [
          <Instance key={`L${z}`} position={[-10,5,z]} scale={[0.6,10,0.6]} />,
          <Instance key={`R${z}`} position={[10, 5,z]} scale={[0.6,10,0.6]} />,
        ])}
      </Instances>
      {/* Interior walls */}
      <B p={[0,-0.05,-192]} s={[20,0.1,30]}  m={ML.warmWood} />
      <B p={[-10,5,-190]}   s={[0.2,10,28]}  m={ML.cream} />
      <B p={[10, 5,-190]}   s={[0.2,10,28]}  m={ML.cream} />
      <B p={[0,10,-190]}    s={[20,0.2,28]}  m={ML.cream} />
      <B p={[0, 5,-204]}    s={[20,10,0.2]}  m={ML.cream} />
    </group>
  );
}

// ─── Station 1: Timber Yard ───────────────────────────────────────────────────
function TimberYard() {
  const logDefs: [number,number,number,number][] = [
    [-1.5,0.7,0,0],  [0.2,0.7,0.4,0.15],  [1.8,0.7,-0.2,-0.1],
    [-2,2.1,0.2,0.05],[0,2.1,0,-0.05],    [2,2.1,0,0.08], [-0.8,3.5,0.1,0],
  ];
  return (
    <group position={[0,0,42]}>
      {/* Instanced log cylinders → 1 draw call */}
      <Instances geometry={GEO.cyl12} material={ML.log} limit={10}>
        {logDefs.map(([x,y,z,r],i) => (
          <Instance key={i} position={[x,y,z]} rotation={[Math.PI/2,r,0]} scale={[1.4,7,1.4]} />
        ))}
        {/* Feeding logs */}
        <Instance position={[-1,0.7,-3]} rotation={[Math.PI/2,0,0]} scale={[1.3,6.5,1.3]} />
        <Instance position={[1.2,0.7,-5]} rotation={[Math.PI/2,0,0]} scale={[1.3,6.5,1.3]} />
      </Instances>
      {/* Bark end caps — instanced */}
      <Instances geometry={GEO.cyl16} material={ML.bark} limit={3}>
        {([-1.5,0.2,1.8] as number[]).map((x,i) => (
          <Instance key={i} position={[x,0.7,3.5]} scale={[1.45,0.15,1.45]} />
        ))}
      </Instances>
      {/* Rollers — instanced */}
      <Instances geometry={GEO.cyl8} material={MS.metal} limit={5}>
        {([0,2,4,6,8] as number[]).map(dz => (
          <Instance key={dz} position={[0,-0.02,dz-6]} rotation={[0,0,Math.PI/2]} scale={[0.2,9,0.2]} />
        ))}
      </Instances>
    </group>
  );
}

// ─── Conveyor Belt (no per-frame logic) ───────────────────────────────────────
function ConveyorBelt({ len }: { len: number }) {
  const rollers = Math.floor(len / 1.2);
  return (
    <group>
      <B p={[0,0.08,0]}  s={[2.2,0.12,len]} m={ML.rubber} />
      <B p={[-1.2,0.4,0]} s={[0.1,0.7,len]} m={MS.metal} />
      <B p={[1.2, 0.4,0]} s={[0.1,0.7,len]} m={MS.metal} />
      <Instances geometry={GEO.cyl8} material={MS.metal} limit={30}>
        {Array.from({length:rollers},(_,i) => (
          <Instance key={i}
            position={[0,0,-len/2+0.6+i*1.2]}
            rotation={[0,0,Math.PI/2]}
            scale={[0.18,2.4,0.18]}
          />
        ))}
      </Instances>
      {/* 3 leg pairs */}
      {([-len/2+1,0,len/2-1] as number[]).map(z => (
        <group key={z}>
          <B p={[-0.9,-0.55,z]} s={[0.1,1.1,0.1]} m={MS.metalDk} />
          <B p={[0.9, -0.55,z]} s={[0.1,1.1,0.1]} m={MS.metalDk} />
        </group>
      ))}
    </group>
  );
}

// ─── Station 2: Veneer Machine ────────────────────────────────────────────────
function VeneerMachine({ anim }: { anim: MutableRefObject<AnimRefs> }) {
  const drumRef = useRef<THREE.Mesh>(null);
  useEffect(() => { anim.current.drum = drumRef.current; }, [anim]);

  return (
    <group position={[0,0,4]}>
      <B p={[0,2.8,0]}    s={[5,5.5,4.5]} m={MS.metalDk} />
      <B p={[0,2.8,2.3]}  s={[3,2.5,0.1]} m={MS.metal}   />
      <mesh ref={drumRef} position={[0,2.8,0.5]}>
        <cylinderGeometry args={[1.1,1.1,5.5,12]} />
        <primitive object={ML.log} />
      </mesh>
      <B p={[-2.6,2.8,0.5]} s={[0.1,3,3]} m={MS.metal} />
      <B p={[2.6, 2.8,0.5]} s={[0.1,3,3]} m={MS.metal} />
      <B p={[0,1.6,2.1]}    s={[3.5,0.2,0.3]} m={MS.metal} />
      <group position={[0,1.0,3.6]}>
        <ConveyorBelt len={6} />
      </group>
      {/* Veneer output sheets — instanced */}
      <Instances geometry={GEO.box} material={ML.veneer} limit={3}>
        {([0,0.05,0.1] as number[]).map((dy,i) => (
          <Instance key={i} position={[0,1.0+dy,5.5]} scale={[2.0,0.022,1.2]} />
        ))}
      </Instances>
      <B p={[3,1.5,1]} s={[0.8,1.5,0.15]} m={MS.metalDk} />
      <B p={[3,2.4,1.08]} s={[0.08,0.08,0.05]} m={MS.emit} />
    </group>
  );
}

// ─── Station 3: Conveyor Transport ───────────────────────────────────────────
function ConveyorSection() {
  return (
    <group position={[0,1.0,-12]}>
      <ConveyorBelt len={18} />
      {/* Veneer sheets — instanced */}
      <Instances geometry={GEO.box} material={ML.veneer} limit={8}>
        {([-6,-2,2,6] as number[]).flatMap((z,i) => [
          <Instance key={`a${i}`} position={[0,0.14,z]} scale={[2.0,0.022,1.2]} />,
          <Instance key={`b${i}`} position={[0,0.166,z+0.1]} scale={[2.0,0.022,1.2]} />,
        ])}
      </Instances>
    </group>
  );
}

// ─── Station 4 & 5: Layering + Adhesive ──────────────────────────────────────
function LayeringStation({ anim }: { anim: MutableRefObject<AnimRefs> }) {
  const sheetRefs = useRef<(THREE.Mesh|null)[]>([]);
  const dropletRef = useRef<THREE.Mesh>(null);
  useEffect(() => {
    anim.current.sheets  = sheetRefs.current;
    anim.current.droplet = dropletRef.current;
  }, [anim]);

  return (
    <group position={[0,1.0,-28]}>
      <B p={[0,-0.25,0]}   s={[3.5,0.15,2.0]} m={MS.metal}   />
      <B p={[-1.6,-0.85,0]} s={[0.1,1.3,1.8]} m={MS.metalDk} />
      <B p={[1.6, -0.85,0]} s={[0.1,1.3,1.8]} m={MS.metalDk} />
      {/* Layering sheets: 7 individual refs (needed for scroll animation) */}
      {Array.from({length:7},(_,i) => (
        <mesh key={i} ref={el=>{sheetRefs.current[i]=el;}} position={[0,i*0.028,0]}>
          <boxGeometry args={[2.4,0.022,1.2]} />
          <primitive object={i%2===0?ML.veneer:ML.ply} />
        </mesh>
      ))}
      <B p={[0,1.8,0]}   s={[3.5,0.1,2.0]} m={MS.metal}   />
      <B p={[-1.7,1.0,0]} s={[0.08,1.6,0.08]} m={MS.metal} />
      <B p={[1.7, 1.0,0]} s={[0.08,1.6,0.08]} m={MS.metal} />

      {/* Adhesive station */}
      <group position={[0,0,-14]}>
        <B p={[0,2.2,0]}   s={[3.8,4.4,2.5]} m={MS.metalDk} />
        <C p={[0,0.18,1.3]} r={[0,0,Math.PI/2]} s={[0.22,2.6,0.22]} m={ML.rubber} />
        <mesh ref={dropletRef} position={[0,3.5,1.2]}>
          <sphereGeometry args={[0.06,6,6]} />
          <meshLambertMaterial color="#F0E060" />
        </mesh>
        <B p={[0,1,-1.5]}  s={[2,2,1]}     m={MS.metal}   />
        <B p={[0,0.18,1]}  s={[2.4,0.2,1.2]} m={ML.veneer} />
      </group>
    </group>
  );
}

// ─── Station 6: Hydraulic Press ───────────────────────────────────────────────
function HydraulicPress({ anim }: { anim: MutableRefObject<AnimRefs> }) {
  const upperRef  = useRef<THREE.Mesh>(null);
  const pistons   = useRef<(THREE.Mesh|null)[]>([]);
  useEffect(() => {
    anim.current.pressUp = upperRef.current;
    anim.current.pistons = pistons.current;
  }, [anim]);

  return (
    <group position={[0,0,-60]}>
      {/* 4 columns — instanced */}
      <Instances geometry={GEO.cyl8} material={MS.metalDk} limit={4}>
        {([[-2.4,-2.4],[-2.4,2.4],[2.4,-2.4],[2.4,2.4]] as [number,number][]).map(([x,z],i) => (
          <Instance key={i} position={[x,4,z]} scale={[0.35,8,0.35]} />
        ))}
      </Instances>
      <B p={[0,8.4,0]}   s={[6,0.8,6]}  m={MS.metalDk} />
      {/* Pistons (need individual refs) */}
      {([[-1.2,0],[1.2,0]] as [number,number][]).map(([x,z],i) => (
        <mesh key={i} ref={el=>{pistons.current[i]=el;}} position={[x,6.5,z]}>
          <cylinderGeometry args={[0.3,0.3,2,8]} />
          <primitive object={MS.metal} />
        </mesh>
      ))}
      <B p={[0,0.2,0]} s={[5.5,0.5,4.2]} m={MS.metal} />
      <mesh ref={upperRef} position={[0,1.8,0]}>
        <boxGeometry args={[5.5,0.5,4.2]} />
        <primitive object={MS.metal} />
      </mesh>
      {/* Stack in press — instanced */}
      <Instances geometry={GEO.box} material={ML.veneer} limit={7}>
        {([0,0.03,0.06,0.09,0.12,0.15,0.18] as number[]).map((dy,i) => (
          <Instance key={i} position={[0,0.48+dy,0]} scale={[2.4,0.028,1.2]} />
        ))}
      </Instances>
      <B p={[3.2,5,0]}    s={[0.6,1.2,0.2]} m={MS.metalDk} />
      <C p={[3.2,5.2,0.12]} r={[Math.PI/2,0,0]} s={[0.4,0.15,0.4]} m={MS.metal} sides={12} />
    </group>
  );
}

// ─── Station 7: Cutting Machine ───────────────────────────────────────────────
function CuttingMachine({ anim }: { anim: MutableRefObject<AnimRefs> }) {
  const bladeRef = useRef<THREE.Mesh>(null);
  useEffect(() => { anim.current.blade = bladeRef.current; }, [anim]);

  return (
    <group position={[0,0,-78]}>
      <B p={[0,2,0]}     s={[5.5,4,3.5]}  m={MS.metalDk} />
      <B p={[0,4.1,0.5]} s={[5.5,0.2,2.5]} m={MS.metal}  />
      <B p={[0,4.1,0]}   s={[0.15,0.5,2.5]} m={MS.metalDk} />
      <mesh ref={bladeRef} position={[0,4.4,0]} rotation={[Math.PI/2,0,0]}>
        <cylinderGeometry args={[1.4,1.4,0.06,24]} />
        <meshStandardMaterial color="#C8D8E8" roughness={0.1} metalness={0.95} />
      </mesh>
      {/* Guard — cheaper 16-sided cylinder */}
      <C p={[0,4.8,0]} r={[Math.PI/2,0,0]} s={[1.5,0.4,1.5]} m={MS.metal} sides={16} />
      <B p={[0,4.22,0.8]}  s={[2.4,0.025,1.2]} m={ML.ply} />
      <B p={[0,4.22,-1.5]} s={[1.2,0.025,1.2]} m={ML.ply} />
      {/* Output mini-conveyor */}
      <group position={[0,4.15,-2.8]}>
        <B p={[0,0,0]} s={[2.4,0.1,4]} m={ML.rubber} />
        <Instances geometry={GEO.cyl8} material={MS.metal} limit={4}>
          {([0,0.8,1.6,2.4] as number[]).map(z => (
            <Instance key={z} position={[0,0.08,z-1.8]} rotation={[0,0,Math.PI/2]} scale={[0.1,2.4,0.1]} />
          ))}
        </Instances>
      </group>
      <B p={[-3,3.5,0]} s={[0.4,3,0.4]}  m={MS.metal} />
      <B p={[-3,5.2,-0.5]} s={[0.4,0.4,1.5]} m={MS.metal} />
    </group>
  );
}

// ─── Station 8: Sanding Machine ───────────────────────────────────────────────
function SandingMachine({ anim }: { anim: MutableRefObject<AnimRefs> }) {
  const drumRef = useRef<THREE.Mesh>(null);
  useEffect(() => { anim.current.sandDrum = drumRef.current; }, [anim]);

  return (
    <group position={[0,0,-93]}>
      <B p={[0,2.5,0]}   s={[5,5,3]}   m={MS.metalDk} />
      <B p={[0,1.05,1.6]} s={[3,0.4,0.15]} m={MS.metalDk} />
      <mesh ref={drumRef} position={[0,1.5,0]} rotation={[Math.PI/2,0,0]}>
        <cylinderGeometry args={[0.6,0.6,4.8,12]} />
        <meshLambertMaterial color="#D08040" />
      </mesh>
      {/* Second drum — no animation ref needed */}
      <C p={[0,2.5,0]} r={[Math.PI/2,0,0]} s={[0.5,4.8,0.5]} m={ML.log} sides={12} />
      <B p={[0,1.04,1]}  s={[2.4,0.025,1.2]} m={ML.ply}     />
      <B p={[0,1.04,-2]} s={[2.4,0.025,1.2]} m={ML.plyEdge} />
      {/* Dust bag */}
      <mesh position={[2.8,1,0]}>
        <sphereGeometry args={[0.7,8,8]} />
        <meshLambertMaterial color="#D0C8B0" />
      </mesh>
      <B p={[2.8,1.8,0]} s={[0.25,1.8,0.25]} m={MS.metal} />
    </group>
  );
}

// ─── Station 9: Quality Station ───────────────────────────────────────────────
function QualityStation() {
  return (
    <group position={[0,0,-110]}>
      <B p={[0,0.9,0]}     s={[3.5,0.12,2.2]} m={MS.metal}   />
      {/* Table legs — instanced */}
      <Instances geometry={GEO.box} material={MS.metalDk} limit={4}>
        {([[-1.6,-0.9],[-1.6,0.9],[1.6,-0.9],[1.6,0.9]] as [number,number][]).map(([x,z],i) => (
          <Instance key={i} position={[x,0.45,z]} scale={[0.1,0.9,0.1]} />
        ))}
      </Instances>
      <B p={[0,0.97,0.2]}  s={[2.4,0.025,1.2]} m={ML.ply} />
      {/* Lamp — two pieces */}
      <B p={[0,3.5,0.2]}   s={[0.05,3,0.05]}   m={MS.metal} />
      <mesh position={[0,3.4,0.2]}>
        <cylinderGeometry args={[0.35,0.28,0.3,12]} />
        <primitive object={MS.emit} />
      </mesh>
      {/* Inspection lamp is the one strong local light we keep */}
      <pointLight position={[0,3.2,0.2]} intensity={5} color="#FFF5D0" distance={8} decay={2} />
      <B p={[1.8,1.2,0]}   s={[0.5,0.6,0.6]}   m={MS.metalDk} />
      {/* Passed-stack — instanced */}
      <Instances geometry={GEO.box} material={ML.ply} limit={4}>
        {([0,0.03,0.06,0.09] as number[]).map((dy,i) => (
          <Instance key={i} position={[-3.8,0.03+dy,0]} scale={[2.4,0.025,1.2]} />
        ))}
      </Instances>
    </group>
  );
}

// ─── Station 10: Packaging ────────────────────────────────────────────────────
function PackagingArea() {
  return (
    <group position={[0,0,-124]}>
      {/* 3 packs × 10 sheets = 30 boxes → instanced into 1 draw call */}
      <Instances geometry={GEO.box} material={ML.ply} limit={30}>
        {([-2.5,0,2.5] as number[]).flatMap((x,gi) =>
          Array.from({length:10},(_,i) => (
            <Instance key={`${gi}-${i}`} position={[x,0.025*i+0.01,0]} scale={[2.4,0.022,1.2]} />
          ))
        )}
      </Instances>
      {/* Wrap (opaque instead of transparent — saves a render pass) */}
      <Instances geometry={GEO.box} material={MS.glassOp} limit={3}>
        {([-2.5,0,2.5] as number[]).map((x,i) => (
          <Instance key={i} position={[x,0.15,0]} scale={[2.55,0.35,1.35]} />
        ))}
      </Instances>
      <B p={[0,2,3.5]}    s={[4,4,1.5]}    m={MS.metalDk} />
      <B p={[0,0.8,2.8]}  s={[3.5,0.15,1]} m={ML.rubber}  />
      <C p={[-2.2,3,3.5]} r={[0,0,Math.PI/2]} s={[0.8,0.4,0.8]} m={MS.metal} sides={12} />
      <B p={[0,0.15,-0.7]} s={[0.8,0.05,0.3]} m={ML.red} />
      {/* 3D Label on Finished Packaged Pallet */}
      <Text
        position={[0, 0.18, -0.7]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.065}
        letterSpacing={0.05}
        color="#FFFFFF"
        anchorX="center"
        anchorY="middle"
        font="/fonts/Alpino-Variable.woff"
      >
        ECOLUSH PLY
      </Text>
    </group>
  );
}

// ─── Station 11: Forklift ─────────────────────────────────────────────────────
function ForkliftStation({ anim }: { anim: MutableRefObject<AnimRefs> }) {
  const forkRef = useRef<THREE.Group>(null);
  useEffect(() => { anim.current.forklift = forkRef.current; }, [anim]);

  return (
    <group position={[0,0,-140]}>
      <B p={[0,0.06,0]} s={[2.8,0.12,1.4]} m={ML.warmWood} />
      {/* Pallet sheets — instanced */}
      <Instances geometry={GEO.box} material={ML.ply} limit={8}>
        {Array.from({length:8},(_,i) => (
          <Instance key={i} position={[0,0.14+i*0.025,0]} scale={[2.4,0.022,1.2]} />
        ))}
      </Instances>
      <group ref={forkRef} position={[3,0,0]}>
        <B p={[0,1.1,0]}   s={[1.8,2.2,3]}   m={MS.metalYel} />
        <B p={[0,2.35,0.3]} s={[1.8,0.15,2.4]} m={MS.metalYel} />
        <B p={[-0.9,2.35,0.3]} s={[0.1,1.2,0.1]} m={MS.metalDk} />
        <B p={[0.9, 2.35,0.3]} s={[0.1,1.2,0.1]} m={MS.metalDk} />
        <B p={[0,3.55,0.3]}  s={[1.8,0.1,0.1]}  m={MS.metalDk} />
        <B p={[0,0.8,-1.8]}  s={[1.8,1.6,1]}    m={MS.metalDk} />
        {/* Wheels — instanced */}
        <Instances geometry={GEO.cyl12} material={ML.rubber} limit={4}>
          {([[-0.8,-1.3],[0.8,-1.3],[-0.8,1.3],[0.8,1.3]] as [number,number][]).map(([x,z],i) => (
            <Instance key={i} position={[x,0.35,z]} rotation={[0,0,Math.PI/2]} scale={[0.35,0.3,0.35]} />
          ))}
        </Instances>
        <B p={[-0.7,1.5,1.6]} s={[0.12,3.2,0.12]} m={MS.metalDk} />
        <B p={[0.7, 1.5,1.6]} s={[0.12,3.2,0.12]} m={MS.metalDk} />
        <B p={[0,2.5,1.65]}   s={[1.5,0.1,0.12]}  m={MS.metalDk} />
        <B p={[-0.5,0.6,2.4]} s={[0.15,0.1,2.2]}  m={MS.metal}   />
        <B p={[0.5, 0.6,2.4]} s={[0.15,0.1,2.2]}  m={MS.metal}   />
      </group>
    </group>
  );
}

// ─── Station 12: Loading Dock + Truck ─────────────────────────────────────────
function TruckAndDock({ anim }: { anim: MutableRefObject<AnimRefs> }) {
  const truckRef = useRef<THREE.Group>(null);
  useEffect(() => { anim.current.truck = truckRef.current; }, [anim]);

  return (
    <group position={[0,0,-158]}>
      <B p={[0,0.6,0]}   s={[10,1.2,5]}   m={ML.concrete} />
      <B p={[-4,5,-2]}   s={[0.3,10,0.3]} m={MS.metalDk} />
      <B p={[4, 5,-2]}   s={[0.3,10,0.3]} m={MS.metalDk} />
      <B p={[0,10,-2]}   s={[8.3,0.3,0.3]} m={MS.metalDk} />
      <B p={[-3,1.0,2]}  s={[0.4,1.2,0.3]} m={ML.rubber} />
      <B p={[3, 1.0,2]}  s={[0.4,1.2,0.3]} m={ML.rubber} />
      <B p={[0,1.22,1.5]} s={[2.8,0.12,1.4]} m={ML.warmWood} />
      {/* Dock pallet — instanced */}
      <Instances geometry={GEO.box} material={ML.ply} limit={10}>
        {Array.from({length:10},(_,i) => (
          <Instance key={i} position={[0,1.3+i*0.025,1.5]} scale={[2.4,0.022,1.2]} />
        ))}
      </Instances>
      <group ref={truckRef} position={[0,0,-4]}>
        <B p={[0,2.2,4]}   s={[3.2,3.8,10]} m={ML.white}  />
        <B p={[0,2,-1.5]}  s={[3.2,4,3]}    m={ML.white}  />
        <B p={[0,3.5,-2.2]} s={[3.0,1.4,1.4]} m={ML.white} />
        {/* Windshield opaque */}
        <B p={[0,3.6,-3.1]} s={[2.6,1.2,0.1]} m={MS.glassOp} />
        {/* Brand stripes */}
        <B p={[0,1.6,4]}   s={[3.25,0.35,10.05]} m={ML.red} />
        <B p={[1.62,2.2,4]} s={[0.05,3.8,10.05]} m={ML.red} />
        {/* Ecolush brand panel — left side of trailer */}
        <B p={[-1.62,3,4]}  s={[0.05,1.2,5]} m={ML.red} />
        <B p={[-1.62,3,4]}  s={[0.04,0.8,4.4]} m={MS.emit} />
        {/* 3D Brand on Truck Left Trailer */}
        <Text
          position={[-1.66, 3, 4]}
          rotation={[0, -Math.PI / 2, 0]}
          fontSize={0.42}
          letterSpacing={0.08}
          color="#FFFFFF"
          anchorX="center"
          anchorY="middle"
          font="/fonts/Alpino-Variable.woff"
        >
          ECOLUSH PLY
        </Text>
        {/* 3D Brand on Truck Right Trailer */}
        <Text
          position={[1.66, 3, 4]}
          rotation={[0, Math.PI / 2, 0]}
          fontSize={0.42}
          letterSpacing={0.08}
          color="#FFFFFF"
          anchorX="center"
          anchorY="middle"
          font="/fonts/Alpino-Variable.woff"
        >
          ECOLUSH PLY
        </Text>
        {/* Cabin door brand stripe */}
        <B p={[-1.62,2,-1.5]} s={[0.05,0.4,2.8]} m={ML.red} />
        {/* Truck wheels — instanced */}
        <Instances geometry={GEO.cyl12} material={ML.rubber} limit={6}>
          {([[-1.5,-1,-1.5],[1.5,-1,-1.5],[-1.5,-1,2],[1.5,-1,2],[-1.5,-1,5.5],[1.5,-1,5.5]] as P3[]).map((pos,i) => (
            <Instance key={i} position={pos} rotation={[0,0,Math.PI/2]} scale={[0.55,0.35,0.55]} />
          ))}
        </Instances>
        <B p={[-1.1,2.8,-3.15]} s={[0.5,0.25,0.05]} m={MS.emit} />
        <B p={[1.1, 2.8,-3.15]} s={[0.5,0.25,0.05]} m={MS.emit} />
      </group>
    </group>
  );
}

// ─── Station 13: Interior ─────────────────────────────────────────────────────
function InteriorScene() {
  return (
    <group position={[0,0,-192]}>
      <B p={[0,0,0]} s={[18,0.02,26]} m={ML.warmWood} />
      {/* Interior warm light — one strategic point light */}
      <pointLight position={[0,4,0]} intensity={5} color="#FFD0A0" distance={22} decay={2} />
      {/* Plywood wall panels — instanced */}
      <Instances geometry={GEO.box} material={ML.ply} limit={10}>
        {([-4,-1.5,1,3.5] as number[]).map((x,i) => (
          <Instance key={i} position={[x,2.5,-11.5]} scale={[2.2,5,0.05]} />
        ))}
        {/* Table top */}
        <Instance position={[0,0.88,0]} scale={[3.6,0.08,1.6]} />
        {/* Cabinet */}
        <Instance position={[-5,2,-4]} scale={[2.2,4,0.7]} />
      </Instances>
      <B p={[0,5.1,-11.5]}  s={[12,0.1,0.06]} m={MS.metalDk} />
      <B p={[0,-0.1,-11.5]} s={[12,0.2,0.06]} m={MS.metalDk} />
      {/* Table legs — instanced */}
      <Instances geometry={GEO.box} material={ML.warmWood} limit={20}>
        {([[-1.6,-0.7],[1.6,-0.7],[-1.6,0.7],[1.6,0.7]] as [number,number][]).map(([x,z],i) => (
          <Instance key={`tl${i}`} position={[x,0.44,z]} scale={[0.08,0.88,0.08]} />
        ))}
        {/* Chairs — 2 × (seat + back + 4 legs) = 12 meshes → instanced */}
        {([-2.5,2.5] as number[]).flatMap((x,ci) => [
          <Instance key={`cs${ci}`} position={[x,0.5,0]}    scale={[0.7,0.06,0.7]} />,
          <Instance key={`cb${ci}`} position={[x,0.9,-0.35]} scale={[0.7,0.8,0.06]} />,
          ...[[-0.3,-0.3],[0.3,-0.3],[-0.3,0.3],[0.3,0.3]].map(([cx,cz],j) => (
            <Instance key={`cl${ci}${j}`} position={[x+cx,0.25,cz]} scale={[0.06,0.5,0.06]} />
          )),
        ])}
        {/* Cabinet shelves */}
        <Instance position={[-5,2,-3.65]}  scale={[2.15,0.05,0.6]} />
        <Instance position={[-5,3.2,-3.65]} scale={[2.15,0.05,0.6]} />
      </Instances>
      {/* Window glass — opaque */}
      <B p={[6,3,-2]} s={[0.05,4,5]} m={MS.glassOp} />
      <pointLight position={[7,4,-2]} intensity={5} color="#FFE090" distance={18} decay={1.8} />
      <B p={[5,2.5,4]} s={[0.05,5,6]} m={ML.ply} />
      {/* Architectural Plywood Signature on Accent Wall */}
      <Text
        position={[4.95, 3.8, 4]}
        rotation={[0, -Math.PI / 2, 0]}
        fontSize={0.28}
        letterSpacing={0.14}
        color="#3E2008"
        anchorX="center"
        anchorY="middle"
        font="/fonts/Alpino-Variable.woff"
      >
        ECOLUSH PLY
      </Text>
      <Text
        position={[4.95, 3.48, 4]}
        rotation={[0, -Math.PI / 2, 0]}
        fontSize={0.11}
        letterSpacing={0.18}
        color="#8B5A2B"
        anchorX="center"
        anchorY="middle"
        font="/fonts/Alpino-Variable.woff"
      >
        ARCHITECTURAL INTERIORS
      </Text>
    </group>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function FactoryScene({ scrollProgress }: { scrollProgress: MutableRefObject<number> }) {
  const animRefs = useRef<AnimRefs>({});

  return (
    <>
      {/* ── Lighting: minimal but quality ─────────────────────────────────────
          1 directional (sun through skylights) — NO shadow (too expensive across 240 units)
          1 directional fill (cool blue sky bounce)
          1 ambient warm
          2 strategic point lights (quality + interior only)
          Emissive skylights bake the warm-ceiling feeling without extra lights */}
      <ambientLight intensity={0.55} color="#FFF0D8" />
      <directionalLight position={[8,18,10]} intensity={2.8} color="#FFE8C0" />
      <directionalLight position={[-10,8,-5]} intensity={0.6} color="#C8D8F0" />

      {/* Camera + all animations in ONE useFrame */}
      <SceneController progress={scrollProgress} anim={animRefs} />

      {/* World geometry */}
      <FactoryStructure />
      <TimberYard />
      <VeneerMachine anim={animRefs} />
      <ConveyorSection />
      <LayeringStation anim={animRefs} />
      <HydraulicPress anim={animRefs} />
      <CuttingMachine anim={animRefs} />
      <SandingMachine anim={animRefs} />
      <QualityStation />
      <PackagingArea />
      <ForkliftStation anim={animRefs} />
      <TruckAndDock anim={animRefs} />
      <InteriorScene />
    </>
  );
}
