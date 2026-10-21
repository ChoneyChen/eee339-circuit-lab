/**
 * Keep a lecture's code context and its questions together without changing the
 * source lesson or the stable exercise IDs used by saved drafts and attempts.
 */
export function buildLessonPages(lesson) {
  if (!lesson || lesson.available === false) return [];

  const pages = [];
  const exercises = lesson.exercises || [];
  for (const [sectionIndex, section] of (lesson.sections || []).entries()) {
    let questionIndex = 0;
    if (section.check) {
      const check = section.check;
      const exercise = {
        id: `check-${section.id}`,
        type: 'choice',
        title: `代码理解 · ${section.title}`,
        prompt: check.question,
        options: check.options,
        answer: check.answer,
        explanation: check.explanation,
        sectionId: section.id,
        hints: [],
      };
      pages.push({
        id: exercise.id,
        kind: 'check',
        section,
        exercise,
        sectionIndex,
        questionIndex: questionIndex++,
      });
    }

    for (const exercise of exercises.filter(item => item.sectionId === section.id)) {
      pages.push({
        id: exercise.id,
        kind: 'exercise',
        section,
        exercise,
        sectionIndex,
        questionIndex: questionIndex++,
      });
    }
  }
  return pages;
}

function matchingPageIndex(pages, id) {
  const exact = pages.findIndex(page => page.id === id);
  if (exact >= 0) return exact;

  // URLs use encoded IDs; accepting the original ID also keeps callers simple.
  let decoded = id;
  try { decoded = decodeURIComponent(id); } catch { /* Invalid URL escapes stay unmatched. */ }
  const decodedPage = pages.findIndex(page => page.id === decoded);
  if (decodedPage >= 0) return decodedPage;

  // Existing bookmarks/search results point to #lesson/{id}/{sectionId}.
  return pages.findIndex(page => page.section.id === id || page.section.id === decoded);
}

export function resolveLessonPage(pages, requestedId, savedId) {
  if (!pages.length) return -1;
  const hasRequest = requestedId !== undefined && requestedId !== null && requestedId !== '';
  const index = matchingPageIndex(pages, hasRequest ? requestedId : savedId);
  return index >= 0 ? index : 0;
}

export function lessonPageUrl(lessonId, pageId) {
  return `#lesson/${encodeURIComponent(lessonId)}/question/${encodeURIComponent(pageId)}`;
}
