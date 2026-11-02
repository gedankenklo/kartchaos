// Local Glacier layout units; shared by scenery, driving and projectiles.
export const GLACIER_SNOWMEN=[[-58,-25],[58,-25],[-18,48],[18,48],[-54,20],[54,20],[-20,-12],[20,-12],[0,-56],[-54,-54],[54,54]].map(([x,z])=>({x,z,r:1.15,height:4.3,bottom:0}));
export const GLACIER_TREE={x:0,z:12,r:2.6,height:12,bottom:3};
export const GLACIER_PROPS=[...GLACIER_SNOWMEN,GLACIER_TREE];
