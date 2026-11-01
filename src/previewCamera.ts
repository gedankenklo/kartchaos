import * as T from 'three';
// The overhead preview has no close-up geometry. Fit its depth range to the
// arena instead of spending almost all depth precision between 0.1 and 1 metre.
export function previewDepthRange(camera:T.PerspectiveCamera,bounds:T.Box3){
 camera.updateMatrixWorld(true);let nearest=Infinity,farthest=-Infinity;
 for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z]){const depth=-new T.Vector3(x,y,z).applyMatrix4(camera.matrixWorldInverse).z;nearest=Math.min(nearest,depth);farthest=Math.max(farthest,depth);}
 if(!Number.isFinite(nearest+farthest))return {near:1,far:900};
 const near=Math.max(1,nearest*.8),far=Math.max(near+1,farthest*1.15);return {near,far};
}
