import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {createHash} from 'node:crypto';
const key='test-only-owner-key-that-is-not-a-production-credential';
const state={code:'ABCDEF12',host:'PRIVATE_HOST_TOKEN',phase:'lobby',index:0,seats:{CSK:{name:'Private manager',token:'PRIVATE_SEAT_TOKEN',bot:false,purse:12000,squad:[]}}};
let reads=0;
globalThis.ownerTestEnv={
 OWNER_ACCESS_HASH:createHash('sha256').update(key).digest('hex'),
 DB:{prepare(){return {
  bind(){return this},
  async all(){reads++;return {results:[{position:1,code:state.code,state:JSON.stringify(state)}]}},
  async first(){reads++;return {total:1,waiting:1,underway:0,finished:0}}
 }}}
};
const built=await build({entryPoints:['app/api/owner/route.ts'],bundle:true,write:false,platform:'node',format:'esm',packages:'external',alias:{'@':process.cwd()},plugins:[{name:'test-bindings',setup(b){b.onResolve({filter:/^cloudflare:workers$/},()=>({path:'binding',namespace:'mock'}));b.onLoad({filter:/.*/,namespace:'mock'},()=>({contents:'export const env=globalThis.ownerTestEnv;'}))}}]});
const {GET,POST}=await import('data:text/javascript;base64,'+Buffer.from(built.outputFiles[0].text).toString('base64'));
const origin='https://auction.test';
const post=(body,requestOrigin=origin)=>POST(new Request(origin+'/api/owner',{method:'POST',headers:{origin:requestOrigin,'Content-Type':'application/json'},body:JSON.stringify(body)}));
assert.equal((await GET(new Request(origin+'/api/owner'))).status,401);assert.equal(reads,0);
assert.equal((await post({key:'wrong'})).status,401);assert.equal((await post({key},'https://other.test')).status,403);assert.equal((await post({key:'x'.repeat(2000)})).status,413);
const login=await post({key});assert.equal(login.status,200);const cookie=login.headers.get('set-cookie');assert.ok(cookie.includes('HttpOnly'));assert.ok(cookie.includes('Secure'));assert.ok(cookie.includes('SameSite=Strict'));const session=cookie.split(';')[0];
const response=await GET(new Request(origin+'/api/owner',{headers:{cookie:session}}));assert.equal(response.status,200);const result=await response.json();assert.equal(result.rooms[0].code,'ABCDEF12');assert.equal(result.rooms[0].humans,1);assert.ok(!JSON.stringify(result).includes('PRIVATE'));assert.ok(!JSON.stringify(result).includes('Private manager'));assert.equal(response.headers.get('Cache-Control'),'no-store, private');
assert.equal((await GET(new Request(origin+'/api/owner?search=%27',{headers:{cookie:session}}))).status,400);
assert.equal((await post({action:'logout'})).headers.get('set-cookie').includes('Max-Age=0'),true);
globalThis.ownerTestEnv.OWNER_ACCESS_HASH='';assert.equal((await GET(new Request(origin+'/api/owner',{headers:{cookie:session}}))).status,503);
console.log('PASS: owner API denies anonymous/invalid access before DB reads, rejects cross-origin/oversized input, signs secure cookies, redacts tokens and names, validates searches, logs out, and fails closed without configuration.');
