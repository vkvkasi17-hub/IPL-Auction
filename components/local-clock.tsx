'use client';
import {useEffect,useState} from 'react';
export function LocalClock(){
 const [now,setNow]=useState<Date|null>(null);
 useEffect(()=>{const tick=()=>setNow(new Date());tick();const timer=setInterval(tick,1000);return()=>clearInterval(timer)},[]);
 const zone=now?Intl.DateTimeFormat().resolvedOptions().timeZone:'Local time';
 return <div className="local-clock" title={`Your device’s local time · ${zone}`}><time dateTime={now?.toISOString()}>{now?now.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit',second:'2-digit'}):'—:—:—'}</time><small>{now?now.toLocaleDateString([], {day:'numeric',month:'short',year:'numeric'}):'Local time'} <span>· {zone.replaceAll('_',' ')}</span></small></div>
}
