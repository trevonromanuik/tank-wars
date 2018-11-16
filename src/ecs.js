import clone from 'fast-clone';

export default class ECS {

  constructor() {
    this._entities = new Map();
    this._components = new Map();
    this._id = 0;
  }

  create_entity() {
    this._entities.set(this._id, new Set());
    return this._id++;
  }

  create_entity_with_components(components) {
    const id = this.create_entity();
    for(name in components) {
      this.add_component(id, name, components[name]);
    }
    return id;
  }

  destroy_entity(id) {
    if(!this._entities.has(id)) return;
    this._entities.get(id).forEach((name) => {
      if (!this._components.has(name)) return;
      this._components.get(name).delete(id);
    });
    this._entities.delete(id);
  }

  get_component(id, name) {
    if(!this._entities.has(id)) return null;
    if(!this._components.has(name)) return null;
    return clone(this._components.get(name).get(id));
  }

  add_component(id, name, data) {
    if(!this._entities.has(id)) return;
    this._entities.get(id).add(name);
    if(!this._components.has(name)) this._components.set(name, new Map());
    this._components.get(name).set(id, data);
  }

  remove_component(id, name) {
    if(!this._entities.has(id)) return;
    this._entities.get(id).delete(name);
    if(!this._components.has(name)) return;
    this._components.get(name).delete(id);
  }

  get_entity_with_component(name) {
    if(!this._components.has(name)) return null;
    return Array.from(this._components.get(name).keys())[0];
  }

  get_entities_with_component(name) {
    if(!this._components.has(name)) return null;
    return Array.from(this._components.get(name).keys());
  }

}