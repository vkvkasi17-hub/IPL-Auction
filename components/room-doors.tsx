'use client';
import {useEffect,useState} from 'react';
import {Gavel} from 'lucide-react';
export function RoomDoors(){
 const [visible,setVisible]=useState(true);
 useEffect(()=>{const t=setTimeout(()=>setVisible(false),2600);return()=>clearTimeout(t)},[]);
 if(!visible)return null;
 return <div className="room-doors" aria-hidden="true"><div className="door-light"/><div className="auction-door door-left"><span>IPL MOCK</span><i/></div><div className="auction-door door-right"><span>AUCTION</span><i/></div><div className="door-welcome"><Gavel size={34}/><b>Your seat awaits.</b></div></div>
}
