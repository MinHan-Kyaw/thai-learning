import { useEffect, useRef, useState } from 'react';

import AnswerOption from '../../components/AnswerOption';
import AudioButton from '../../components/AudioButton';
import CheckboxChips from '../../components/CheckboxChips';
import PracticeFeedback from '../../components/PracticeFeedback';
import PracticeSummary from '../../components/PracticeSummary';
import ProgressBar from '../../components/ProgressBar';
import type { AnswerResult } from '../../components/ResultIcon';
import ToneContour from '../../components/ToneContour';
import { consonantClasses, consonants, guide, toneById, tones, vowelGroups, vowels } from '../../data';
import { generateVowelQuestions, getSyllable, getVowelAnswer, getVowelLabel, isCombinable } from '../../helpers/vowels';
import { FEEDBACK_SOUND_DURATION_MS, playFeedbackSound } from '../../services/sound';
import { speakThai, stopSpeaking } from '../../services/voice';
import type { VowelGroupId } from '../../types/learning';

type GroupSelection = Partial<Record<VowelGroupId, boolean>>;

const practiceGroups = vowelGroups.filter((group) => vowels.some((vowel) => vowel.group === group.id && isCombinable(vowel)));
const ALL_GROUPS: GroupSelection = Object.fromEntries(practiceGroups.map((group) => [group.id, true]));

const buildQuestions = (groups: GroupSelection) =>
  generateVowelQuestions(
    consonants,
    vowels.filter((vowel) => groups[vowel.group])
  );

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
  const [groups, setGroups] = useState(ALL_GROUPS);
  const [questions, setQuestions] = useState(() => buildQuestions(ALL_GROUPS));
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const isFirstQuestion = useRef(true);
  const speakTimer = useRef<number | undefined>(undefined);
  const question = questions[index];

  useEffect(() => {
    if (isFirstQuestion.current) {
      isFirstQuestion.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [question?.id]);

  useEffect(
    () => () => {
      window.clearTimeout(speakTimer.current);
      stopSpeaking();
    },
    []
  );

  const silence = () => {
    window.clearTimeout(speakTimer.current);
    stopSpeaking();
  };

  const restart = (nextGroups = groups) => {
    silence();
    setQuestions(buildQuestions(nextGroups));
    setIndex(0);
    setSelected(null);
    setAnswered(false);
    setScore(0);
  };

  const handleGroupChange = (groupId: VowelGroupId, checked: boolean) => {
    const nextGroups = { ...groups, [groupId]: checked };
    setGroups(nextGroups);
    restart(nextGroups);
  };

  if (!question) {
    return (
      <PracticeSummary
        score={score}
        total={questions.length}
        onRestart={() => restart()}
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
      silence();
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
    if (question.kind === 'tone') {
      // Heard only after answering: the spoken syllable would give the tone away.
      const { syllable } = question;
      speakTimer.current = window.setTimeout(() => speakThai(syllable), FEEDBACK_SOUND_DURATION_MS);
    }
    if (isCorrect) {
      setScore(score + 1);
    }
  };

  const optionProps = (option: string) => ({
    selected: option === selected,
    result: getOptionResult(option, answer, selected, answered),
    disabled: answered,
    onSelect: () => {
      setSelected(option);
      if (question.kind === 'spell') {
        speakThai(option);
      }
    },
  });

  return (
    <div className="mx-auto flex max-w-[42rem] flex-col">
      <h1 className="sr-only">Vowel practice</h1>
      <CheckboxChips
        legend="Vowels to practise"
        options={practiceGroups.map((group) => ({
          id: group.id,
          checked: Boolean(groups[group.id]),
          label: (
            <>
              <span className="font-burmese leading-[1.8]" lang="my">
                {group.burmeseName}
              </span>
              <span className="sr-only"> {group.name}</span>{' '}
              <span className="text-sm">{vowels.filter((vowel) => vowel.group === group.id).length}</span>
            </>
          ),
        }))}
        onChange={handleGroupChange}
      />
      <div className="mt-3 mb-4 flex items-center gap-3">
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
          <p className="flex flex-wrap items-center justify-center gap-x-2 text-center text-ink-muted">
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
            <strong className="text-ink">{tone.name}</strong>{' '}
            <AudioButton label={`Hear ${question.syllable}`} onPlay={() => speakThai(question.syllable)} />
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
