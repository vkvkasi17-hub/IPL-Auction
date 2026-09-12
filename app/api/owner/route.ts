import {env} from 'cloudflare:workers';
import {keyMatches,ownerSession,validOwnerSession,OWNER_TTL} from '@/lib/owner-auth';
import {type Game,currentPlayer,players} from '@/lib/game';
export const dynamic='force-dynamic';
const headers={'Cache-Control':'no-store, private','X-Robots-Tag':'noindex, nofollow','Vary':'Cookie'};
const reply=(body:unknown,status=200,cookie?:string)=>Response.json(body,{status,headers:{...headers,...(cookie?{'Set-Cookie':cookie}:{})}});
const sessionCookie=(value:string,req:Request,age=OWNER_TTL)=>`auction_owner=${value}; HttpOnly; SameSite=Strict; Path=/api/owner; Max-Age=${age}${new URL(req.url).protocol==='https:'?'; Secure':''}`;
const secret=()=>env.OWNER_ACCESS_HASH||'';
export async function POST(req:Request){
 if(req.headers.get('origin')!==new URL(req.url).origin)return reply({error:'Invalid request origin.'},403);
 if(!secret())return reply({error:'Owner access has not been configured.'},503);
 const reader=req.body?.getReader();let body='';
 if(reader){const decoder=new TextDecoder();for(;;){const {done,value}=await reader.read();if(done)break;if(body.length+value.length>1024){await reader.cancel();return reply({error:'Request too large.'},413)}body+=decoder.decode(value,{stream:true})}}
 try{const input=JSON.parse(body);if(input.action==='logout')return reply({ok:true},200,sessionCookie('',req,0));
 if(typeof input.key!=='string'||!keyMatches(input.key,secret()))return reply({error:'That owner key is not valid.'},401);
 return reply({ok:true},200,sessionCookie(ownerSession(secret()),req));
 }catch{return reply({error:'Invalid request.'},400)}
}
export async function GET(req:Request){
 if(!secret())return reply({error:'Owner access has not been configured.'},503);
 const cookie=req.headers.get('cookie')?.match(/(?:^|; )auction_owner=([^;]+)/)?.[1]||'';
 if(!validOwnerSession(cookie,secret()))return reply({error:'Sign in to view your rooms.'},401);
 if(!env.DB)return reply({error:'Database unavailable.'},503);
 const params=new URL(req.url).searchParams,search=(params.get('search')||'').trim().toUpperCase(),before=params.get('before');
 if(!/^[A-F0-9]{0,8}$/.test(search)||(before&&!/^\d{1,15}$/.test(before)))return reply({error:'Enter up to eight room-code characters.'},400);
 try{
 const [list,stats]=await Promise.all([
 env.DB.prepare('SELECT rowid AS position,code,state FROM rooms WHERE code LIKE ? AND rowid < ? ORDER BY rowid DESC LIMIT 51').bind(search+'%',before?Number(before):Number.MAX_SAFE_INTEGER).all<{position:number;code:string;state:string}>(),
 env.DB.prepare("SELECT count(*) AS total, sum(CASE WHEN json_extract(state,'$.phase')='lobby' THEN 1 ELSE 0 END) AS waiting, sum(CASE WHEN json_extract(state,'$.phase') IN ('live','sold') THEN 1 ELSE 0 END) AS underway, sum(CASE WHEN json_extract(state,'$.phase')='finished' THEN 1 ELSE 0 END) AS finished FROM rooms").first()
 ]);
 const page=list.results.slice(0,50);
 const rooms=page.map(row=>{const game:Game=JSON.parse(row.state),seats=Object.values(game.seats),sold=seats.flatMap(s=>s.squad);return {code:row.code,phase:game.phase,humans:seats.filter(s=>!s.bot).length,computers:seats.filter(s=>s.bot).length,lot:Math.min(game.index+1,game.order?.length||players.length),player:game.phase==='finished'?'Auction complete':currentPlayer(game)?.name||'Unknown player',sold:sold.length,spent:sold.reduce((sum,s)=>sum+s.price,0)}});
 return reply({rooms,stats,next:list.results.length>50?String(page.at(-1)!.position):null});
 }catch{return reply({error:'Unable to load rooms. Try again.'},500)}
}
