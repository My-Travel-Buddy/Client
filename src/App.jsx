import { Routes, Route } from 'react-router';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import TasksPage from './pages/TasksPage';
import TripDetails from './pages/TripDetails';
import NotFoundPage from './pages/NotFoundPage';
import Trips from './pages/Trips';

// App maps every URL to a page. The Layout route wraps the others with the
// shared navbar; each child route renders inside Layout's <Outlet />.
// The "*" route catches anything that doesn't match (a 404).
function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/trips" element={<Trips/>}/>
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/trips/:id" element={<TripDetails />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
