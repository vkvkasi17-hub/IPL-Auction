import {createHash,createHmac,timingSafeEqual} from 'node:crypto';
export const OWNER_TTL=8*60*60;
export function keyMatches(key:string,hash:string){
 if(!/^[a-f0-9]{64}$/.test(hash)||key.length>128)return false;
 return timingSafeEqual(createHash('sha256').update(key).digest(),Buffer.from(hash,'hex'));
}
export function ownerSession(hash:string,now=Date.now()){
 const expires=String(Math.floor(now/1000)+OWNER_TTL);
 return expires+'.'+createHmac('sha256',hash).update('owner:'+expires).digest('hex');
}
export function validOwnerSession(value:string,hash:string,now=Date.now()){
 if(!/^[a-f0-9]{64}$/.test(hash))return false;
 const [expires,signature,...extra]=value.split('.');
 if(extra.length||!/^\d{10}$/.test(expires||'')||! /^[a-f0-9]{64}$/.test(signature||''))return false;
 const remaining=Number(expires)-Math.floor(now/1000);
 if(remaining<=0||remaining>OWNER_TTL)return false;
 const expected=createHmac('sha256',hash).update('owner:'+expires).digest();
 return timingSafeEqual(expected,Buffer.from(signature,'hex'));
}
