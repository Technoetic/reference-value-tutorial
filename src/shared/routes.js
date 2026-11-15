export const ROUTES=Object.freeze([
 {path:'/',id:'intro',label:'시작',short:'시작'},
 {path:'/reference',id:'reference',label:'공유의 함정',short:'공유'},
 {path:'/value',id:'value',label:'값으로 교체',short:'교체'},
 {path:'/equality',id:'equality',label:'같음의 기준',short:'비교'},
 {path:'/practice',id:'practice',label:'직접 확인',short:'연습'},
 {path:'/code',id:'code',label:'코드와 정리',short:'정리'}
]);
export function parseRoute(value=''){
 const raw=String(value).replace(/^#/,'')||'/';
 if(!raw.startsWith('/')||raw.startsWith('//')||raw.includes('\\'))return {path:'/missing',params:new URLSearchParams()};
 try{const u=new URL(raw,'https://route.invalid');return {path:u.pathname,params:u.searchParams};}catch{return {path:'/missing',params:new URLSearchParams()};}
}
export function routeUrl(value,baseUrl){const r=parseRoute(value),url=new URL(baseUrl);url.hash=r.path+(r.params.toString()?'?'+r.params:'');return url;}
