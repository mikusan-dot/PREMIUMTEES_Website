import { Navigate } from 'react-router-dom';

// Wrap admin pages: visitors without a saved token are sent to the login page.
// (The server still checks the token on every API call; this just avoids showing
// an empty admin screen to people who are not signed in.)
export const RequireAdmin = ({ children }) => {
  const token = localStorage.getItem('pt_admin_token');
  if (!token) return <Navigate to="/admin/login" replace />;
  return children;
};
