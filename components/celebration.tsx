'use client';
import {useEffect,useRef,useState,type CSSProperties} from 'react';
import {Trophy,Sparkles,X} from 'lucide-react';
import {players,money,lotOf,type Game} from '@/lib/game';
type Award={player:number;price:number;record:boolean};
export function Celebration({game,myId}:{game:Game;myId?:string}){
 const seen=useRef<Set<number>|null>(null);
 const room=useRef(game.code);
 const [award,setAward]=useState<Award|null>(null);
 useEffect(()=>{
  const squad=myId?game.seats[myId]?.squad||[]:[];
  if(room.current!==game.code){seen.current=null;room.current=game.code;setAward(null)}
  if(!seen.current){seen.current=new Set(squad.map(s=>s.player));return}
  const fresh=squad.filter(s=>!seen.current!.has(s.player));
  squad.forEach(s=>seen.current!.add(s.player));
  if(fresh.length){const won=fresh.at(-1)!;const earlier=Object.values(game.seats).flatMap(s=>s.squad).filter(s=>lotOf(game,s.player)<lotOf(game,won.player));setAward({...won,record:earlier.length>0&&won.price>Math.max(...earlier.map(s=>s.price))})}
 },[game,myId]);
 useEffect(()=>{if(!award)return;const t=setTimeout(()=>setAward(null),3800);return()=>clearTimeout(t)},[award]);
 if(!award)return null;
 return <div className={`win-celebration ${award.record?'record-celebration':''}`} role="status" aria-live="polite" key={award.player}><div className="confetti" aria-hidden="true">{Array.from({length:24},(_,i)=><i key={i} style={{'--i':i,'--hue':(i*47)%360} as CSSProperties}/>)}</div><div className="win-card"><button aria-label="Dismiss celebration" onClick={()=>setAward(null)}><X size={17}/></button><div className="win-trophy" aria-hidden="true">{award.record?<Sparkles size={40}/>:<Trophy size={40}/>}</div><div><small>{award.record?'RECORD SIGNING · YOUR NEW SUPERSTAR':'SOLD TO YOU · WELCOME TO THE SQUAD'}</small><h2>{players[award.player].name}</h2><p>{money(award.price)}{award.record?' · Highest sale so far!':' · What a signing!'}</p></div></div></div>
}
