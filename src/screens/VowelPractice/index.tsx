import { useEffect, useRef, useState } from 'react';

import AnswerOption from '../../components/AnswerOption';
import PracticeFeedback from '../../components/PracticeFeedback';
import PracticeSummary from '../../components/PracticeSummary';
import ProgressBar from '../../components/ProgressBar';
import type { AnswerResult } from '../../components/ResultIcon';
import ToneContour from '../../components/ToneContour';
import { consonantClasses, consonants, guide, toneById, tones, vowels } from '../../data';
import { generateVowelQuestions, getSyllable, getVowelAnswer, getVowelLabel } from '../../helpers/vowels';
import { playFeedbackSound } from '../../services/sound';

const buildQuestions = () => generateVowelQuestions(consonants, vowels);

const getOptionResult = (option: string, answer: string, selected: string | null, answered: boolean): AnswerResult | null => {
  if (!answered) {
    return null;
  }
  if (option === answer) {
    return 'correct';
  }
  return option === selected ? 'incorrect' : null;
};

const VowelPractice = () => {
  const [questions, setQuestions] = useState(buildQuestions);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const isFirstQuestion = useRef(true);
  const question = questions[index];

  useEffect(() => {
    if (isFirstQuestion.current) {
      isFirstQuestion.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [question?.id]);

  const restart = () => {
    setQuestions(buildQuestions());
    setIndex(0);
    setSelected(null);
    setAnswered(false);
    setScore(0);
  };

  if (!question) {
    return (
      <PracticeSummary
        score={score}
        total={questions.length}
        onRestart={restart}
        explore={{ to: '/vowels', label: 'Explore vowels' }}
      />
    );
  }

  const answer = getVowelAnswer(question);
  const isCorrect = selected === answer;
  const result: AnswerResult | null = answered ? (isCorrect ? 'correct' : 'incorrect') : null;
  const isLastQuestion = index === questions.length - 1;
  const consonantClass = consonantClasses.find((item) => item.id === question.consonant.class);
  const tone = toneById[question.tone];

  const handleAction = () => {
    if (answered) {
      setIndex(index + 1);
      setSelected(null);
      setAnswered(false);
      return;
    }
    if (selected === null) {
      return;
    }
    playFeedbackSound(isCorrect ? 'correct' : 'incorrect');
    setAnswered(true);
    if (isCorrect) {
      setScore(score + 1);
    }
  };

  const optionProps = (option: string) => ({
    selected: option === selected,
    result: getOptionResult(option, answer, selected, answered),
    disabled: answered,
    onSelect: () => setSelected(option),
  });

  return (
    <div className="mx-auto flex max-w-[42rem] flex-col">
      <h1 className="sr-only">Vowel practice</h1>
      <div className="mb-4 flex items-center gap-3">
        <ProgressBar current={index + (answered ? 1 : 0)} total={questions.length} label="Practice progress" />
      </div>

      <section className="flex flex-col items-center gap-4" aria-labelledby="vowel-question-prompt">
        <h2 id="vowel-question-prompt" className="rounded-xl text-center text-2xl font-extrabold" ref={headingRef} tabIndex={-1}>
          {question.kind === 'spell' ? 'How is this written?' : 'Which tone is this?'}
        </h2>
        {question.kind === 'spell' ? (
          <p className="flex items-center gap-3 font-thai text-[2.5rem] leading-[1.4] font-medium" lang="th">
            <span className="grid min-h-20 min-w-20 place-items-center rounded-2xl border-2 border-line px-3 shadow-edge">
              {question.consonant.character}
            </span>
            +
            <span className="flex min-h-20 min-w-20 flex-col items-center justify-center rounded-2xl border-2 border-line px-3 shadow-edge">
              {getVowelLabel(question.vowel)}
              <span className="flex gap-2 pb-1 font-sans text-sm leading-tight text-ink-muted">
                <span className="font-bold" lang="en">
                  {question.vowel.sound}
                </span>{' '}
                <span className="font-burmese" lang="my">
                  {question.vowel.pronunciation}
                </span>
              </span>
            </span>
          </p>
        ) : (
          <p
            className="grid min-h-28 min-w-28 place-items-center rounded-3xl border-2 border-line px-4 font-thai text-[3.5rem] leading-[1.4] font-medium shadow-edge"
            lang="th"
          >
            {question.syllable}
          </p>
        )}

        {question.kind === 'spell' ? (
          <ul className="grid w-full gap-3 md:grid-cols-3" aria-label="Answer options" role="list">
            {question.options.map((option) => (
              <li key={option}>
                <AnswerOption {...optionProps(option)}>
                  <span className="font-thai text-[1.625rem] leading-[1.3] font-medium" lang="th">
                    {option}
                  </span>
                </AnswerOption>
              </li>
            ))}
          </ul>
        ) : (
          <ul className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3" aria-label="Tones" role="list">
            {tones.map((item) => (
              <li key={item.id}>
                <AnswerOption {...optionProps(item.id)} compact>
                  <ToneContour pitch={item.pitch} />
                  <span className="font-bold">{item.name}</span>
                </AnswerOption>
              </li>
            ))}
          </ul>
        )}

        {answered && (
          <p className="flex flex-wrap items-baseline justify-center gap-x-2 text-center text-ink-muted">
            <span className="font-thai font-medium text-ink" lang="th">
              {question.consonant.character}
            </span>{' '}
            <span className="font-burmese" lang="my">
              {consonantClass?.burmeseName}
            </span>{' '}
            +{' '}
            <span className="font-thai font-medium text-ink" lang="th">
              {getVowelLabel(question.vowel)}
            </span>{' '}
            <span className="font-burmese" lang="my">
              {guide.syllables[getSyllable(question.vowel)].name}
            </span>{' '}
            →{' '}
            <span className="font-thai font-medium text-ink" lang="th">
              {question.syllable}
            </span>{' '}
            <strong className="text-ink">{tone.name}</strong>
          </p>
        )}
      </section>

      <PracticeFeedback
        result={result}
        correctAnswer={question.kind === 'spell' ? <span lang="th">{question.syllable}</span> : tone.name}
        actionLabel={!answered ? 'Next' : isLastQuestion ? 'See results' : 'Continue'}
        actionDisabled={!answered && selected === null}
        onAction={handleAction}
      />
    </div>
  );
};

export default VowelPractice;
