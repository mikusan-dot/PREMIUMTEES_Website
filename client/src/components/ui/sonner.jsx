export const sonner = {
  success: (title, desc) => ({ type: 'success', title, description: desc }),
  error: (title, desc) => ({ type: 'error', title, description: desc }),
};
