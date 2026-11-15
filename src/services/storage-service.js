export const emptyProgress=()=>({schema:1,reference:[],value:[],answers:{},note:''});
function valid(p){return p&&p.schema===1&&typeof p.note==='string'&&p.note.length<=2000&&p.answers&&typeof p.answers==='object'&&!Array.isArray(p.answers)&&Object.keys(p.answers).length<=6&&Object.entries(p.answers).every(([k,v])=>/^[\w-]{1,40}$/.test(k)&&typeof v==='string'&&/^[\w-]{1,40}$/.test(v))&&['reference','value'].every(mode=>Array.isArray(p[mode])&&p[mode].length<=60&&p[mode].every(e=>e&&['left','right'].includes(e.side)&&Number.isSafeInteger(e.amount)&&e.amount>=0&&e.amount<=12000));}
export class LabStorageService{
 constructor({storage,key='value-shift.progress.v1'}={}){this.key=key;this.warning='';try{this.storage=storage??globalThis.localStorage;}catch{this.storage={getItem:()=>null,setItem:()=>{throw Error('Storage blocked');}};this.warning='저장소가 차단되어 있어요. 실험은 가능하지만 이 브라우저에 기록을 저장할 수 없어요.';}}
 load(){try{const raw=this.storage.getItem(this.key);if(!raw)return emptyProgress();const p=JSON.parse(raw);if(!valid(p))throw Error('invalid');return structuredClone(p);}catch{this.warning='저장된 기록을 읽지 못해 새 실험으로 시작했어요.';return emptyProgress();}}
 async save(progress){await Promise.resolve();try{if(!valid(progress))throw Error('invalid progress');this.storage.setItem(this.key,JSON.stringify(progress));}catch{throw Error('이 브라우저에 저장하지 못했어요. 입력은 그대로 유지돼요.');}}
}
