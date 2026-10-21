import test from 'node:test';
import assert from 'node:assert/strict';
import {earlyLessons} from '../js/lessons-early.js';
import {lateLessons} from '../js/lessons-late.js';
import {customLessons} from '../js/lessons-custom.js';
import {buildLessonPages, resolveLessonPage, lessonPageUrl} from '../js/lesson-pagination.js';
import {checkAnswer} from '../js/exercise-player.js';

const lessons = [...new Map([...earlyLessons, ...lateLessons, ...customLessons].map(lesson => [lesson.id, lesson])).values()];
const available = lessons.filter(lesson => lesson.available);

test('all lecture questions appear once with their original code context', () => {
  const pages = available.flatMap(buildLessonPages);
  const checks = available.reduce((sum, lesson) => sum + lesson.sections.filter(section => section.check).length, 0);
  const exercises = available.reduce((sum, lesson) => sum + lesson.exercises.length, 0);
  assert.equal(pages.length, checks + exercises);
  assert.equal(pages.filter(page => page.kind === 'check').length, checks);
  assert.equal(pages.filter(page => page.kind === 'exercise').length, exercises);
  assert.equal(new Set(pages.map(page => page.id)).size, pages.length);

  for (const lesson of available) {
    const actual = buildLessonPages(lesson);
    const expectedIds = lesson.sections.flatMap(section => [
      ...(section.check ? [`check-${section.id}`] : []),
      ...lesson.exercises.filter(exercise => exercise.sectionId === section.id).map(exercise => exercise.id),
    ]);
    assert.deepEqual(actual.map(page => page.id), expectedIds, `lecture ${lesson.id} order`);
    for (const page of actual) {
      assert.equal(page.section, lesson.sections[page.sectionIndex]);
      assert.equal(page.exercise.sectionId, page.section.id);
      if (page.kind === 'exercise') {
        assert.equal(page.exercise, lesson.exercises.find(exercise => exercise.id === page.id));
      }
    }
  }
});

test('section checks become answerable choice exercises without changing source data', () => {
  const lesson = available[0];
  const before = JSON.stringify(lesson);
  const pages = buildLessonPages(lesson);
  for (const page of pages.filter(item => item.kind === 'check')) {
    assert.equal(page.exercise.type, 'choice');
    assert.equal(page.exercise.prompt, page.section.check.question);
    assert.equal(page.exercise.explanation, page.section.check.explanation);
    assert.equal(checkAnswer(page.exercise, page.section.check.answer), true);
    assert.equal(checkAnswer(page.exercise, null), false);
    assert.equal(page.questionIndex, 0);
  }
  assert.equal(JSON.stringify(lesson), before);
  assert.deepEqual(buildLessonPages(lesson).map(page => page.id), pages.map(page => page.id));
});

test('question URLs preserve page IDs through encoding and resolve to the exact question', () => {
  const pages = buildLessonPages(available[0]);
  for (const [index, page] of pages.entries()) {
    const url = lessonPageUrl(1, page.id);
    assert.equal(url, `#lesson/1/question/${encodeURIComponent(page.id)}`);
    assert.equal(resolveLessonPage(pages, url.split('/').at(-1)), index);
  }
  const specialPages = [{id: '题 / 1', section: {id: '知识 / 1'}}];
  assert.equal(lessonPageUrl(2, specialPages[0].id), '#lesson/2/question/%E9%A2%98%20%2F%201');
  assert.equal(resolveLessonPage(specialPages, '%E9%A2%98%20%2F%201'), 0);
});

test('legacy section links open their first question and resume never overrides an explicit link', () => {
  const pages = buildLessonPages(available[0]);
  const last = pages.at(-1).id;
  for (const section of available[0].sections) {
    const first = pages.findIndex(page => page.section.id === section.id);
    assert.equal(resolveLessonPage(pages, section.id, last), first);
  }
  assert.equal(resolveLessonPage(pages, pages[0].id, last), 0);
  assert.equal(resolveLessonPage(pages, 'deleted-question', last), 0);
  assert.equal(resolveLessonPage(pages, '%invalid', last), 0);
  assert.equal(resolveLessonPage(pages, undefined, last), pages.length - 1);
  assert.equal(resolveLessonPage(pages, '', last), pages.length - 1);
  assert.equal(resolveLessonPage(pages, undefined, 'deleted-question'), 0);
});

test('an unavailable lecture or an empty lecture has no phantom question page', () => {
  assert.deepEqual(buildLessonPages({available: false, id: 10, sections: [{id: 'reserved'}]}), []);
  assert.deepEqual(buildLessonPages({sections: [], exercises: []}), []);
  assert.deepEqual(buildLessonPages(undefined), []);
  assert.equal(resolveLessonPage([], 'anything', 'anything'), -1);
});

test('a section without a check still includes its exercises in source order', () => {
  const section = {id: 'new-section', title: '新内容'};
  const exercises = [{id: 'second-name', sectionId: section.id}, {id: 'first-name', sectionId: section.id}];
  const pages = buildLessonPages({sections: [section], exercises});
  assert.deepEqual(pages.map(page => page.id), ['second-name', 'first-name']);
  assert.deepEqual(pages.map(page => page.questionIndex), [0, 1]);
});
