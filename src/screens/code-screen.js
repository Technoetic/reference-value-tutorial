import {BaseScreen} from './base-screen.js';
import {escapeHTML as e} from '../shared/dom.js';
const BEFORE=`// BEFORE: 같은 가격표 안의 금액을 고친다.
function discount(product, amount) {
  product.price.amount -= amount;
}`;
const AFTER=`// AFTER: 이 상품의 가격표를 새 값으로 교체한다.
function discount(product, amount) {
  product.price = new Money(
    product.price.amount - amount,
    product.price.currency
  );
}`;
const MONEY=`class Money {
  constructor(amount, currency) {
    this.amount = amount;
    this.currency = currency;
    Object.freeze(this); // 이 예의 속성은 숫자와 문자열
  }
  equals(other) {
    return other instanceof Money
      && this.amount === other.amount
      && this.currency === other.currency;
  }
}

const a = new Money(12000, "KRW");
const b = new Money(12000, "KRW");
a === b;       // false: 서로 다른 객체
a.equals(b);   // true: 금액과 통화가 같은 값`;
export class CodeScreen extends BaseScreen{
 mount(root){root.innerHTML=`<section class="lesson">${this.head()}<div class="code-pair"><article><div class="code-label"><span>BEFORE</span><b>공유된 내부를 수정</b></div><pre><code>${e(BEFORE)}</code></pre></article><article><div class="code-label after"><span>AFTER</span><b>소유자의 필드를 새 값으로 교체</b></div><pre><code>${e(AFTER)}</code></pre></article></div><div class="insight"><span>↗</span><p><b>달라지는 건 숫자만이 아닙니다.</b> 한 상품만 보유한 가격의 할인 계산은 같아요. 하지만 공유된 다른 상품의 가격과 객체 정체성은 달라질 수 있어요. 그 차이가 원하는 설계인지 먼저 확인해야 해요.</p></div><section class="money-code"><div><span class="eyebrow">VALUE OBJECT</span><h2>작은 객체에<br>분명한 규칙.</h2><p>이 예에서는 금액과 통화가 값의 전부예요. 내부를 수정하지 않고, 내용으로 동등성을 비교해요.</p><p class="field-help">아래는 개념을 보여 주는 최소 코드예요. 실제 실험 모델은 입력 검증도 수행해요. Object.freeze는 얕은 동결이라, 속성 안에 다른 객체가 있다면 추가 설계가 필요해요.</p></div><pre><code>${e(MONEY)}</code></pre></section><section class="two-notes"><article><span class="tiny-label">이럴 때 검토</span><h2>내용이 곧 의미인 것</h2><p>금액, 좌표처럼 속성의 값이 같으면 서로 바꿔 써도 되는 것. 변경의 파급 효과를 줄이고 싶을 때 검토해요.</p></article><article><span class="tiny-label">정체성을 유지할 것</span><h2>상품·주문 자체</h2><p>가격이 같아도 A와 B는 다른 상품이에요. 주문 번호와 변경 이력을 가진 주문도 마찬가지예요. 모두를 값 객체로 바꾸지는 않아요.</p></article></section><section class="checklist"><h2>교체하기 전, 네 가지 확인</h2><ol><li>어떤 속성까지 같아야 같은 값인가?</li><li>객체 안의 값을 바꾸는 경로를 막았는가?</li><li>변경할 때 소유자의 필드를 새 값으로 교체하는가?</li><li>공유·동일성에 기대던 코드와 컬렉션 검색도 점검했는가?</li></ol></section><section class="source-note"><div><h2>원문에서 더 보기</h2><p>공식 Product/Money 코드를 카페 가격표로 각색했어요. 카페의 두 상품·실험·문제는 이 튜토리얼의 교육용 구성입니다.</p></div><div class="source-links">${this.app.content.sources.map(s=>`<a href="${e(s.url)}" target="_blank" rel="noopener">${e(s.title)} <span aria-hidden="true">↗</span><span class="sr-only"> (새 탭)</span></a>`).join('')}<a href="https://github.com/Technoetic/reference-value-tutorial" target="_blank" rel="noopener">튜토리얼 소스 ↗<span class="sr-only"> (새 탭)</span></a></div></section>${this.foot()}</section>`;}
}
