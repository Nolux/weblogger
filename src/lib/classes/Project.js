export const Project = class {
  constructor({ name, owner }) {
    this.name = name;
    this.owner = { name: owner.name, id: owner.id };
  }
};
