import constants from '../constants';
import utils from '../utils';

import CursorSystem from '../systems/cursor_system';
import MapSystem from '../systems/map_system';
import UnitSystem from '../systems/unit_system';
import MenuSystem from '../systems/menu_system';
import PlayerSystem from '../systems/player_system';

export default class ShowThreatState {

  static update(ts, ecs) {

    CursorSystem.handle_arrow_keys(ecs);

    const input_id = ecs.get_entity_with_component('input_state');
    const input_state = ecs.get_component(input_id, 'input_state');

    if(utils.is_key_up(input_state.prev, input_state.cur, constants.KEYS.B)) {

      const game_state_id = ecs.get_entity_with_component('game_state');
      const game_state = ecs.get_component(game_state_id, 'game_state');

      game_state.state = constants.GAME_STATES.idle;

    }

  }

  static draw(context, ecs) {
    MapSystem.draw_map(context, ecs);
    MapSystem.draw_target_tiles(context, ecs);
    UnitSystem.draw_units(context, ecs);
    CursorSystem.draw_cursor(context, ecs);
    PlayerSystem.draw_player(context, ecs);
  }

}