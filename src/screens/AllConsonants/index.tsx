import ConsonantCard from '../../components/ConsonantCard';
import { consonants } from '../../data';

const AllConsonants = () => (
  <main className="min-h-dvh p-3">
    <h1 className="sr-only">All Thai consonants</h1>
    <ul className="grid grid-cols-[repeat(auto-fill,minmax(6.75rem,1fr))] gap-2" aria-label="All Thai consonants" role="list">
      {consonants.map((consonant) => (
        <li key={consonant.id}>
          <ConsonantCard consonant={consonant} size="compact" showWord={false} />
        </li>
      ))}
    </ul>
  </main>
);

export default AllConsonants;
