import fs from 'node:fs';
const path=new URL('../public/maps/luoxia_town.tmj',import.meta.url);
const map=JSON.parse(fs.readFileSync(path,'utf8'));
const required=['Collision','Navigation','Spawn','NPC_Spawn','Interaction','Trigger','Region'];
const layers=new Map(map.layers.map(l=>[l.name,l]));
for(const name of required)if(!layers.has(name))throw new Error(`missing required layer: ${name}`);
if(map.tilewidth!==64||map.tileheight!==64)throw new Error('phase0 tile size must be 64x64');
const objs=map.layers.flatMap(l=>l.objects??[]);const names=new Set();
for(const o of objs){if(names.has(o.name))throw new Error(`duplicate object name: ${o.name}`);names.add(o.name);}
for(const id of ['spawn.town.default','npc.xiaobao.default','interaction.town.river-exit'])if(!names.has(id))throw new Error(`critical object missing: ${id}`);
const interaction=objs.find(o=>o.name==='interaction.town.river-exit');
const props=Object.fromEntries((interaction.properties??[]).map(p=>[p.name,p.value]));
if(props.interaction_id!=='interaction.town.river-exit'||props.action!=='enter_region'||props.target_region!=='river_gate')throw new Error('river exit interaction schema invalid');
console.log(`MAP_VALIDATION_OK ${map.width}x${map.height} tile=${map.tilewidth}`);
