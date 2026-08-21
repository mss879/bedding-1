"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

/*
 * Flowing silk: layered value-noise folds drifting slowly across an ivory →
 * champagne → dusty-blue palette, with a soft moving satin sheen band.
 */
const FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uRes;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p = p * 2.03 + vec2(11.3, 7.9);
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    float aspect = uRes.x / max(uRes.y, 1.0);
    vec2 p = vec2(uv.x * aspect, uv.y);
    float t = uTime * 0.055;

    // Slow, layered fabric folds
    float folds = fbm(p * 2.1 + vec2(t * 0.6, -t * 0.35));
    folds += 0.5 * fbm(p * 4.4 - vec2(t * 0.4, t * 0.25));
    folds /= 1.5;

    // Ivory paper base -> champagne in the folds, dusty blue in the shadow
    vec3 paper = vec3(0.984, 0.976, 0.965);   // #FBF9F6 (cream)
    vec3 cream = vec3(0.949, 0.914, 0.855);   // #F2E9DA (beeswax)
    vec3 tint  = vec3(0.929, 0.886, 0.816);   // #EDE2D0 (accent-tint)
    vec3 mist = vec3(0.616, 0.698, 0.753); // #9DB2C0 (mist)

    vec3 col = mix(paper, cream, smoothstep(0.25, 0.85, folds));
    col = mix(col, tint, smoothstep(0.55, 0.95, fbm(p * 1.3 + vec2(-t, t * 0.5))));

    // Diagonal satin sheen sweeping through
    float sheen = sin((uv.x + uv.y) * 4.5 - uTime * 0.22 + folds * 3.0);
    col += vec3(0.035) * smoothstep(0.55, 1.0, sheen);

    // Whisper of dusty blue along fold ridges, strongest lower-right
    float ridge = smoothstep(0.62, 0.78, folds) * (1.0 - smoothstep(0.78, 0.94, folds));
    col = mix(col, mist, ridge * 0.22 * smoothstep(0.2, 1.0, uv.x + (1.0 - uv.y)));

    // Gentle vignette keeps edges calm behind text
    float vig = smoothstep(1.25, 0.45, distance(uv, vec2(0.42, 0.55)));
    col = mix(col, tint, 1.0 - vig * 0.5);

    gl_FragColor = vec4(col, 1.0);
  }
`;

/**
 * WebGL fabric shader that fills its parent. Sits behind hero content on a
 * CSS gradient fallback, so WebGL failure or reduced motion still looks right.
 * DPR capped, paused when offscreen, fully disposed on unmount.
 */
export function FabricCanvas({ className }: { className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "low-power" });
    } catch {
      return; // fallback gradient behind us does the job
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.inset = "0";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const uniforms = {
      uTime: { value: 0 },
      uRes: { value: new THREE.Vector2(1, 1) },
    };
    const material = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms,
    });
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(quad);

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = host;
      if (w === 0 || h === 0) return;
      renderer.setSize(w, h, false);
      uniforms.uRes.value.set(w, h);
      renderer.render(scene, camera);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(host);
    resize();

    let raf = 0;
    let visible = true;
    const start = performance.now();

    const loop = () => {
      uniforms.uTime.value = (performance.now() - start) / 1000;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(loop);
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible && !reduce) raf = requestAnimationFrame(loop);
    });
    io.observe(host);

    if (reduce) {
      // Single still frame — the fabric texture without the motion.
      uniforms.uTime.value = 12;
      renderer.render(scene, camera);
    } else {
      raf = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      quad.geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div
      ref={hostRef}
      aria-hidden
      className={`absolute inset-0 overflow-hidden ${className ?? ""}`}
      style={{
        background:
          "linear-gradient(120deg, #F2E9DA 0%, #FBF9F6 45%, #EDE2D0 100%)",
      }}
    />
  );
}
