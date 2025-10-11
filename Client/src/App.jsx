import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './Pages/Login';
import SuperAdminDashboard from './Pages/SuperAdmin/SuperAdminDashboard';
import FacultyDashboard from './Pages/Faculty/FacultyDashboard';
import AdminDashboard from './Pages/Admin/AdminDashboard';
import PrivateRoute from './Routes/PrivateRoute';
import Assignment from './Pages/Faculty/Assignment';
import CreateUser from './Pages/SuperAdmin/CreateUser';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path='/login' element={<Login/>}/>

        <Route element={<PrivateRoute allowedRoles={["SuperAdmin"]}/>}>
          <Route path='/superadmin/dashboard' element={<SuperAdminDashboard/>}/>
          <Route path='/superadmin/create-users' element={<CreateUser/>}/>
        </Route>

        <Route element={<PrivateRoute allowedRoles={["Admin"]}/>}>
          <Route path='/admin/dashboard' element={<AdminDashboard/>}/>
        </Route>

        <Route element={<PrivateRoute allowedRoles={["Faculty"]}/>}>
          <Route path='/faculty/dashboard' element={<FacultyDashboard/>}/>
          <Route path='/faculty/assign' element={<Assignment/>}/>
        </Route>
      </Routes>
    </Router>

  )
}

export default App