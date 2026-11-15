import test from 'node:test';
import assert from 'node:assert/strict';
import {Money, PriceExperiment} from '../src/domain/price-experiment.js';

test('Money exposes an amount and default currency that callers cannot overwrite', () => {
  const price = new Money(12000);
  assert.equal(price.amount, 12000);
  assert.equal(price.currency, 'KRW');
  assert.ok(Object.hasOwn(price, 'amount'));
  assert.ok(Object.hasOwn(price, 'currency'));
  assert.throws(() => { price.amount = 1; }, TypeError);
  assert.throws(() => { price.currency = 'USD'; }, TypeError);
  assert.throws(() => Object.defineProperty(price, 'amount', {value: 1}), TypeError);
  assert.equal(price.amount, 12000);
  assert.equal(price.currency, 'KRW');
});

test('Money value equality includes both amount and currency', () => {
  const price = new Money(12000, 'KRW');
  assert.equal(price.equals(new Money(12000, 'KRW')), true);
  assert.equal(price.equals(new Money(11000, 'KRW')), false);
  assert.equal(price.equals(new Money(12000, 'USD')), false);
  for (const other of [null, undefined, {}, '12000', {amount: 12000, currency: 'KRW'}]) {
    assert.equal(price.equals(other), false);
  }
});

test('Money does not silently change JavaScript reference or includes comparisons', () => {
  const first = new Money(12000);
  const second = new Money(12000);
  assert.notStrictEqual(first, second);
  assert.equal(first.equals(second), true);
  assert.equal([first].includes(second), false);
  assert.equal([first].some(price => price.equals(second)), true);
});

test('minus returns a new value and leaves the original unchanged', () => {
  const original = new Money(12000, 'EUR');
  const discounted = original.minus(1500);
  assert.notStrictEqual(discounted, original);
  assert.equal(discounted.amount, 10500);
  assert.equal(discounted.currency, 'EUR');
  assert.equal(original.amount, 12000);
});

test('a zero discount still returns a new equal Money', () => {
  const original = new Money(12000);
  const result = original.minus(0);
  assert.notStrictEqual(result, original);
  assert.equal(result.equals(original), true);
});

test('Money accepts the safe-integer upper bound and an exact full discount', () => {
  const original = new Money(Number.MAX_SAFE_INTEGER);
  assert.equal(original.minus(Number.MAX_SAFE_INTEGER).amount, 0);
  assert.equal(original.amount, Number.MAX_SAFE_INTEGER);
  assert.equal(new Money(-0).amount, 0);
});

const invalidAmounts = [-1, 0.5, NaN, Infinity, -Infinity, Number.MAX_SAFE_INTEGER + 1, '12000', null, undefined];
const invalidCurrencies = ['krw', 'KR', 'KRWW', 'K1W', '', ' KRW', null, 123];

test('Money rejects amounts outside nonnegative safe integers without coercion', () => {
  for (const amount of invalidAmounts) assert.throws(() => new Money(amount));
});

test('Money requires a three-uppercase-letter currency', () => {
  for (const currency of invalidCurrencies) assert.throws(() => new Money(12000, currency));
});

test('invalid discounts cannot alter Money', () => {
  const original = new Money(12000);
  for (const amount of [...invalidAmounts, 12001]) {
    assert.throws(() => original.minus(amount));
    assert.equal(original.amount, 12000);
    assert.equal(original.currency, 'KRW');
  }
});

test('an experiment starts with two owners of M1 and no events', () => {
  assert.deepEqual(new PriceExperiment().snapshot(), {
    mode: 'reference',
    left: {amount: 12000, currency: 'KRW', objectId: 'M1'},
    right: {amount: 12000, currency: 'KRW', objectId: 'M1'},
    sameReference: true,
    equalValue: true,
    events: []
  });
});

test('reference-mode mutation through one owner changes both shared prices', () => {
  const experiment = new PriceExperiment();
  experiment.discount('left', 1000);
  const state = experiment.snapshot();
  assert.deepEqual(state.left, {amount: 11000, currency: 'KRW', objectId: 'M1'});
  assert.deepEqual(state.right, {amount: 11000, currency: 'KRW', objectId: 'M1'});
  assert.equal(state.sameReference, true);
  assert.equal(state.equalValue, true);
  assert.equal(state.events.length, 1);
  assert.equal(typeof state.events[0], 'string');
});

test('reference-mode repeated discounts can originate from either owner', () => {
  const experiment = new PriceExperiment();
  experiment.discount('left', 1000);
  experiment.discount('right', 3000);
  const state = experiment.snapshot();
  assert.equal(state.left.amount, 8000);
  assert.equal(state.right.amount, 8000);
  assert.equal(state.left.objectId, 'M1');
  assert.equal(state.right.objectId, 'M1');
  assert.equal(state.events.length, 2);
});

test('value-mode replacement leaves the other owner on the old shared value', () => {
  const experiment = new PriceExperiment({mode: 'value'});
  experiment.discount('left', 1000);
  const state = experiment.snapshot();
  assert.deepEqual(state.left, {amount: 11000, currency: 'KRW', objectId: 'M2'});
  assert.deepEqual(state.right, {amount: 12000, currency: 'KRW', objectId: 'M1'});
  assert.equal(state.sameReference, false);
  assert.equal(state.equalValue, false);
});

test('separate value replacements can become equal without sharing identity', () => {
  const experiment = new PriceExperiment({mode: 'value'});
  experiment.discount('left', 1000);
  experiment.discount('right', 1000);
  const state = experiment.snapshot();
  assert.deepEqual(state.left, {amount: 11000, currency: 'KRW', objectId: 'M2'});
  assert.deepEqual(state.right, {amount: 11000, currency: 'KRW', objectId: 'M3'});
  assert.equal(state.sameReference, false);
  assert.equal(state.equalValue, true);
});

test('value-mode repeated discounts use that owner’s latest amount', () => {
  const experiment = new PriceExperiment({mode: 'value'});
  experiment.discount('left', 1000);
  experiment.discount('left', 2000);
  assert.deepEqual(experiment.snapshot().left, {amount: 9000, currency: 'KRW', objectId: 'M3'});
  assert.deepEqual(experiment.snapshot().right, {amount: 12000, currency: 'KRW', objectId: 'M1'});
});

test('zero replacement demonstrates equal contents with different identities', () => {
  const experiment = new PriceExperiment({mode: 'value', amount: 0});
  experiment.discount('right', 0);
  const state = experiment.snapshot();
  assert.deepEqual(state.left, {amount: 0, currency: 'KRW', objectId: 'M1'});
  assert.deepEqual(state.right, {amount: 0, currency: 'KRW', objectId: 'M2'});
  assert.equal(state.sameReference, false);
  assert.equal(state.equalValue, true);
});

test('a full reference-mode discount reaches zero for both owners', () => {
  const experiment = new PriceExperiment();
  experiment.discount('right', 12000);
  assert.equal(experiment.snapshot().left.amount, 0);
  assert.equal(experiment.snapshot().right.amount, 0);
});

for (const mode of ['reference', 'value']) {
  test(`${mode}: rejected actions preserve prices, identities and event history`, () => {
    const experiment = new PriceExperiment({mode});
    experiment.discount('left', 1000);
    const before = experiment.snapshot();
    const actions = [
      ['neither', 1000], [null, 1000], [undefined, 1000],
      ...invalidAmounts.map(amount => ['left', amount]),
      ['left', 11001]
    ];
    for (const [side, amount] of actions) {
      assert.throws(() => experiment.discount(side, amount));
      assert.deepEqual(experiment.snapshot(), before);
    }
    experiment.discount('left', 1000);
    const after = experiment.snapshot();
    assert.equal(after.left.amount, 10000);
    assert.equal(after.left.objectId, mode === 'value' ? 'M3' : 'M1');
  });

  test(`${mode}: reset restores the configured price, shared identity and empty history`, () => {
    const experiment = new PriceExperiment({mode, amount: 2500, currency: 'EUR'});
    experiment.discount('left', 500);
    experiment.discount('right', 500);
    experiment.reset();
    assert.deepEqual(experiment.snapshot(), {
      mode,
      left: {amount: 2500, currency: 'EUR', objectId: 'M1'},
      right: {amount: 2500, currency: 'EUR', objectId: 'M1'},
      sameReference: true,
      equalValue: true,
      events: []
    });
    experiment.discount('left', 500);
    assert.equal(experiment.snapshot().left.objectId, mode === 'value' ? 'M2' : 'M1');
  });
}

test('snapshot values and history cannot mutate the underlying experiment', () => {
  const experiment = new PriceExperiment({mode: 'value'});
  experiment.discount('left', 1000);
  const external = experiment.snapshot();
  const originalEvent = external.events[0];
  external.mode = 'reference';
  external.left.amount = 0;
  external.left.objectId = 'overwritten';
  external.right.currency = 'USD';
  external.events[0] = 'overwritten';
  external.events.push('external event');
  const state = experiment.snapshot();
  assert.equal(state.mode, 'value');
  assert.deepEqual(state.left, {amount: 11000, currency: 'KRW', objectId: 'M2'});
  assert.deepEqual(state.right, {amount: 12000, currency: 'KRW', objectId: 'M1'});
  assert.equal(typeof originalEvent, 'string');
  assert.deepEqual(state.events, [originalEvent]);
});

test('an experiment validates its mode, amount and currency before exposing state', () => {
  for (const mode of ['Value', 'other', '', null, 1]) assert.throws(() => new PriceExperiment({mode}));
  for (const amount of invalidAmounts.filter(amount => amount !== undefined)) assert.throws(() => new PriceExperiment({amount}));
  for (const currency of invalidCurrencies) assert.throws(() => new PriceExperiment({currency}));
});

test('an experiment accepts a maximum-safe-integer configured amount', () => {
  const experiment = new PriceExperiment({mode: 'value', amount: Number.MAX_SAFE_INTEGER});
  experiment.discount('left', Number.MAX_SAFE_INTEGER);
  assert.equal(experiment.snapshot().left.amount, 0);
  assert.equal(experiment.snapshot().right.amount, Number.MAX_SAFE_INTEGER);
});
