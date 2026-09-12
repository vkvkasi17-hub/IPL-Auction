'use client';
import {useState} from 'react';
import {UserRound} from 'lucide-react';
import portraits from '@/lib/player-portraits.json';
export function PlayerPortrait({name,compact=false}:{name:string;compact?:boolean}){
 const [failed,setFailed]=useState(false);
 const src=(portraits as Record<string,string>)[name];
 return <span className={`player-portrait ${compact?'portrait-small':''}`}>{src&&!failed?<img src={src} alt={name} loading={compact?'lazy':'eager'} decoding="async" onError={()=>setFailed(true)}/>:<span className="portrait-fallback"><UserRound aria-hidden="true"/><small>Photo unavailable</small></span>}</span>
}
