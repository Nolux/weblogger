export const validateToken = (token) => {
  return token ? true : false;
};

export const checkIfAdmin = (locals) => {
  return locals.user.isAdmin;
};

export const checkIfOwner = (id, locals) => {
  return id === locals.user.id;
};
