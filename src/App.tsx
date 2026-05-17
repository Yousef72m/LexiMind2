/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { ImportMaterial } from './pages/ImportMaterial';
import { StudyModes } from './pages/StudyModes';
import { VocabList } from './pages/VocabList';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/import" element={<ImportMaterial />} />
          <Route path="/study" element={<StudyModes />} />
          <Route path="/list" element={<VocabList />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
