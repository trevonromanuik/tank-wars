import constants from '../constants';
import utils from '../utils';

import CursorSystem from '../systems/cursor_system';
import MapSystem from '../systems/map_system';
import MenuSystem from '../systems/menu_system';
import UnitSystem from '../systems/unit_system';
import PlayerSystem from '../systems/player_system';

export default class EndTurnState {

  static update(ts, ecs) {

    // reset moved on all units to be false
    const unit_ids = ecs.get_entities_with_component('unit');
    unit_ids.forEach((unit_id) => {
      const unit = ecs.get_component(unit_id, 'unit');
      unit.moved = false;
    });

    const game_state_id = ecs.get_entity_with_component('game_state');
    const game_state = ecs.get_component(game_state_id, 'game_state');

    // increment the current_player_index
    game_state.current_player_index = (game_state.current_player_index + 1) % game_state.player_ids.length;

    // go back to idle state
    game_state.state = constants.GAME_STATES.idle;

  }

  static draw(context, ecs) {
    MapSystem.draw_map(context, ecs);
    UnitSystem.draw_units(context, ecs);
    PlayerSystem.draw_player(context, ecs);
  }

}