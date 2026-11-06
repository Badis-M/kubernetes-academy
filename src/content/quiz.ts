import type { QuizQuestion } from "./types";

export function gradeQuiz(questions: QuizQuestion[], answers: (number | undefined)[]) {
  return questions.map((question, index) => answers[index] === question.correct);
}

export function orderQuizOptions(question: QuizQuestion): QuizQuestion {
  if (question.options.length < 2) return question;

  // Base the order on one canonical string so SSR and both languages agree.
  let hash = 2166136261;
  for (const character of question.question.en) {
    hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  }
  const offset = (hash >>> 0) % question.options.length;
  return {
    ...question,
    options: [...question.options.slice(offset), ...question.options.slice(0, offset)],
    correct: (question.correct - offset + question.options.length) % question.options.length,
  };
}
