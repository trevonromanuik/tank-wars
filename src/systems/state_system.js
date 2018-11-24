import constants from '../constants';

export default class StateSystem {

  static push_state(ecs) {

    let state_stack_id = ecs.get_entity_with_component('state_stack');

    if(!state_stack_id) {
      state_stack_id = ecs.create_entity_with_components({
        state_stack: {
          stack: []
        }
      });
    }

    const state_stack = ecs.get_component(state_stack_id, 'state_stack');

    const stack = state_stack.stack;
    state_stack.stack = [];

    stack.unshift(ecs.serialize());

    state_stack.stack = stack;

  }

  static pop_state(ecs) {

    const input_id = ecs.get_entity_with_component('input_state');
    const input_state = ecs.get_component(input_id, 'input_state');

    const state_stack_id = ecs.get_entity_with_component('state_stack');
    const state_stack = ecs.get_component(state_stack_id, 'state_stack');

    const data = state_stack.stack.shift();
    ecs.deserialize(data);

    ecs.add_component(input_id, 'input_state', input_state);
    ecs.add_component(state_stack_id, 'state_stack', state_stack);

  }

  static clear_stack(ecs) {

    const state_stack_id = ecs.get_entity_with_component('state_stack');
    let state_stack = ecs.get_component(state_stack_id, 'state_stack');

    state_stack.stack = [];

  }

}