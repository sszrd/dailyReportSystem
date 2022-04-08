import Home from './pages/home';
import * as React from 'react';
import { FC, ReactElement } from 'react';
import * as ReactDOM from 'react-dom';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import Frame from './pages/frame';
import Login from './pages/login';
import Plan from './pages/plan';
import Report from './pages/report';
import Detail from './pages/detail';
import Statistics from './pages/statistics';

const App: FC = (): ReactElement => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/frame" />} />
        <Route path="/frame" element={<Frame />} >
          <Route path="" element={<Navigate to="/frame/home" />} />
          <Route path="home" element={<Home />} />
          <Route path="plan" element={<Plan />} />
          <Route path="report" element={<Report />} />
          <Route path="detail" element={<Detail />} />
          <Route path="statistics" element={<Statistics />} />
          <Route path="*" element={<Navigate to="/frame/home" />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/frame" />} />
      </Routes>
    </HashRouter>
  )
}

ReactDOM.render(<App />, document.getElementById('root'));