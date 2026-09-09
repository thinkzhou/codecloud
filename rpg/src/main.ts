import * as Phaser from 'phaser';
import { NavigationGrid, type GridPoint } from './pathfinding';

type Prop = { name: string; value: unknown };
type Obj = { id:number; name:string; type:string; x:number; y:number; width?:number; height?:number; properties?:Prop[] };
type Layer = { name:string; type:string; objects?:Obj[] };
type MapJson = { width:number; height:number; tilewidth:number; tileheight:number; layers:Layer[] };
type Interaction = { id:string; action:string; x:number; y:number; targetRegion?:string };

type TestApi = {
  ready:boolean;
  getState:()=>{mapId:string;region:string;moving:boolean;dialogue:boolean;phaserVersion:string};
  getPlayer:()=>{x:number;y:number};
  getNpcScreenPosition:(id:string)=>{x:number;y:number}|null;
  requestInteraction:(id:string)=>boolean;
};
declare global { interface Window { __RPG_TEST__?: TestApi } }

const prop=(obj:Obj,name:string)=>obj.properties?.find(p=>p.name===name)?.value;

class GreyboxScene extends Phaser.Scene {
  private map!:MapJson;
  private nav!:NavigationGrid;
  private player!:Phaser.GameObjects.Rectangle;
  private npcs=new Map<string,Phaser.GameObjects.Rectangle>();
  private interactions=new Map<string,Interaction>();
  private path:{x:number;y:number}[]=[];
  private onArrive:(()=>void)|null=null;
  private region='temple';
  private readonly speed=190;

  constructor(){ super('Greybox'); }
  preload(){ this.load.json('luoxia','maps/luoxia_town.tmj'); }

  create(){
    this.map=this.cache.json.get('luoxia') as MapJson;
    const worldW=this.map.width*this.map.tilewidth, worldH=this.map.height*this.map.tileheight;
    this.cameras.main.setBounds(0,0,worldW,worldH);
    this.add.rectangle(worldW/2,worldH/2,worldW,worldH,0x6f7658).setDepth(-20);
    this.drawRegions();
    this.buildNavigation();
    this.drawCollisions();

    const spawn=this.objects('Spawn').find(o=>o.name==='spawn.town.default');
    if(!spawn) throw new Error('spawn.town.default missing');
    this.player=this.add.rectangle(spawn.x,spawn.y,32,48,0xc8b184).setStrokeStyle(2,0x3a2d20).setDepth(20);
    this.add.text(spawn.x,spawn.y-38,'主角',{fontSize:'12px',color:'#fff1cb',backgroundColor:'#30271ecc',padding:{x:4,y:2}}).setOrigin(.5).setDepth(21);

    this.spawnNpcs();
    this.spawnInteractions();
    this.cameras.main.startFollow(this.player,false,.12,.12);
    this.cameras.main.setDeadzone(92,150);
    this.input.on('pointerdown',(pointer:Phaser.Input.Pointer)=>this.walkToWorld(pointer.worldX,pointer.worldY));

    document.getElementById('status')!.textContent='土地庙 · Phaser '+Phaser.VERSION;
    document.getElementById('dialogue-next')!.addEventListener('click',()=>this.hideDialogue());
    this.installTestApi();
  }

  update(_time:number,delta:number){
    if(!this.path.length)return;
    const target=this.path[0], dx=target.x-this.player.x, dy=target.y-this.player.y;
    const dist=Math.hypot(dx,dy), step=this.speed*(delta/1000);
    if(dist<=step){
      this.player.setPosition(target.x,target.y); this.path.shift();
      if(!this.path.length){const cb=this.onArrive;this.onArrive=null;cb?.();}
      return;
    }
    this.player.x+=dx/dist*step; this.player.y+=dy/dist*step;
  }

  private objects(layer:string){ return this.map.layers.find(l=>l.name===layer)?.objects??[]; }

  private drawRegions(){
    for(const o of this.objects('Region')){
      const color=o.name==='region.main-road'?0x9b8b6d:0x7e745f;
      this.add.rectangle(o.x+(o.width??0)/2,o.y+(o.height??0)/2,o.width??64,o.height??64,color,.9).setDepth(-10);
    }
    this.add.text(520,720,'土地庙',{fontSize:'26px',fontFamily:'serif',color:'#382d20'}).setDepth(-5);
    this.add.text(1950,940,'→ 青石河',{fontSize:'22px',fontFamily:'serif',color:'#e8d7b4'}).setDepth(-5);
  }

  private buildNavigation(){
    this.nav=new NavigationGrid(this.map.width,this.map.height);
    for(const o of this.objects('Collision')){
      const minX=Math.floor(o.x/this.map.tilewidth), maxX=Math.floor((o.x+(o.width??1)-1)/this.map.tilewidth);
      const minY=Math.floor(o.y/this.map.tileheight), maxY=Math.floor((o.y+(o.height??1)-1)/this.map.tileheight);
      for(let y=minY;y<=maxY;y++)for(let x=minX;x<=maxX;x++)this.nav.setBlocked(x,y,true);
    }
  }

  private drawCollisions(){
    for(const o of this.objects('Collision')) this.add.rectangle(o.x+(o.width??0)/2,o.y+(o.height??0)/2,o.width??1,o.height??1,0x473c2f,.95).setDepth(2);
  }

  private spawnNpcs(){
    for(const o of this.objects('NPC_Spawn')){
      const id=String(prop(o,'npc_id')??o.name);
      const npc=this.add.rectangle(o.x,o.y,38,50,0x825843).setStrokeStyle(2,0x2e211a).setDepth(18).setInteractive({useHandCursor:true});
      this.add.text(o.x,o.y-39,id==='xiaobao'?'小宝':id,{fontSize:'12px',color:'#fff1cf',backgroundColor:'#34251acc',padding:{x:4,y:2}}).setOrigin(.5).setDepth(19);
      npc.on('pointerdown',(_p:Phaser.Input.Pointer,_x:number,_y:number,event:any)=>{event?.stopPropagation?.();this.requestTalk(id);});
      this.npcs.set(id,npc);
    }
  }

  private spawnInteractions(){
    for(const o of this.objects('Interaction')){
      const id=String(prop(o,'interaction_id')??o.name);
      const target=prop(o,'target_region');
      const interaction:Interaction={id,action:String(prop(o,'action')??'examine'),x:o.x,y:o.y,targetRegion:typeof target==='string'?target:undefined};
      this.interactions.set(id,interaction);
      const marker=this.add.circle(o.x,o.y,22,0x89a8bd,.72).setStrokeStyle(2,0xf3e6bd).setDepth(12).setInteractive({useHandCursor:true});
      marker.on('pointerdown',(_p:Phaser.Input.Pointer,_x:number,_y:number,event:any)=>{event?.stopPropagation?.();this.executeInteraction(interaction);});
    }
  }

  private worldToGrid(x:number,y:number):GridPoint{return{x:Math.floor(x/this.map.tilewidth),y:Math.floor(y/this.map.tileheight)}}
  private gridToWorld(p:GridPoint){return{x:p.x*this.map.tilewidth+this.map.tilewidth/2,y:p.y*this.map.tileheight+this.map.tileheight/2}}

  private walkToWorld(x:number,y:number,onArrive?:()=>void){
    const cells=this.nav.findPath(this.worldToGrid(this.player.x,this.player.y),this.worldToGrid(x,y));
    if(!cells.length)return false;
    this.path=cells.slice(1).map(p=>this.gridToWorld(p)); this.onArrive=onArrive??null; return true;
  }

  private requestTalk(id:string){
    const npc=this.npcs.get(id); if(!npc)return false;
    return this.walkToWorld(npc.x-58,npc.y,()=>this.showDialogue(id,id==='xiaobao'?'哥，你今天又没吃饱吧？河边最近有鱼。':'……'));
  }

  private executeInteraction(inter:Interaction){
    return this.walkToWorld(inter.x-52,inter.y,()=>{
      if(inter.action==='enter_region'&&inter.targetRegion){
        this.region=inter.targetRegion;
        document.getElementById('status')!.textContent=(inter.targetRegion==='river_gate'?'青石河路口':inter.targetRegion)+' · Phaser '+Phaser.VERSION;
      }
    });
  }

  private showDialogue(id:string,text:string){
    document.getElementById('speaker')!.textContent=id==='xiaobao'?'小宝':id;
    document.getElementById('dialogue-text')!.textContent=text;
    document.getElementById('dialogue')!.hidden=false;
  }
  private hideDialogue(){document.getElementById('dialogue')!.hidden=true;}

  private installTestApi(){
    if(!new URLSearchParams(location.search).has('test'))return;
    window.__RPG_TEST__={
      ready:true,
      getState:()=>({mapId:'luoxia_town',region:this.region,moving:this.path.length>0,dialogue:!document.getElementById('dialogue')!.hidden,phaserVersion:Phaser.VERSION}),
      getPlayer:()=>({x:this.player.x,y:this.player.y}),
      getNpcScreenPosition:(id:string)=>{const n=this.npcs.get(id);return n?{x:n.x-this.cameras.main.scrollX,y:n.y-this.cameras.main.scrollY}:null;},
      requestInteraction:(id:string)=>{const i=this.interactions.get(id);return i?this.executeInteraction(i):false;}
    };
  }
}

const config:Phaser.Types.Core.GameConfig={
  type:Phaser.AUTO,
  parent:'game',
  width:390,
  height:844,
  backgroundColor:'#3c4435',
  scene:[GreyboxScene],
  scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH,width:390,height:844},
  render:{antialias:true}
};
new Phaser.Game(config);
