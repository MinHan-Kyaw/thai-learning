import type { ReactNode } from 'react';

import type { ConsonantClass } from '../../types/learning';

interface ClassTableProps {
  consonantClasses: ConsonantClass[];
  firstColumnLabel: ReactNode;
  labelledBy: string;
  children: ReactNode;
}

const ClassTable = ({ consonantClasses, firstColumnLabel, labelledBy, children }: ClassTableProps) => (
  <div className="overflow-x-auto rounded-2xl border-2 border-line">
    <table className="w-full border-collapse text-center" aria-labelledby={labelledBy}>
      <thead>
        <tr className="border-b-2 border-line bg-brand-light">
          <th scope="col" className="px-2 py-2 text-left xs:px-3">
            {firstColumnLabel}
          </th>
          {consonantClasses.map((consonantClass) => (
            <th key={consonantClass.id} scope="col" className="px-1 py-2 font-bold xs:px-2">
              {consonantClass.shortName}{' '}
              <span className="font-thai font-medium text-brand" lang="th">
                {consonantClass.exampleConsonant}
              </span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  </div>
);

export default ClassTable;
