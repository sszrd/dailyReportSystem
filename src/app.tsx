import * as React from 'react';
import { FC, ReactElement } from 'react';
import * as ReactDOM from 'react-dom';
import { HashRouter, Route, Routes } from 'react-router-dom';
import Frame from './pages/frame';

const App: FC = (): ReactElement => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Frame />}>
          <Route path="" element={<div>home</div>} />
          <Route path="home" element={<div>home</div>} />
          <Route path="add" element={<div>add</div>} />
          <Route path="manage" element={<div>manage</div>} />
          <Route path="statistics" element={<div>statistics</div>} />
          <Route path="user" element={<div>user</div>} />
          <Route path="*" element={<div>home</div>} />
        </Route>
      </Routes>
    </HashRouter>
  )
}

ReactDOM.render(<App />, document.getElementById('root'));