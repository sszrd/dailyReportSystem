import Home from './pages/home';
import * as React from 'react';
import { FC, ReactElement } from 'react';
import * as ReactDOM from 'react-dom';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import Frame from './pages/frame';
import Login from './pages/login';

const App: FC = (): ReactElement => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/frame" />} />
        <Route path="/frame" element={<Frame />} >
          <Route path="" element={<Navigate to="/frame/home" />} />
          <Route path="home" element={<Home />} />
          <Route path="add" element={<div>add</div>} />
          <Route path="manage" element={<div>manage</div>} />
          <Route path="statistics" element={<div>statistics</div>} />
          <Route path="user" element={<div>user</div>} />
          <Route path="*" element={<Navigate to="/frame/home" />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/frame" />} />
      </Routes>
    </HashRouter>
  )
}

ReactDOM.render(<App />, document.getElementById('root'));