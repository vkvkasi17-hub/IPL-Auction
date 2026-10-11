import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const source=readFileSync('app/page.tsx','utf8');
const start=source.indexOf('function navigate(){');
const end=source.indexOf('navigate();window.addEventListener',start);
assert.ok(start>=0&&end>start);
function navigate(search,saved='SAVED123',view='room'){
 const state={view,restored:[],navigation:{current:0}};
 const context={URLSearchParams,location:{search},navigation:state.navigation,
 localStorage:{getItem:key=>key==='paddle-room'?saved:'0'},
 sessionStorage:{getItem:()=>state.view,setItem:(_,value)=>state.view=value},
 restore:(...args)=>state.restored.push(args)};
 for(const name of ['SavedRoom','Code','Mode','Booting','Game'])context['set'+name]=value=>state[name]=value;
 runInNewContext(source.slice(start,end)+'navigate();',context);
 return state;
}
for(const view of ['room','home',null]){
 const home=navigate('', 'SAVED123',view);
 assert.equal(home.restored.length,0,'Bare homepage must not auto-join a saved room');
 assert.equal(home.SavedRoom,'SAVED123','Return to room remains available');
 assert.equal(home.Game,null);assert.equal(home.Booting,false);assert.equal(home.Mode,'solo');
 assert.equal(home.view,'home');
}
assert.equal(navigate('',null).restored.length,0);
assert.deepEqual(navigate('?room=INVITE01').restored,[['INVITE01',false,true]]);
assert.deepEqual(navigate('?room=INVITE01&audience=1').restored,[['INVITE01',true,true]]);
assert.ok(source.includes('resume={()=>restore(savedRoom'), 'Explicit resume stays wired');
console.log('Homepage, saved room, invite, and spectator navigation passed');
