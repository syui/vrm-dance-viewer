import './main.css';
import './i18n';
import { ajax } from 'rxjs/ajax';
import { canvas, loadAnimation, loadModel, toggleAutoRotate, toggleBloom, toggleLights } from './host';
import { setAutoShown, showMoreInfo } from './host/meta-display';
import registerStats from './host/status';
import { registerDropZone } from './utils/drag-drop';
import { showSnack } from './utils/tocas-helpers';
import { observeMediaQuery } from './utils/rx-helpers';
import { interceptEvent, isInFrame } from './utils/helper-functions';
import workerService from './host/worker-service';

const loadingPromises: Promise<any>[] = [];
let isLoading = false;
let hasLoadModel = false;
let card_time = 22;

function onFileSelected(files: FileList) {
  let animFile: File | undefined;
  let animType = '';
  let modelFile: File | undefined;
  for (const file of files) {
    if (animFile && modelFile) return;
    const name = file.name.toLowerCase();
    if (name.endsWith('.vrm')) {
      if (modelFile) continue;
      modelFile = file;
    } else if (name.endsWith('.vmd')) {
      if (animFile) continue;
      animFile = file;
      animType = 'vmd';
    } else if (name.endsWith('.bvh')) {
      if (animFile) continue;
      animFile = file;
      animType = 'bvh';
    }
  }
  if (modelFile) {
    loadingPromises.push(loadModel(modelFile));
    hasLoadModel = true;
  }
  if (animFile) loadingPromises.push(loadAnimation(animFile, animType));
  if (hasLoadModel) triggerLoading();
}

async function triggerLoading() {
  if (isLoading || !loadingPromises.length) return;
  isLoading = true;
  document.querySelector('#loading')?.classList.add('active');
  while (loadingPromises.length) {
    const wait = Array.from(loadingPromises, interceptLoadingError);
    loadingPromises.length = 0;
    await Promise.all(wait);
  }
  isLoading = false;
  document.querySelector('#loading')?.classList.remove('active');
}

function interceptLoadingError<T>(promise: Promise<T>) {
  return promise.catch(errorToSnackBar);
}

function errorToSnackBar(error?: any) {
  let message: string | undefined;
  if (typeof error?.message === 'string')
    message = error.message;
  if (message) showSnack(message);
}

const searchParams = new URLSearchParams(location.search);

const vrmUrl = searchParams.get('vrm');
if (vrmUrl)
  loadingPromises.push((async () => {
    const { response } = await ajax({
      url: vrmUrl,
      responseType: 'blob',
    }).toPromise();
    return loadModel(response);
  })());

const animUrl = searchParams.get('anim');
if (animUrl)
  loadingPromises.push((async () => {
    const { response } = await ajax({
      url: animUrl,
      responseType: 'blob',
    }).toPromise();
    let animType = searchParams.get('animtype');
    if (!animType) {
      if (animUrl.endsWith('.vmd'))
        animType = 'vmd';
      else if (animUrl.endsWith('.bvh'))
        animType = 'bvh';
      else
        animType = 'vmd';
    }
    return loadAnimation(response, animType);
  })());

const camX = searchParams.get('x');
if (camX) workerService.trigger('setCameraX', Number(camX));
const camY = searchParams.get('y');
if (camY) workerService.trigger('setCameraY', Number(camY));
const camZ = searchParams.get('z');
if (camZ) workerService.trigger('setCameraZ', Number(camZ));
const targetX = searchParams.get('tx');
if (targetX) workerService.trigger('setTargetX', Number(targetX));
const targetY = searchParams.get('ty');
if (targetY) workerService.trigger('setTargetY', Number(targetY));
const targetZ = searchParams.get('tz');
if (targetZ) workerService.trigger('setTargetZ', Number(targetZ));

let date = new Date();
var num_h =	date.getHours();
var model_url = "https://card.syui.ai/obj/ai.vrm";
var model_url_light = "https://card.syui.ai/obj/ai_v1.vrm";
var model_url_sword = "https://card.syui.ai/obj/ai_mode_sword_c.vrm";
var model_url_normal = "https://card.syui.ai/obj/ai_mode_normal_c.vrm";
var model_url_ai = "https://card.syui.ai/obj/ai_mode_ai_c.vrm";
var model_url_card = "https://card.syui.ai/obj/ai_card_v2.vrm";
var anime_url = "https://card.syui.ai/obj/motion_v0.bvh";
var item_url = "https://card.syui.ai/obj/ai_card_v2.vrm";
let num_model = Math.floor(Math.random() * 12) + 1

if (card_time == num_h){
	var model_url = model_url_card;
}	else if (num_model == 1) {
	var model_url = model_url_light;
} else if (num_model == 2) {
	var model_url = model_url_normal;
} else if (num_model == 3) {
	var model_url = model_url_ai;
} else if (num_model == 4) {
	var model_url = model_url_sword;
}

import axios, {isCancel, AxiosError} from 'axios';
function model_load(){
	axios.get(model_url, {
		responseType: "blob"
	})
	.then(response => {
		loadingPromises.push(loadModel(response.data));
		hasLoadModel = true;
  triggerLoading();
		const blob = new Blob([response.data], {
			type: response.data.type
		});
	})
}

function anime_load(){
	axios.get(anime_url, {
		responseType: "blob"
	})
	.then(response_anime => {
		loadingPromises.push(loadAnimation(response_anime.data, "bvh"));
		hasLoadModel = true;
  triggerLoading();
		const blob = new Blob([response_anime.data], {
			type: response_anime.data.type
		});
	})
}

function item_load(){
	axios.get(item_url, {
		responseType: "blob"
	})
	.then(response_item => {
		loadingPromises.push(loadModel(response_item.data));
		hasLoadModel = false;
  triggerLoading();
		const blob = new Blob([response_item.data], {
			type: response_item.data.type
		});
	})
}

if (model_url !== null) {
	model_load();
}

if (anime_url !== null && card_time == num_h){
	window.addEventListener('DOMContentLoaded', function(){
		setTimeout(() => {
			anime_load();
		}, 5000);
		setTimeout(() => {
			model_load();
		}, 10000);
	});
}

if (loadingPromises.length) triggerLoading();
