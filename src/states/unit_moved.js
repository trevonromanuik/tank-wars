import constants from '../constants';

import CursorSystem from '../systems/cursor_system';
import MapSystem from '../systems/map_system';
import UnitSystem from '../systems/unit_system';
import PlayerSystem from '../systems/player_system';
import StateSystem from '../systems/state_system';

export default class UnitMovedState {

  static update(ts, ecs) {

    // get the game state
    const game_state_id = ecs.get_entity_with_component('game_state');
    const game_state = ecs.get_component(game_state_id, 'game_state');

    // get the unit
    const unit_id = game_state.selected_unit;
    const unit = ecs.get_component(unit_id, 'unit');

    unit.moved = true;

    StateSystem.clear_stack(ecs);

    game_state.state = constants.GAME_STATES.idle;

  }

  static draw(context, ecs) {
    MapSystem.draw_map(context, ecs);
    UnitSystem.draw_units(context, ecs);
    CursorSystem.draw_cursor(context, ecs);
    PlayerSystem.draw_player(context, ecs);
  }

}