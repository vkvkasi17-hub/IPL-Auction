import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {transformSync} from 'esbuild';
const js=transformSync(readFileSync('lib/game.ts','utf8'),{loader:'ts',format:'esm'}).code;
const {advance,bid,canBid,teams,players,isRecordSale,auctionResults,createAuctionOrder,currentPlayer,nextPrice,bidIncrement}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
const g={order:createAuctionOrder(),code:'TEST',host:'x',phase:'live',seats:Object.fromEntries(teams.map(t=>[t.id,{name:'AI',token:'',bot:true,purse:12000,squad:[]}])),index:0,price:0,leader:null,deadline:14000,nextBot:2500,passed:[],log:[],round:1};
for(let now=3000;now<100000000&&g.phase!=='finished';now+=2000)advance(g,now);
assert.equal(g.phase,'finished');const won=[];for(const s of Object.values(g.seats)){assert.ok(s.purse>=0);assert.ok(s.squad.length<=25);assert.ok(s.squad.filter(x=>players[x.player].country!=='India').length<=8);assert.equal(s.purse+s.squad.reduce((n,x)=>n+x.price,0),12000);won.push(...s.squad.map(x=>x.player))}assert.equal(new Set(won).size,won.length);assert.ok(won.length>0);
const last=structuredClone(g);advance(g,99999999);assert.deepEqual(g,last);
const constrained={...g,order:undefined,phase:'live',index:2,leader:null,price:0,passed:[]};constrained.seats.CSK.purse=0;assert.equal(canBid(constrained,'CSK'),false);constrained.seats.CSK.purse=12000;constrained.seats.CSK.squad=Array(8).fill({player:2,price:200});assert.equal(canBid(constrained,'CSK'),false);
console.log('PASS: complete expanded AI auction, no duplicate awards, exact purse accounting, squad caps, overseas caps, unaffordable bid rejection, stable completion.');

const lobby={...structuredClone(g),phase:'lobby',deadline:0,nextBot:0,index:0};const untouched=structuredClone(lobby);advance(lobby,999999999);assert.deepEqual(lobby,untouched);console.log('PASS: lobby never advances timers or computer bids.');

const record={...structuredClone(g),order:undefined,index:1,phase:'live',leader:'CSK',price:500,seats:{CSK:{name:'Host',token:'x',bot:false,purse:11000,squad:[{player:0,price:200}]}}};
assert.equal(isRecordSale(record),false,'live prices must never announce a record');
record.phase='sold';assert.equal(isRecordSale(record),false,'sale must be awarded');
record.seats.CSK.squad.push({player:1,price:500});assert.equal(isRecordSale(record),true);
record.seats.CSK.squad[1].price=200;assert.equal(isRecordSale(record),false,'ties do not beat record');
record.phase='finished';assert.equal(isRecordSale(record),false);
console.log('PASS: record banner only for confirmed sold award above previous sales, never live bids or ties.');

assert.ok(players.length>300);assert.equal(new Set(players.map(p=>p.name.toLowerCase().replace(/[^a-z]/g,''))).size,players.length);players.forEach((p,i)=>{assert.equal(p.id,i);assert.ok(['BAT','BOWL','WK','AR'].includes(p.role));assert.ok(p.country);assert.ok(p.base>0)});assert.equal(players[0].name,'Rishabh Pant');assert.equal(players[59].name,'Prithvi Shaw');console.log(`PASS: ${players.length} unique players, valid roles and stable legacy IDs.`);

const outcomeGame={...structuredClone(record),phase:'live',index:2};
let history=auctionResults(outcomeGame);assert.equal(history.length,2);assert.equal(history.find(r=>r.player.id===0).price,200);
outcomeGame.index=3;history=auctionResults(outcomeGame);assert.equal(history[0].player.id,2);assert.equal(history[0].team,undefined);assert.equal(history[0].price,0);
assert.ok(!history.some(r=>r.player.id===3),'active player must not be marked unsold');
outcomeGame.phase='sold';history=auctionResults(outcomeGame);assert.equal(history[0].player.id,3);assert.equal(history[0].team,undefined);
console.log('PASS: final sold prices and unsold outcomes, excluding unfinished lots.');

assert.equal(auctionResults({...outcomeGame,phase:'finished',index:60}).length,60,'legacy finished rooms must not label newly appended players unsold');

for(const [price,increment] of [[10,10],[90,10],[99,10],[100,20],[480,20],[499,20],[500,25],[975,25],[999,25],[1000,30],[2000,30]])assert.equal(bidIncrement(price),increment);
const order=createAuctionOrder();assert.equal(order.length,players.length);assert.equal(new Set(order).size,players.length);
const marquee=players.filter(p=>p.marquee);assert.deepEqual(new Set(order.slice(0,marquee.length)),new Set(marquee.map(p=>p.id)));assert.deepEqual(order.slice(0,17),players.slice(60,77).map(p=>p.id));assert.equal(players[order[0]].name,'Virat Kohli');assert.equal(players[order[16]].name,'Ravindra Jadeja');assert.ok(marquee.every(p=>p.base===200));
for(const name of ['Virat Kohli','Rohit Sharma','Jasprit Bumrah','Vaibhav Sooryavanshi','Kagiso Rabada','Sai Sudharsan'])assert.ok(marquee.some(p=>p.name===name));
const reordered={...structuredClone(g),order:[60,0],index:0,phase:'live',leader:null,price:0,deadline:100,nextBot:999999,seats:{CSK:{name:'Host',token:'x',bot:false,purse:12000,squad:[]}},passed:[]};
assert.equal(currentPlayer(reordered).name,'Virat Kohli');assert.equal(nextPrice(reordered),200);bid(reordered,'CSK',0);advance(reordered,10001);assert.equal(reordered.seats.CSK.squad[0].player,60);
advance(reordered,14000);assert.equal(currentPlayer(reordered).id,0);reordered.price=400;reordered.leader='CSK';reordered.deadline=15000;advance(reordered,15001);assert.equal(isRecordSale(reordered),true);assert.equal(auctionResults(reordered)[0].player.id,0);
assert.equal(currentPlayer({...reordered,order:undefined,index:0}).id,0,'legacy rooms keep original sequence');
console.log(`PASS: all increment boundaries, ${marquee.length} marquee players first, stable player IDs, reordered awards/results/records and legacy room order.`);
