import test from 'node:test';
import assert from 'node:assert/strict';
import {PracticeScreen} from '../src/screens/practice-screen.js';
test('typing a new note while an earlier save is pending keeps the new draft dirty',async()=>{
 let finish;const textarea={value:'first saved draft'},error={textContent:''};
 const app={progress:{note:''},persist:()=>new Promise(r=>finish=r)};
 const screen=new PracticeScreen(app,{});screen.root={querySelector:s=>s==='#learner-note'?textarea:error};
 const saving=screen.saveDraft();textarea.value='typed while save is pending';screen.dirty=true;finish();await saving;
 assert.equal(app.progress.note,'first saved draft');assert.equal(screen.dirty,true);assert.equal(textarea.value,'typed while save is pending');
});
