export type GridPoint = { x: number; y: number };

type Node = GridPoint & { g: number; h: number; f: number; parent?: Node };

export class NavigationGrid {
  private blocked = new Set<string>();
  constructor(public readonly width: number, public readonly height: number) {}
  private key(x:number,y:number){return `${x},${y}`;}
  setBlocked(x:number,y:number,blocked=true){
    if(x<0||y<0||x>=this.width||y>=this.height)return;
    const k=this.key(x,y); if(blocked)this.blocked.add(k); else this.blocked.delete(k);
  }
  isWalkable(x:number,y:number){return x>=0&&y>=0&&x<this.width&&y<this.height&&!this.blocked.has(this.key(x,y));}
  nearestWalkable(target:GridPoint, maxRadius=8):GridPoint|null{
    if(this.isWalkable(target.x,target.y)) return target;
    for(let r=1;r<=maxRadius;r++){
      for(let y=target.y-r;y<=target.y+r;y++) for(let x=target.x-r;x<=target.x+r;x++){
        if(Math.abs(x-target.x)!==r&&Math.abs(y-target.y)!==r) continue;
        if(this.isWalkable(x,y)) return {x,y};
      }
    }
    return null;
  }
  findPath(start:GridPoint, requestedTarget:GridPoint):GridPoint[]{
    const target=this.nearestWalkable(requestedTarget); if(!target)return [];
    if(start.x===target.x&&start.y===target.y)return [start];
    const open:Node[]=[]; const best=new Map<string,number>(); const closed=new Set<string>();
    const heuristic=(a:GridPoint,b:GridPoint)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y);
    open.push({...start,g:0,h:heuristic(start,target),f:heuristic(start,target)});
    while(open.length){
      open.sort((a,b)=>a.f-b.f); const current=open.shift()!; const ck=this.key(current.x,current.y);
      if(closed.has(ck))continue; closed.add(ck);
      if(current.x===target.x&&current.y===target.y){const out:GridPoint[]=[];let n:Node|undefined=current;while(n){out.push({x:n.x,y:n.y});n=n.parent;}return out.reverse();}
      const neighbors=[[1,0],[-1,0],[0,1],[0,-1]];
      for(const [dx,dy] of neighbors){const x=current.x+dx,y=current.y+dy,k=this.key(x,y);if(!this.isWalkable(x,y)||closed.has(k))continue;const g=current.g+1;if((best.get(k)??Infinity)<=g)continue;best.set(k,g);const h=heuristic({x,y},target);open.push({x,y,g,h,f:g+h,parent:current});}
    }
    return [];
  }
}
