import ButtonLink from '../../components/Button/ButtonLink';
import { consonantClasses, consonants } from '../../data';
import { classNames } from '../../helpers/classNames';
import { getConsonantsByClass } from '../../helpers/vocabulary';

const HERO_LETTERS = [
  { letter: 'ก', tilt: '-rotate-4' },
  { letter: 'ข', tilt: '-translate-y-2 rotate-4' },
  { letter: 'ค', tilt: '' },
];

const Home = () => (
  <section className="mx-auto mt-6 flex max-w-[30rem] flex-col items-center gap-6 text-center" aria-labelledby="home-title">
    <ul className="flex gap-3" aria-hidden="true">
      {HERO_LETTERS.map(({ letter, tilt }) => (
        <li
          key={letter}
          className={classNames(
            'grid size-18 place-items-center rounded-2xl border-2 border-brand-border bg-brand-light font-thai text-[2.5rem] font-medium text-brand shadow-edge-brand-soft',
            tilt
          )}
          lang="th"
        >
          {letter}
        </li>
      ))}
    </ul>
    <h1 id="home-title" className="text-[clamp(2.25rem,8vw,3rem)] leading-[1.1] font-extrabold">
      Thai Learning
    </h1>
    <p className="-mt-3 text-xl text-ink-muted">Learn Thai step by step</p>
    <div className="grid w-full gap-3">
      <ButtonLink to="/consonants" variant="secondary" fullWidth>
        Explore Consonants
      </ButtonLink>
      <ButtonLink to="/vowels" variant="secondary" fullWidth>
        Explore Vowels
      </ButtonLink>
      <ButtonLink to="/tones" variant="secondary" fullWidth>
        Learn Tones
      </ButtonLink>
      <ButtonLink to="/practice" fullWidth>
        Start Practice
      </ButtonLink>
    </div>
    <ul className="mt-2 grid w-full grid-cols-3 gap-3" aria-label="Consonant classes">
      {consonantClasses.map((consonantClass) => (
        <li key={consonantClass.id} className="flex flex-col rounded-2xl border-2 border-line px-2 py-3">
          <span className="text-2xl font-extrabold text-brand">{getConsonantsByClass(consonants, consonantClass.id).length}</span>
          <span className="text-sm text-ink-muted">{consonantClass.name}</span>
        </li>
      ))}
    </ul>
  </section>
);

export default Home;
