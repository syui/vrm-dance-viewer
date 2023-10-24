import { WebGLRenderer } from 'three';
import * as THREE from 'three';
export let renderer: WebGLRenderer | undefined;

export function init(canvas: HTMLCanvasElement) {
  if (!renderer) renderer = new WebGLRenderer({
    antialias: true,
    canvas,
  });
		//renderer.outputEncoding = THREE.sRGBEncoding;
		renderer.outputColorSpace = THREE.SRGBColorSpace;
		return renderer;
}
