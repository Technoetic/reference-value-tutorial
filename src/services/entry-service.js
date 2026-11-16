// One-time document entry only. This runs before any editable screen is mounted;
// focus/visibility detection in an already-running app never calls this gate.
export class EntryService{
 constructor({version,currentURL,replace}){Object.assign(this,{version,currentURL,replace});}
 async start(){
  try{await this.version.refresh();}catch{return 'continue';}
  if(!this.version.pendingBuild)return 'continue';
  const target=new URL(this.currentURL);target.searchParams.set('_rv',this.version.pendingBuild+'-'+crypto.randomUUID());
  this.replace(target.href);return 'replaced';
 }
}
