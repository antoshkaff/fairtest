import { prisma } from "@/lib/server/prisma";
import { Question } from "@/server/domain/entities/question.entity";
import { StudentAnswer } from "@/server/domain/entities/student-answer.entity";
import { mapPrismaQuestionToEntity } from "@/server/domain/mappers/question.mapper";
import { mapPrismaStudentAnswerToEntity } from "@/server/domain/mappers/student-answer.mapper";

export class ResultEvaluator {
  async calculateScore(attemptId: string): Promise<number> {
    const attempt = await prisma.testAttempt.findUnique({
      where: { id: attemptId },
      include: {
        test: { include: { questions: { include: { options: true } } } },
        answers: { include: { answerOption: true, question: true } },
      },
    });

    if (!attempt) {
      return 0;
    }

    return this.calculateAttemptScore(
      attempt.test.questions.map(mapPrismaQuestionToEntity),
      attempt.answers.map(mapPrismaStudentAnswerToEntity),
    );
  }

  calculateAttemptScore(questions: Question[], answers: StudentAnswer[]): number {
    const answerByQuestion = new Map(answers.map((answer) => [answer.questionId, answer]));

    return questions.reduce((score, question) => {
      const answer = answerByQuestion.get(question.id);
      return answer && this.checkAnswer(answer, question) ? score + question.points : score;
    }, 0);
  }

  checkAnswer(answer: StudentAnswer, question: Question): boolean {
    if (question.type !== "single_choice") {
      return false;
    }

    return answer.isCorrect;
  }
}

export const resultEvaluator = new ResultEvaluator();
