import {DriverPortrait} from './characters';
const images=new Map<string,string>();
// Snapshot the existing models once. No extra animation loops or live WebGL contexts.
export function populateDriverThumbnails(root:HTMLElement,trial:boolean){
 const targets=Array.from(root.querySelectorAll<HTMLImageElement>('[data-driver-thumb]'));let portrait:DriverPortrait|undefined,host:HTMLDivElement|undefined;
 try{for(const image of targets){const id=Number(image.dataset.driverThumb),key=id+':'+trial;let url=images.get(key);
  if(!url){if(!host){host=document.createElement('div');host.style.cssText='position:fixed;left:-9999px;top:0;width:200px;height:160px;pointer-events:none';document.body.appendChild(host);portrait=new DriverPortrait(host,id,trial);portrait.renderer.setClearColor('#f5e6ca',0);portrait.camera.position.set(3.2,2.7,4.7);portrait.camera.lookAt(0,2,0);}else portrait!.select(id);portrait!.render(0,0);url=portrait!.renderer.domElement.toDataURL('image/png');images.set(key,url);}
  image.src=url;
 }}finally{if(portrait){portrait.dispose();portrait.renderer.forceContextLoss();}host?.remove();}
}
