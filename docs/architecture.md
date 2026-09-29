# Architecture

## Principles

1. Client-side only until persistence is actually required.
2. Learning content is data (`src/data/*.json`), never component code.
3. Burmese pronunciation is curated content and is never generated.
4. Thai audio is a separate asset from Burmese pronunciation.
5. Components present; screens compose; helpers compute; services perform side effects.
6. No abstraction before a real requirement.

## Layers

```mermaid
flowchart LR
  JSON["src/data/*.json"] --> Loader["src/data/index.ts<br/>(typed exports)"]
  Loader --> Screens
  Helpers["src/helpers<br/>(pure functions)"] --> Screens
  Services["src/services<br/>audio.ts · sound.ts · speech.ts"] --> Screens
  Screens["src/screens<br/>Home · Consonants · Practice"] --> Components["src/components<br/>(presentational)"]
```

| Layer         | Responsibility                                      | May import                             |
| ------------- | --------------------------------------------------- | -------------------------------------- |
| `data/`       | Static content and its typed loader                 | `types/`                               |
| `helpers/`    | Pure, deterministic-when-seeded logic               | `types/`, `constants/`, other helpers  |
| `services/`   | Browser side effects (audio)                        | nothing app-specific                   |
| `components/` | Rendering and user interaction via props            | `helpers/`, `types/`, other components |
| `screens/`    | Routing targets: state, data, services, composition | everything                             |

## Routing

`BrowserRouter` with `basename = import.meta.env.BASE_URL`, so the app works at a domain root or a sub-path.

| Path                                  | Screen                                                        |
| ------------------------------------- | ------------------------------------------------------------- |
| `/`                                   | Home                                                          |
| `/consonants?class=middle\|high\|low` | Consonant browser (class kept in the URL so it can be linked) |
| `/practice`                           | Picture quiz                                                  |
| `*`                                   | Redirects to `/`                                              |

Static hosts must serve `index.html` for unknown paths. Cloudflare Pages does this automatically because the build has no
`404.html`.

## Data model

Types live in `src/types/learning.ts`.

```ts
type ConsonantClassId = 'middle' | 'high' | 'low';

interface ConsonantClass {
  id: ConsonantClassId;
  group: number; // 1 middle, 2 high, 3 low — the numbers asked in group questions
  name: string; // "Middle Class" — headings, badges
  shortName: string; // "Middle" — class tabs
  burmeseName: string;
  tone: string;
}

interface Word {
  id: string; // "<consonant>-<thai>", e.g. "ก-ไก่"
  thai: string; // "ไก่"
  pronunciation: string; // Burmese pronunciation as given in the source, e.g. "ကောကိုင်"
  meaning: string; // Burmese meaning, e.g. "ကြက်"
  image?: string; // "/images/words/kai.svg"
  audio?: string; // "/audio/words/kai.m4a"
}

interface Consonant {
  id: string;
  character: string;
  class: ConsonantClassId;
  words: Word[];
}

type AnswerMode = 'select' | 'class' | 'type' | 'speak';

interface PracticeQuestion {
  id: string;
  answer: VocabularyItem;
  options: VocabularyItem[]; // always generated, so any question can fall back to select
  mode: AnswerMode;
}
```

`words` is an array so a consonant can gain more vocabulary later without a schema change. Asset paths are stored
root-relative and resolved at render time with `assetUrl()` so a sub-path deployment still works.

## Practice engine

`src/helpers/practice.ts` is pure and UI-free.

- `generatePracticeQuestions(vocabulary, { questionCount, optionCount, modes, random })`
  - pool = vocabulary items that have an image;
  - shuffles the pool (question order) and takes `QUESTION_COUNT` (10) answers, each asked once;
  - for each answer picks `ANSWER_OPTION_COUNT - 1` (2) distractors from the same pool with unique Thai text;
  - shuffles the options so the correct position varies;
  - gives each question a random answer mode from `modes` (default `['select']`) via `assignAnswerModes`.
  - `random` is injectable for deterministic tests. `randomizeArray` never mutates its input.
- `getAnswerModes({ advanced, enabled })`: `select` only when Advanced is off; otherwise `select` plus each of
  `class`, `type` and `speak` that is enabled. The Practice screen enables them with the Audio / Type / Group checkboxes
  in the ⋮ menu right of the Advanced toggle, and leaves `speak` out when the
  browser has no speech recognition. "Can't speak now" unticks Audio.
- `practiceReducer(state, action)` drives the session:

```mermaid
stateDiagram-v2
  [*] --> Unanswered: RESTART / initial state
  Unanswered --> Answering: SELECT_ANSWER (select, plays audio) / ENTER_RESPONSE (type, speak)
  Answering --> Answering: change the selection, text or spoken attempt
  Answering --> Evaluated: SUBMIT_ANSWER ("Next" or Enter) score += correct
  Evaluated --> Unanswered: NEXT_QUESTION ("Continue") more questions
  Evaluated --> Complete: NEXT_QUESTION ("See results") last question
  Complete --> Unanswered: RESTART ("Practice again")
  Evaluated --> Unanswered: RESTART (Advanced switched on or off)
  Answering --> Unanswered: RESTART (Advanced switched on or off)
```

Switching Advanced on or off, or ticking a question type, restarts the practice with new questions in the new modes. `SET_ANSWER_MODES`
("Can't speak now") re-assigns the modes of the current question, if it is not yet evaluated, and every later question;
a current question whose mode changes loses its unsubmitted answer.

```ts
interface PracticeState {
  questions: PracticeQuestion[];
  currentQuestionIndex: number;
  selectedAnswerId: string | null; // select questions
  response: string; // typed text or the chosen speech transcript
  answered: boolean;
  score: number;
}
```

Invalid transitions (answering after evaluation, answering in the wrong mode, submitting with nothing selected or blank
text, advancing before evaluation) return the same state object. State lives in `useReducer` inside the Practice screen
and is never persisted; the Advanced toggle is screen state and starts off on every visit.

### Answer modes

| Mode     | Prompt                                                  | Correct when                                                                 |
| -------- | ------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `select` | picture, "Which word is this?"                          | the chosen option is the answer                                              |
| `class`  | picture + `ก (ไก่)` and pronunciation, groups 1 / 2 / 3 | the chosen group is the letter's class (`VocabularyItem.consonantClass`)     |
| `type`   | picture + Burmese pronunciation hint                    | the text is the letter `ก`; `ไก่`, `ก ไก่`, `ก (ไก่)` or `กอ ไก่` also count |
| `speak`  | picture only, "Say this word"                           | a recognized transcript contains the word                                    |

`src/helpers/thaiAnswer.ts` compares after `normalizeThai` (NFKC, spaces, brackets and zero-width characters removed),
so mark order and `ำ`/`ํา` spellings don't matter. For `speak`, the recognizer returns up to 5 alternatives and the
first one containing the word is kept. Checking an answer plays a feedback sound; class, type and speak questions then play
the word's Thai audio once that sound has finished.

## Audio

`src/services/audio.ts` keeps a single `HTMLAudioElement`. `playAudio(src)` stops the current sound before starting the
next one, so rapid answer changes never overlap. Rejected playback (autoplay policy, missing file) is swallowed so
learning continues silently. Screens call `stopAudio()` on unmount and when moving to the next question.

## Feedback sounds

`src/services/sound.ts` synthesizes the check sounds with the Web Audio API, so there are no sound files: a rising
two-note chime for a correct answer and a low falling tone for an incorrect one (`FEEDBACK_SOUND_DURATION_MS` long).
One `AudioContext` is created lazily on the first check (a user gesture, as iOS requires) and resumed if the browser
suspended it. Missing Web Audio or any playback error is swallowed.

## Speech recognition

`src/services/speech.ts` wraps the Web Speech API (`SpeechRecognition`, or `webkitSpeechRecognition` in Safari).
`listen('th-TH')` runs one short recognition and always resolves, never rejects: `heard` with the transcripts,
`no-speech`, `blocked` (microphone permission or capture), `failed` (network, unsupported language…) or `aborted`.
Like audio, a single recognizer is active at a time; `stopListening()` aborts it. The Practice screen ignores results
that arrive after the question changed. Recognition runs on the browser vendor's service, so it needs a connection;
Firefox has no support, and there `speak` is never offered.

## Styling

Tailwind CSS 4 utilities in the markup, with the design tokens (colours, fonts, edge shadows, `xs` breakpoint, content
width) defined in the `@theme` block of `src/index.css`. The default Tailwind palette is disabled so only semantic tokens
exist. Visual direction: white background, green primary
actions with a pressed "shadow" edge, light-green supporting surfaces, rounded cards and buttons, large Thai glyphs.
Fonts are bundled with `@fontsource` (Nunito for UI, Noto Sans Thai Looped, Noto Sans Myanmar), so rendering does not
depend on the learner's installed fonts.

## Extending

- More vocabulary per consonant: append to `words`; the UI and practice pick it up automatically.
- Vowels/tones: add a new JSON file + type + screen; reuse `ConsonantCard`-style components and the practice engine
  (it only needs `VocabularyItem[]`).
- New practice modes: add a question generator beside `generatePracticeQuestions`; keep the reducer contract.
- Persistence/accounts: introduce a backend independently; content stays static JSON.
