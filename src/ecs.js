export default class ECS {

  constructor() {
    this._entities = {};
    this._components = {};
    this._id = 0;
  }

  create_entity() {
    this._entities[this._id] = {};
    return this._id++;
  }

  create_entity_with_components(components) {
    const id = this.create_entity();
    Object.keys(components).forEach((name) => {
      this.add_component(id, name, components[name]);
    });
    return id;
  }

  destroy_entity(id) {
    if(!this._entities[id]) return;
    Object.keys(this._entities[id]).forEach((name) => {
      if (!this._components[name]) return;
      delete this._components[name][id];
    });
    delete this._entities[id];
  }

  get_component(id, name) {
    if(!this._entities[id]) return null;
    if(!this._components[name]) return null;
    return this._components[name][id];
  }

  add_component(id, name, data) {
    if(!this._entities[id]) return;
    this._entities[id][name] = true;
    if(!this._components[name]) this._components[name] = {};
    this._components[name][id] = data;
  }

  remove_component(id, name) {
    if(!this._entities[id]) return;
    delete this._entities[id][name];
    if(!this._components[name]) return;
    delete this._components[name][id];
  }

  get_entity_with_component(name) {
    if(!this._components[name]) return null;
    return Object.keys(this._components[name])[0];
  }

  get_entities_with_component(name) {
    if(!this._components[name]) return null;
    return Object.keys(this._components[name]);
  }

}