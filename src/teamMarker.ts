import * as T from 'three';
// A broad, flat football-style selection ring remains visible outside the tyres.
export function createTeamMarker(color:string){
 const ring=new T.Mesh(new T.RingGeometry(2.13,2.43,64),new T.MeshBasicMaterial({color,side:T.DoubleSide,depthWrite:false,toneMapped:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}));
 ring.name='soccerTeamMarker';ring.userData.disposeMaterial=true;ring.rotation.x=-Math.PI/2;ring.position.y=.085;ring.renderOrder=2;
 const rim=new T.Mesh(new T.RingGeometry(2.43,2.51,64),new T.MeshBasicMaterial({color:'#172638',side:T.DoubleSide,depthWrite:false,toneMapped:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}));rim.userData.disposeMaterial=true;rim.renderOrder=2;ring.add(rim);return ring;
}
