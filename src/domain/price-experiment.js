function validateAmount(amount, label = '금액') {
  if (!Number.isSafeInteger(amount) || amount < 0) {
    throw new RangeError(`${label}은 0 이상의 안전한 정수여야 합니다.`);
  }
}

function validateCurrency(currency) {
  if (typeof currency !== 'string' || !/^[A-Z]{3}$/.test(currency)) {
    throw new TypeError('통화는 대문자 영문 세 글자여야 합니다.');
  }
}

function validateDiscount(discount, currentAmount) {
  validateAmount(discount, '할인액');
  if (discount > currentAmount) {
    throw new RangeError('할인액은 현재 금액을 넘을 수 없습니다.');
  }
}

export class Money {
  constructor(amount, currency = 'KRW') {
    validateAmount(amount);
    validateCurrency(currency);
    this.amount = amount === 0 ? 0 : amount;
    this.currency = currency;
    Object.freeze(this);
  }

  equals(other) {
    return other instanceof Money && this.amount === other.amount && this.currency === other.currency;
  }

  minus(discount) {
    validateDiscount(discount, this.amount);
    return new Money(this.amount - discount, this.currency);
  }
}

export class PriceExperiment {
  #mode;
  #initialAmount;
  #currency;
  #left;
  #right;
  #objectIds;
  #nextObjectId;
  #events;

  constructor({mode = 'reference', amount = 12000, currency = 'KRW'} = {}) {
    if (mode !== 'reference' && mode !== 'value') {
      throw new TypeError('실험 모드는 reference 또는 value여야 합니다.');
    }
    validateAmount(amount);
    validateCurrency(currency);
    this.#mode = mode;
    this.#initialAmount = amount === 0 ? 0 : amount;
    this.#currency = currency;
    this.reset();
  }

  #remember(price) {
    this.#objectIds.set(price, `M${this.#nextObjectId++}`);
    return price;
  }

  discount(side, amount) {
    if (side !== 'left' && side !== 'right') {
      throw new TypeError('왼쪽 또는 오른쪽 상품을 선택해 주세요.');
    }
    const current = side === 'left' ? this.#left : this.#right;
    validateDiscount(amount, current.amount);
    const previousAmount = current.amount;
    const previousId = this.#objectIds.get(current);
    const owner = side === 'left' ? '왼쪽 상품' : '오른쪽 상품';

    if (this.#mode === 'reference') {
      current.amount -= amount;
      this.#events.push(`${owner}: ${previousId}의 금액을 ${previousAmount}에서 ${current.amount} ${current.currency}(으)로 변경했습니다. 두 상품이 같은 객체를 봅니다.`);
    } else {
      const replacement = this.#remember(current.minus(amount));
      if (side === 'left') this.#left = replacement;
      else this.#right = replacement;
      this.#events.push(`${owner}: ${previousId} 대신 새 ${this.#objectIds.get(replacement)}(${replacement.amount} ${replacement.currency})을 가리킵니다. 다른 상품이 보던 값은 그대로입니다.`);
    }
    return this.snapshot();
  }

  reset() {
    this.#objectIds = new WeakMap();
    this.#nextObjectId = 1;
    this.#events = [];
    this.#left = this.#remember(this.#mode === 'value'
      ? new Money(this.#initialAmount, this.#currency)
      : {amount: this.#initialAmount, currency: this.#currency});
    this.#right = this.#left;
    return this.snapshot();
  }

  snapshot() {
    const describe = price => ({
      amount: price.amount,
      currency: price.currency,
      objectId: this.#objectIds.get(price)
    });
    return {
      mode: this.#mode,
      left: describe(this.#left),
      right: describe(this.#right),
      sameReference: this.#left === this.#right,
      equalValue: this.#left.amount === this.#right.amount && this.#left.currency === this.#right.currency,
      events: [...this.#events]
    };
  }
}
