import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const requireAdmin = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('pt_admin_token');

  useEffect(() => {
    if (!token) {
      navigate('/admin/login');
    }
  }, [navigate, token]);

  return null;
};
