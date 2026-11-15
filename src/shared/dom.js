export const escapeHTML=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const won=amount=>new Intl.NumberFormat('ko-KR').format(amount)+'원';
export const icon=(name='arrow')=>({arrow:'↗',next:'→',check:'✓',reset:'↺',equal:'='}[name]||'→');
export function parseAmount(value){if(!/^\d+$/.test(String(value)))throw Error('0 이상인 정수를 입력해 주세요.');const n=Number(value);if(!Number.isSafeInteger(n))throw Error('숫자가 너무 커요.');return n;}
