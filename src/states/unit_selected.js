import clone from 'fast-clone';

import constants from '../constants';
import utils from '../utils';

import CursorSystem from '../systems/cursor_system';
import MapSystem from '../systems/map_system';
import MenuSystem from '../systems/menu_system';
import UnitSystem from '../systems/unit_system';
import PlayerSystem from '../systems/player_system';
import StateSystem from '../systems/state_system';

export default class UnitSelectedState {

  static update(ts, ecs) {

    CursorSystem.handle_arrow_keys(ecs);

    const input_id = ecs.get_entity_with_component('input_state');
    const input_state = ecs.get_component(input_id, 'input_state');

    // get the cursor
    const cursor_id = ecs.get_entity_with_component('cursor');
    const cursor = ecs.get_component(cursor_id, 'cursor');

    // get the game state
    const game_state_id = ecs.get_entity_with_component('game_state');
    const game_state = ecs.get_component(game_state_id, 'game_state');

    // get the unit
    const unit_id = game_state.selected_unit;
    const unit = ecs.get_component(unit_id, 'unit');

    // get the map
    const map_id = ecs.get_entity_with_component('map');
    const map = ecs.get_component(map_id, 'map');

    const movement_tiles = game_state.movement_tiles;

    if(utils.is_key_down(input_state.prev, input_state.cur, constants.KEYS.A)) {

      const current_player_id = game_state.player_ids[game_state.current_player_index];
      if(unit.player_id !== current_player_id) return;

      // check if we can move the selected unit to this tile
      if(!movement_tiles[`${cursor.tile_x},${cursor.tile_y}`]) return;

      const cursor_unit_id = MapSystem.map_unit(map, cursor.tile_x, cursor.tile_y);
      if(cursor_unit_id && cursor_unit_id !== unit_id) return;

      // push the state
      StateSystem.push_state(ecs);

      game_state.state = constants.GAME_STATES.unit_moving;

    } else if(utils.is_key_down(input_state.prev, input_state.cur, constants.KEYS.B)) {

      // pop the state
      StateSystem.pop_state(ecs);

    } else if(movement_tiles[`${cursor.tile_x},${cursor.tile_y}`]) {
      
      const x = cursor.tile_x;
      const y = cursor.tile_y;

      const last_step = game_state.movement_path[game_state.movement_path.length - 1];
      if(last_step.x === x && last_step.y === y) return;

      const dx = Math.abs(x - last_step.x);
      const dy = Math.abs(y - last_step.y);
      if(dx + dy > 1) {

        // they moved more than one tile - just reset path
        game_state.movement_path = clone(movement_tiles[`${x},${y}`].path);

      } else {

        // first check if they are re-traversing the path
        let found = false;
        for(let i = 0; i < game_state.movement_path.length; i++) {
          const cur_step = game_state.movement_path[i];
          if(cur_step.x === x && cur_step.y === y) {
            found = true;
            game_state.movement_path.splice(i + 1);
            break;
          }
        }

        if(!found) {

          const tile = MapSystem.map_tile(map, x, y);
          const cost = last_step.cost + MapSystem.get_tile_cost(unit.move_type, tile);

          if(cost > unit.move) {

            // they moved to far - just reset path
            game_state.movement_path = clone(movement_tiles[`${x},${y}`].path);

          } else {

            // else push this step onto path
            game_state.movement_path.push({ x, y, cost });

          }

        }

      }

    }

  }

  static draw(context, ecs) {
    MapSystem.draw_map(context, ecs);
    MapSystem.draw_movement_tiles(context, ecs);
    UnitSystem.draw_units(context, ecs);
    MapSystem.draw_movement_path(context, ecs);
    CursorSystem.draw_cursor(context, ecs);
    PlayerSystem.draw_player(context, ecs);
  }

}