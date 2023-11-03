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

let api_url_local = "https://api.syui.ai/users/"
let url = new URL(window.location.href);
const params = new URLSearchParams(window.location.search);

if(url.hostname == "vrm.syui.ai"){
		var api_url = "";
}

if(url.hostname == "localhost"){
	if(params.get('id') != null){
		var api_url = "/api/users/" + params.get('id');
	} else {
		var api_url = "/api/users/" + 2;
	}
} else {
	if(params.get('id') != null){
		var api_url = api_url_local + params.get('id');
	} else {
		var api_url = api_url_local + 2;
	}
}

let date = new Date();
var num_h =	date.getHours();
var test_url = "https://card.syui.ai/obj/"
var test_url = "./obj/"
var model_url = test_url + "ai.vrm";
var model_url_default = test_url + "ai.vrm";
var model_url_light = test_url + "ai_mode_zen_light.vrm";
var model_url_ten = test_url + "ai_mode_ten.vrm";
var model_url_sword = test_url + "ai_mode_sword.vrm";
var model_url_sword_hand = test_url + "ai_mode_sword_hand.vrm";
var model_url_normal = test_url + "ai_mode_normal.vrm";
var model_url_ai = test_url + "ai_mode_ai.vrm";
var model_url_card = test_url + "ai_mode_card.vrm";
var anime_url = test_url + "motion_v0.bvh";
var item_url = test_url + "ai_mode_sword.vrm";
let num_model = Math.floor(Math.random() * 12) + 1

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

function status_load(){
		axios.get(api_url, {
			responseType: "json"
		})
		.then(res => {
			let html_menu = document.querySelector('#menu') as HTMLInputElement | null;
			let html_model = document.getElementById('btn-models') as HTMLInputElement | null
			let html_model_a = document.getElementById('btn-models_a') as HTMLInputElement | null
			let html_model_b = document.getElementById('btn-models_b') as HTMLInputElement | null
			let html_model_c = document.getElementById('btn-models_c') as HTMLInputElement | null
			let html_model_d = document.getElementById('btn-models_d') as HTMLInputElement | null

			//if (res.data.model === true){
			//	model_load();
			//}

			if (res.data.model === false && html_menu != null){
				html_menu.insertAdjacentHTML('afterbegin', "<li>model : " + res.data.model + "</li>");
				html_menu.insertAdjacentHTML('afterbegin', "<li>@" + res.data.username + "</li>");
			}

			if (res.data.model === true && html_menu != null){
				html_menu.insertAdjacentHTML('afterbegin', "<li>limit : Lv " + res.data.model_limit + "</li>");
				html_menu.insertAdjacentHTML('afterbegin', "<li>skill : Lv " + res.data.model_skill + "</li>");
				html_menu.insertAdjacentHTML('afterbegin', "<li>attack : Lv " + res.data.model_attach + "</li>");
				html_menu.insertAdjacentHTML('afterbegin', "<li>mode : Lv " + res.data.model_mode + "</li>");
				html_menu.insertAdjacentHTML('afterbegin', "<li>model : " + res.data.model + "</li>");
				html_menu.insertAdjacentHTML('afterbegin', "<li>@" + res.data.username + "</li>");
			} 

			if (res.data.model_skill === 0 && html_model != null){
				html_model.style.display = "none"; 
			} 
			if (res.data.model_limit === 0 && html_model_a != null){
				html_model_a.style.display = "none"; 
			} 
			if (res.data.model_attach === 0 && html_model_b != null){
				html_model_b.style.display = "none"; 
			} 
			if (res.data.model_mode === 0 && html_model_c != null){
				html_model_c.style.display = "none"; 
			} 
			if (res.data.model === false && html_model_d != null){
				html_model_d.style.display = "none"; 
			} 
		})
}

if (model_url !== null) {
	status_load();
	model_load();
}

function getModels(a?:string){
	if (a == "card"){
		var model_url = model_url_card;
	} else if (a == "ten"){
		var model_url = model_url_ten;
	} else if (a == "sword"){
		var model_url = model_url_sword_hand;
	} else if (a == "sword_out"){
		var model_url = model_url_sword;
	} else if (a == "ai"){
		var model_url = model_url_light;
	} else if (a == "ai_normal"){
		var model_url = model_url_ai;
	} else {
		var model_url = model_url_default;
	}
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


function getMenus() {
		var x = document.querySelector('#menu') as HTMLInputElement | null;
		if (x != null) {
			if (x.style.display === "none") {
				x.style.display = "block";
			} else {
				x.style.display = "none";
			}
		}
}

const el = document.querySelector('#btn-models') as HTMLInputElement | null;
if(el != null) {
	el.addEventListener('click', (e:Event) => getModels(el.value));
}
const ela = document.querySelector('#btn-models_a') as HTMLInputElement | null;
if(ela != null) {
	ela.addEventListener('click', (e:Event) => getModels(ela.value));
}
const elb = document.querySelector('#btn-models_b') as HTMLInputElement | null;
if(elb != null) {
	elb.addEventListener('click', (e:Event) => getModels(elb.value));
	elb.addEventListener('click', function(){
		setTimeout(() => {
			item_load();
		}, 7000);
	});
}

const elc = document.querySelector('#btn-models_c') as HTMLInputElement | null;
if(elc != null) {
	elc.addEventListener('click', (e:Event) => getModels(elc.value));
}
const eld = document.querySelector('#btn-models_d') as HTMLInputElement | null;
if(eld != null) {
	eld.addEventListener('click', (e:Event) => getModels(eld.value));
}

const el_menu = document.querySelector('#btn-menu') as HTMLInputElement | null;
if(el_menu != null) {
	el_menu.addEventListener('click', (e:Event) => getMenus());
}

if (loadingPromises.length) triggerLoading();
