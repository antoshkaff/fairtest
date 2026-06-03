"use client";

import { useState } from "react";
import type { AnswerOptionState, QuestionState } from "./types";

const initialQuestion: QuestionState = {
  text: "",
  type: "single_choice",
  points: 1,
  options: [
    { text: "", isCorrect: true },
    { text: "", isCorrect: false },
  ],
};

function cloneInitialQuestion() {
  return {
    ...initialQuestion,
    options: initialQuestion.options.map((option) => ({ ...option })),
  };
}

function ensureCorrectOption(options: AnswerOptionState[]) {
  if (options.some((option) => option.isCorrect)) {
    return options;
  }

  return options.map((option, index) => ({ ...option, isCorrect: index === 0 }));
}

export function useQuestionEditor() {
  const [questions, setQuestions] = useState<QuestionState[]>([cloneInitialQuestion()]);

  function addQuestion() {
    setQuestions((items) => [...items, cloneInitialQuestion()]);
  }

  function removeQuestion(questionIndex: number) {
    setQuestions((items) => items.filter((_, index) => index !== questionIndex));
  }

  function updateQuestion(questionIndex: number, nextQuestion: Partial<QuestionState>) {
    setQuestions((items) =>
      items.map((item, index) => (index === questionIndex ? { ...item, ...nextQuestion } : item)),
    );
  }

  function addOption(questionIndex: number) {
    const question = questions[questionIndex];
    updateQuestion(questionIndex, {
      options: [...question.options, { text: "", isCorrect: false }],
    });
  }

  function removeOption(questionIndex: number, optionIndex: number) {
    const question = questions[questionIndex];
    if (question.options.length <= 2) {
      return;
    }

    updateQuestion(questionIndex, {
      options: ensureCorrectOption(question.options.filter((_, index) => index !== optionIndex)),
    });
  }

  function updateOption(
    questionIndex: number,
    optionIndex: number,
    nextOption: Partial<AnswerOptionState>,
  ) {
    const question = questions[questionIndex];
    updateQuestion(questionIndex, {
      options: question.options.map((option, index) =>
        index === optionIndex ? { ...option, ...nextOption } : option,
      ),
    });
  }

  function markCorrectOption(questionIndex: number, optionIndex: number) {
    const question = questions[questionIndex];
    updateQuestion(questionIndex, {
      options: question.options.map((option, index) => ({
        ...option,
        isCorrect: index === optionIndex,
      })),
    });
  }

  function getNormalizedQuestions() {
    return questions.map((question) =>
      question.type === "open_text" ? { ...question, points: 0, options: [] } : question,
    );
  }

  return {
    questions,
    addQuestion,
    removeQuestion,
    updateQuestion,
    addOption,
    removeOption,
    updateOption,
    markCorrectOption,
    getNormalizedQuestions,
  };
}
