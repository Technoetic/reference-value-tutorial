import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';

const contentUrl = new URL('../data/lessons.json', import.meta.url);
const lessonIds = ['intro', 'reference', 'value', 'equality', 'practice', 'code'];

async function content() {
  assert.ok(existsSync(contentUrl), 'The six-screen lesson data must be supplied');
  return JSON.parse(await readFile(contentUrl, 'utf8'));
}

function text(value, label) {
  assert.equal(typeof value, 'string', `${label} must be text`);
  assert.ok(value.trim(), `${label} must not be blank`);
}

test('all six learning routes have unique usable lesson content', async () => {
  const data = await content();
  assert.equal(data.schema, 1);
  assert.equal(data.lessons.length, 6);
  assert.equal(new Set(data.lessons.map(lesson => lesson.id)).size, 6);
  assert.deepEqual(data.lessons.map(lesson => lesson.id), lessonIds);
  for (const lesson of data.lessons) {
    for (const field of ['title', 'kicker', 'intro', 'takeaway']) {
      text(lesson[field], `${lesson.id}.${field}`);
    }
  }
});

test('six quiz questions can each be answered and explained without dangling option IDs', async () => {
  const data = await content();
  assert.equal(data.questions.length, 6);
  assert.equal(new Set(data.questions.map(question => question.id)).size, 6);
  for (const question of data.questions) {
    text(question.id, 'question.id');
    text(question.prompt, `${question.id}.prompt`);
    text(question.explanation, `${question.id}.explanation`);
    assert.ok(question.options.length >= 3, `${question.id} needs distinct choices`);
    const optionIds = question.options.map(option => option.id);
    assert.equal(new Set(optionIds).size, optionIds.length);
    assert.ok(optionIds.includes(question.answer), `${question.id} answer must identify an option`);
    for (const option of question.options) {
      text(option.id, `${question.id}.option.id`);
      text(option.text, `${question.id}.${option.id}.text`);
    }
  }
});

test('lessons retain the safety boundaries rather than implying reference-free or universal equivalence', async () => {
  const data = await content();
  const lesson = Object.fromEntries(data.lessons.map(item => [item.id, `${item.intro} ${item.takeaway}`]));
  // These are omission guards for the agreed teaching scope, not a prose truth checker.
  assert.match(lesson.value, /값 객체/);
  assert.match(lesson.value, /자바스크립트/);
  assert.match(lesson.value, /참조/);
  assert.match(lesson.value, /불변/);
  assert.match(lesson.value, /공유/);
  assert.match(lesson.value, /소유자.*필드/s);
  assert.match(lesson.equality, /금액/);
  assert.match(lesson.equality, /통화/);
  assert.match(lesson.equality, /===/);
  assert.match(lesson.equality, /includes/);
  assert.match(lesson.equality, /equals.*자동.*않/s);
  assert.match(lesson.code, /엔터티/);
  assert.match(lesson.code, /정체성/);
  assert.match(lesson.code, /의도적/);
  assert.match(lesson.code, /모든.*같.*(?:않|아닙)/s);
});

test('the educational adaptation names its two exact primary sources', async () => {
  const data = await content();
  assert.equal(data.sources.length, 2);
  assert.deepEqual(new Set(data.sources.map(source => source.url)), new Set([
    'https://refactoring.com/catalog/changeReferenceToValue.html',
    'https://martinfowler.com/bliki/ValueObject.html',
  ]));
  for (const source of data.sources) text(source.title, 'source.title');
  const introduction = data.lessons.find(lesson => lesson.id === 'intro').intro;
  assert.match(introduction, /Fowler/);
  assert.match(introduction, /Product/);
  assert.match(introduction, /Money/);
  assert.match(introduction, /교육.*각색/s);
});
