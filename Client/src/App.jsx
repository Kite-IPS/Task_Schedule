import React, { useEffect, useContext } from 'react'
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import Login from './Pages/Login';
import SuperAdminDashboard from './Pages/SuperAdmin/SuperAdminDashboard';
import FacultyDashboard from './Pages/Faculty/FacultyDashboard';
import AdminDashboard from './Pages/Admin/AdminDashboard';
import PrivateRoute from './Routes/PrivateRoute';
import Assignment from './Pages/Faculty/Assignment';
import Users from './Pages/Admin/Users';
import CreateUser from './Pages/SuperAdmin/CreateUser';
import { UserContext } from './Context/userContext';
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Root />} />
        <Route path='/login' element={<Login />} />
        <Route element={<PrivateRoute allowedRoles={["SuperAdmin"]} />}>
          <Route path='/superadmin/dashboard' element={<SuperAdminDashboard />} />
          <Route path='/superadmin/create-users' element={<CreateUser />} />
        </Route>
        <Route element={<PrivateRoute allowedRoles={["Admin"]} />}>
          <Route path='/admin/dashboard' element={<AdminDashboard />} />
          <Route path='/admin/users' element={<Users />} />
        </Route>
        <Route element={<PrivateRoute allowedRoles={["Faculty"]} />}>
          <Route path='/faculty/dashboard' element={<FacultyDashboard />} />
          <Route path='/faculty/assign' element={<Assignment />} />
        </Route>
      </Routes>
    </Router>
  )
}
export default App


const Root = () =>{
  const { user, loading } = useContext(UserContext);

  if(loading) return <Outlet />

  if(!user){
    return <Navigate to="/login" />
  }
  
  return user.role.toLowerCase() === 'admin' ? <Navigate to="/admin/dashboard" /> : user.role.toLowerCase() === 'faculty'? '/faculty/dashboard' : <Navigate to="/superUser/dashboard" />
}