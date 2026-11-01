import * as T from 'three';
import {neonHeight} from './terrain';
export function placeNeonRimMarker(mesh:T.Mesh,index:number){const a=index*Math.PI/8,r=35.3;mesh.name='neonRimMarker';mesh.position.set(Math.sin(a)*r,neonHeight(r)+.35,Math.cos(a)*r);mesh.rotation.set(0,a,0);mesh.rotateX(-Math.atan(.3));mesh.castShadow=false;mesh.receiveShadow=false;return mesh;}
export function createNeonCityGround(){const ground=new T.Mesh(new T.RingGeometry(180,340,96),new T.MeshBasicMaterial({color:'#384159',side:T.DoubleSide}));ground.name='neonCityGround';ground.rotation.x=-Math.PI/2;ground.position.y=-2;return ground;}
