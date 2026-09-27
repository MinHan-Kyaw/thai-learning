import { Navigate, Route, Routes } from 'react-router';

import Layout from './components/Layout';
import Consonants from './screens/Consonants';
import Home from './screens/Home';
import Practice from './screens/Practice';

const App = () => (
  <Routes>
    <Route element={<Layout />}>
      <Route index element={<Home />} />
      <Route path="consonants" element={<Consonants />} />
      <Route path="practice" element={<Practice />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Route>
  </Routes>
);

export default App;
