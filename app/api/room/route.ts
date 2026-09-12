import {env} from 'cloudflare:workers';
import {advance,bid,canBid,teams,type Game} from '@/lib/game';
export const dynamic='force-dynamic';
function database(){if(!env.DB)throw new Error('The auction service is unavailable. Please try again.');return env.DB}
function token(req:Request){return req.headers.get('cookie')?.match(/(?:^|; )paddle_session=([a-f0-9-]{36})/)?.[1]||crypto.randomUUID()}
function response(g:Game,t:string){return Response.json({...g,host:g.host===t?'you':'other',seats:Object.fromEntries(Object.entries(g.seats).map(([id,s])=>[id,{...s,token:undefined,mine:s.token===t}]))},{headers:{'Cache-Control':'no-store','Set-Cookie':`paddle_session=${t}; HttpOnly; SameSite=Lax; Path=/; Max-Age=2592000`}})}
async function handle(req:Request){try{
 const t=token(req),isPost=req.method==='POST';
 if(isPost&&req.headers.get('origin')&&req.headers.get('origin')!==new URL(req.url).origin)return Response.json({error:'Invalid request origin'},{status:403});
 const data=(isPost?await req.json():{code:new URL(req.url).searchParams.get('code'),action:'tick'}) as {action:string,code:string,team:string,name:string,solo?:boolean,round?:number,amount?:number};
 const db=database();
 if(data.action==='create'){
   if(!teams.some(x=>x.id===data.team)||typeof data.name!=='string'||!data.name.trim())throw new Error('Enter your name and choose a team.');
   const code=crypto.randomUUID().replaceAll('-','').slice(0,8).toUpperCase();
   const g:Game={code,host:t,phase:'lobby',seats:{},index:0,price:0,leader:null,deadline:0,nextBot:0,passed:[],log:['Auction room created. Welcome to the table.'],round:1};
   g.seats[data.team]={name:data.name.trim().slice(0,24),token:t,bot:false,purse:12000,squad:[]};
   if(data.solo){for(const team of teams)if(!g.seats[team.id])g.seats[team.id]={name:'Computer',token:'',bot:true,purse:12000,squad:[]};g.phase='live';g.deadline=Date.now()+14000;g.nextBot=Date.now()+3500}
   await db.prepare('INSERT INTO rooms (code,state,version) VALUES (?,?,0)').bind(code,JSON.stringify(g)).run();return response(g,t);
 }
 const code=String(data.code||'').trim().toUpperCase();
 if(!/^[A-F0-9]{8}$/.test(code))throw new Error('Enter a valid 8-character room code.');
 for(let attempt=0;attempt<8;attempt++){
   const row=await db.prepare('SELECT state,version FROM rooms WHERE code=?').bind(code).first<{state:string,version:number}>();if(!row)return Response.json({error:'Room not found. Check the code and try again.'},{status:404});
   const g:Game=JSON.parse(row.state);const mine=Object.keys(g.seats).find(id=>g.seats[id].token===t);
   if(data.action!=='join'&&!mine)return Response.json({error:'Join this room to see the auction.'},{status:403});
   advance(g,Date.now());
   if(data.action==='join'){
     if(!mine){if(g.phase!=='lobby')throw new Error('This auction has already started.');if(!teams.some(x=>x.id===data.team)||g.seats[data.team])throw new Error('That team is already taken. Choose another team.');if(typeof data.name!=='string'||!data.name.trim())throw new Error('Enter your name.');g.seats[data.team]={name:data.name.trim().slice(0,24),token:t,bot:false,purse:12000,squad:[]}}
   }else if(data.action==='start'){
     if(g.host!==t||g.phase!=='lobby')throw new Error('Only the host can start the auction.');for(const team of teams)if(!g.seats[team.id])g.seats[team.id]={name:'Computer',token:'',bot:true,purse:12000,squad:[]};g.phase='live';g.deadline=Date.now()+14000;g.nextBot=Date.now()+2500;
   }else if(data.action==='bid'){
     if(g.phase!=='live'||!mine||!canBid(g,mine))throw new Error('Bid unavailable: check your purse, squad limits, or current bid.');if(data.round!==g.round||data.amount!==(g.leader?g.price+(g.price<100?5:g.price<200?10:25):[200,100,30][g.index<18?0:g.index<40?1:2]))throw new Error('The bid changed. Review the new price and bid again.');bid(g,mine,Date.now());
   }else if(data.action==='pass'){
     if(g.phase!=='live'||!mine||g.leader===mine)throw new Error('You cannot pass while holding the highest bid.');if(!g.passed.includes(mine))g.passed.push(mine);
   }
   const updated=await db.prepare('UPDATE rooms SET state=?,version=version+1 WHERE code=? AND version=?').bind(JSON.stringify(g),code,row.version).run();if(updated.meta.changes)return response(g,t);
 }
 return Response.json({error:'The auction is busy. Please try your bid again.'},{status:409});
 }catch(e){return Response.json({error:e instanceof Error?e.message:'Unable to connect to the auction.'},{status:400})}}
export const GET=handle;
export const POST=handle;
