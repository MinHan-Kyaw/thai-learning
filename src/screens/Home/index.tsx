import ButtonLink from '../../components/Button/ButtonLink';
import { consonantClasses, consonants } from '../../data';
import { getConsonantsByClass } from '../../helpers/vocabulary';

import styles from './index.module.css';

const HERO_LETTERS = ['ก', 'ข', 'ค'];

const Home = () => (
  <section className={styles.home} aria-labelledby="home-title">
    <ul className={styles.letters} aria-hidden="true">
      {HERO_LETTERS.map((letter) => (
        <li key={letter} className={styles.letter} lang="th">
          {letter}
        </li>
      ))}
    </ul>
    <h1 id="home-title" className={styles.title}>
      Thai Learning
    </h1>
    <p className={styles.subtitle}>Learn Thai step by step</p>
    <div className={styles.actions}>
      <ButtonLink to="/consonants" variant="secondary" fullWidth>
        Explore Consonants
      </ButtonLink>
      <ButtonLink to="/practice" fullWidth>
        Start Practice
      </ButtonLink>
    </div>
    <ul className={styles.classes} aria-label="Consonant classes">
      {consonantClasses.map((consonantClass) => (
        <li key={consonantClass.id} className={styles.classItem}>
          <span className={styles.classCount}>{getConsonantsByClass(consonants, consonantClass.id).length}</span>
          <span className={styles.className}>{consonantClass.name}</span>
        </li>
      ))}
    </ul>
  </section>
);

export default Home;
