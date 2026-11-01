import * as T from 'three';
import {NEON_RIM_MARKERS,NEON_RIM_SHAPE} from './neonRim';
export function placeNeonRimMarker(mesh:T.Mesh,index:number){const marker=NEON_RIM_MARKERS[index];mesh.name='neonRimMarker';mesh.position.set(marker.x,marker.y,marker.z);mesh.rotation.set(0,marker.angle,0);mesh.rotateX(-NEON_RIM_SHAPE.tilt);mesh.castShadow=false;mesh.receiveShadow=false;return mesh;}
export function createNeonCityGround(){const ground=new T.Mesh(new T.RingGeometry(180,340,96),new T.MeshBasicMaterial({color:'#384159',side:T.DoubleSide}));ground.name='neonCityGround';ground.rotation.x=-Math.PI/2;ground.position.y=-2;return ground;}
