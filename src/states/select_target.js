import constants from '../constants';
import utils from '../utils';

import CursorSystem from '../systems/cursor_system';
import MapSystem from '../systems/map_system';
import UnitSystem from '../systems/unit_system';
import PlayerSystem from '../systems/player_system';
import StateSystem from '../systems/state_system';

export default class SelectTargetState {

  static update(ts, ecs) {

    const game_state_id = ecs.get_entity_with_component('game_state');
    const game_state = ecs.get_component(game_state_id, 'game_state');

    const input_id = ecs.get_entity_with_component('input_state');
    const input_state = ecs.get_component(input_id, 'input_state');

    const left = utils.is_key_down(input_state.prev, input_state.cur, constants.KEYS.LEFT);
    const right = utils.is_key_down(input_state.prev, input_state.cur, constants.KEYS.RIGHT);
    const a = utils.is_key_down(input_state.prev, input_state.cur, constants.KEYS.A);
    const b = utils.is_key_down(input_state.prev, input_state.cur, constants.KEYS.B);

    if(left ^ right) {
      if(left) {
        game_state.selected_target--;
        if(game_state.selected_target < 0) {
          game_state.selected_target = game_state.target_tiles.length - 1;
        }
      } else {
        game_state.selected_target++;
        if(game_state.selected_target >= game_state.target_tiles.length) {
          game_state.selected_target = 0;
        }
      }
    } else if(a) {
      
      const target_tile = game_state.target_tiles[game_state.selected_target];
      const target_id = target_tile.unit_id;
      const target_unit = ecs.get_component(target_id, 'unit');
      target_unit.health -= 2; // TODO: damage

      if(target_unit.health <= 0) UnitSystem.destroy_unit(ecs, target_id);

      game_state.state = constants.GAME_STATES.unit_moved;

    } else if(b) {

      StateSystem.pop_state(ecs);

    }

  }

  static draw(context, ecs) {
    MapSystem.draw_map(context, ecs);
    MapSystem.draw_target_tiles(context, ecs);
    UnitSystem.draw_units(context, ecs);
    CursorSystem.draw_target_cursor(context, ecs);
    PlayerSystem.draw_player(context, ecs);
  }

}