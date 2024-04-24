export const validateToken = (token) => {
  return token ? true : false;
};

export const checkIfAdmin = (locals) => {
  return locals.user.isAdmin ? true : false;
};
