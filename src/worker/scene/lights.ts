import { Color, DirectionalLight, Fog, HemisphereLight } from 'three';
import { Observable } from 'rxjs';
import { BACKGROUND_COLOR, BACKGROUND_COLOR_DIM, scene } from './scene';
import { WorkerMessageService } from '../../utils/message-service';

const bgColor = new Color(BACKGROUND_COLOR_DIM);
scene.background = new Color(bgColor);
scene.fog = new Fog(bgColor, 3, 10);

var targetIntensity = 1;
let card_time = 22;
let date = new Date();
var num_hh =	date.getHours();
if (num_hh > 19){
	var num_h =	0.3;
} else {
	var num_h =	date.getHours() * 0.1;
}
num_h = 0;
num_hh = 0;
var targetIntensity = num_h;


export let currentIntensity = 0;
const ambiantLight = new HemisphereLight(0xffffff, 0x444444);
ambiantLight.position.set(0, 20, 0);
scene.add(ambiantLight);

const light = new DirectionalLight(0xffffff);
light.position.set(1, 1, -1).normalize();
scene.add(light);

// 紙吹雪
import * as THREE from 'three';
function tick() {
	let s_rot = 0;
	let s_xp = 60;
	let s_yp = 20;
	const s_length = 10000;
	const s_plane_scale = 0.1;
	const s_plane = [];
	for(let i=0; i<s_length; i++){
		var color = "0x" + Math.floor(Math.random() * 16777215).toString(16);
		let geometry = new THREE.PlaneGeometry( s_plane_scale, s_plane_scale );
		if (num_hh == 0){
			var material = new THREE.MeshBasicMaterial({
				color: Number(color),
				opacity: 0.8,
				transparent: true,
				side: THREE.DoubleSide
			});
		} else {
			var material = new THREE.MeshBasicMaterial({
				color: 0x000000,
				opacity: 0.8,
				transparent: true,
				side: THREE.DoubleSide
			});
		}
		s_plane[i] = new THREE.Mesh( geometry, material );
		s_plane[i].position.x = s_xp * (Math.random() - 0.5);
		s_plane[i].position.y = s_yp * (Math.random() - 0.5);
		s_plane[i].position.z = s_yp * (Math.random() - 0.5);
		scene.add(s_plane[i]);
	}
	//for(let i=0; i<s_length; i++){
	//	s_plane[i].rotation.y += (Math.random()*0.1);
	//	s_plane[i].rotation.x += (Math.random()*0.1);
	//	s_plane[i].rotation.z += (Math.random()*0.1);
	//}   
	//requestAnimationFrame(tick);
}

console.log(card_time, num_h, num_hh);
if (card_time == num_hh || 0 == num_hh){
	tick();
}

export function init(updater: Observable<number>) {
  updater.subscribe(update);
}

export function update(deltaTime: number) {
  currentIntensity += (targetIntensity - currentIntensity) * Math.min(1, deltaTime * 4);
  ambiantLight.intensity = currentIntensity;
  light.intensity = 0.25+ 0.75 * currentIntensity;
  bgColor.set(BACKGROUND_COLOR_DIM).lerp(BACKGROUND_COLOR, currentIntensity);
  scene.fog?.color.set(bgColor);
  if (scene.background instanceof Color)
    scene.background.set(bgColor);
  else
    scene.background = bgColor.clone();
}

export function toggleLights() {
  targetIntensity = targetIntensity > 0 ? 0 : 1;
}

export function setLights(intensity: number) {
  targetIntensity = intensity;
}

WorkerMessageService.host.on({ setLights, toggleLights });
