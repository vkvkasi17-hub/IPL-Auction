export const teams = [
  ['CSK','Chennai Super Kings','#ffd54a','Chennai'],['MI','Mumbai Indians','#56a8ff','Mumbai'],['RCB','Royal Challengers Bengaluru','#ff5a6c','Bengaluru'],['KKR','Kolkata Knight Riders','#b68aff','Kolkata'],['SRH','Sunrisers Hyderabad','#ff914d','Hyderabad'],['RR','Rajasthan Royals','#ff72b6','Jaipur'],['DC','Delhi Capitals','#6092ff','Delhi'],['PBKS','Punjab Kings','#ff6577','Punjab'],['GT','Gujarat Titans','#85c4c7','Ahmedabad'],['LSG','Lucknow Super Giants','#58dbc5','Lucknow']
].map(([id,name,color,city])=>({id,name,color,city}));
const names = [
 ['Rishabh Pant','WK','India'],['Shreyas Iyer','BAT','India'],['Jos Buttler','WK','England'],['Arshdeep Singh','BOWL','India'],['Mitchell Starc','BOWL','Australia'],['KL Rahul','WK','India'],['Yuzvendra Chahal','BOWL','India'],['Liam Livingstone','AR','England'],['Mohammed Shami','BOWL','India'],['David Miller','BAT','South Africa'],['Glenn Maxwell','AR','Australia'],['Mohammed Siraj','BOWL','India'],['Trent Boult','BOWL','New Zealand'],['Marcus Stoinis','AR','Australia'],['Ishan Kishan','WK','India'],['Venkatesh Iyer','AR','India'],['Phil Salt','WK','England'],['Devon Conway','BAT','New Zealand'],['Rahul Tripathi','BAT','India'],['Rachin Ravindra','AR','New Zealand'],['Aiden Markram','BAT','South Africa'],['Faf du Plessis','BAT','South Africa'],['Washington Sundar','AR','India'],['Ravichandran Ashwin','AR','India'],['Bhuvneshwar Kumar','BOWL','India'],['T Natarajan','BOWL','India'],['Deepak Chahar','BOWL','India'],['Harshal Patel','BOWL','India'],['Avesh Khan','BOWL','India'],['Prasidh Krishna','BOWL','India'],['Ravi Bishnoi','BOWL','India'],['Krunal Pandya','AR','India'],['Sam Curran','AR','England'],['Jofra Archer','BOWL','England'],['Quinton de Kock','WK','South Africa'],['Will Jacks','AR','England'],['Tim David','BAT','Australia'],['Nitish Rana','BAT','India'],['Abdul Samad','BAT','India'],['Abhinav Manohar','BAT','India'],['Shahbaz Ahmed','AR','India'],['Mahipal Lomror','AR','India'],['Anuj Rawat','WK','India'],['Jitesh Sharma','WK','India'],['Ashutosh Sharma','BAT','India'],['Nehal Wadhera','BAT','India'],['Naman Dhir','AR','India'],['Angkrish Raghuvanshi','BAT','India'],['Sameer Rizvi','BAT','India'],['Suyash Sharma','BOWL','India'],['Mukesh Kumar','BOWL','India'],['Khaleel Ahmed','BOWL','India'],['Akash Deep','BOWL','India'],['Ishant Sharma','BOWL','India'],['Umesh Yadav','BOWL','India'],['Jaydev Unadkat','BOWL','India'],['Mayank Agarwal','BAT','India'],['Manish Pandey','BAT','India'],['Ajinkya Rahane','BAT','India'],['Prithvi Shaw','BAT','India']
];
export const players = names.map(([name,role,country],id)=>({id,name,role,country,base:id<18?200:id<40?100:30,value:id<18?1100+(id*173)%900:200+(id*139)%700}));
export const money = (n:number)=>`₹${(n/100).toFixed(2)} Cr`;
export type Seat = {name:string,token:string,bot:boolean,purse:number,squad:{player:number,price:number}[]};
export type Game = {code:string,host:string,phase:'lobby'|'live'|'sold'|'finished',seats:Record<string,Seat>,index:number,price:number,leader:string|null,deadline:number,nextBot:number,passed:string[],log:string[],round:number};
export const nextPrice=(g:Game)=>g.leader?g.price+(g.price<100?5:g.price<200?10:25):players[g.index]?.base||30;
export function canBid(g:Game,id:string){const s=g.seats[id],p=players[g.index];return !!s&&!!p&&s.purse>=nextPrice(g)&&s.squad.length<25&&(p.country==='India'||s.squad.filter(x=>players[x.player].country!=='India').length<8)&&g.leader!==id&&!g.passed.includes(id)}
export function bid(g:Game,id:string,now:number){g.price=nextPrice(g);g.leader=id;g.deadline=now+10000;g.nextBot=now+1800+Math.random()*1800;g.log.unshift(`${id} bid ${money(g.price)} for ${players[g.index].name}`);g.log=g.log.slice(0,40)}
export function advance(g:Game,now:number){
 if(g.phase==='sold'&&now>=g.deadline){g.index++;g.round++;g.price=0;g.leader=null;g.passed=[];g.phase=g.index>=players.length?'finished':'live';g.deadline=now+14000;g.nextBot=now+2500}
 if(g.phase!=='live')return;
 if(now>=g.deadline){if(g.leader){const s=g.seats[g.leader];s.purse-=g.price;s.squad.push({player:g.index,price:g.price});g.log.unshift(`SOLD • ${players[g.index].name} → ${g.leader} for ${money(g.price)}`)}else g.log.unshift(`UNSOLD • ${players[g.index].name}`);g.phase='sold';g.deadline=now+3500;return}
 if(now>=g.nextBot){const eligible=teams.filter(t=>g.seats[t.id]?.bot&&canBid(g,t.id)&&nextPrice(g)<=players[g.index].value*(0.72+((g.index+t.id.charCodeAt(0))%7)/10));if(eligible.length)bid(g,eligible[Math.floor(Math.random()*eligible.length)].id,now);else g.nextBot=now+2000}
}

// A record is announced only for a completed, awarded sale, never a live bid.
export function isRecordSale(g:Game){
 if(g.phase!=='sold'||!g.leader)return false;
 const sale=g.seats[g.leader]?.squad.find(s=>s.player===g.index);
 if(!sale)return false;
 const previous=Object.values(g.seats).flatMap(s=>s.squad).filter(s=>s.player<g.index);
 return previous.length>0&&sale.price>Math.max(...previous.map(s=>s.price));
}
