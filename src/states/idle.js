import constants from '../constants';
import utils from '../utils';

import CursorSystem from '../systems/cursor_system';
import MapSystem from '../systems/map_system';
import UnitSystem from '../systems/unit_system';

export default class IdleState {

  static update(ts, ecs) {

    CursorSystem.handle_arrow_keys(ecs);

    const input_id = ecs.get_entity_with_component('input_state');
    const input_state = ecs.get_component(input_id, 'input_state');

    if(utils.is_key_down(input_state.prev, input_state.cur, constants.KEYS.A)) {

      const cursor_id = ecs.get_entity_with_component('cursor');
      const cursor = ecs.get_component(cursor_id, 'cursor');

      const map_id = ecs.get_entity_with_component('map');
      const map = ecs.get_component(map_id, 'map');

      // if there is a unit under the cursor
      if(MapSystem.map_unit(map, cursor.tile_x, cursor.tile_y)) {
        
        // get the unit
        const unit_id = MapSystem.map_unit(map, cursor.tile_x, cursor.tile_y);
        const unit = ecs.get_component(unit_id, 'unit');

        // mark the unit as selected
        unit.selected = true;
        ecs.add_component(unit_id, 'unit', unit);

        // calculate the tiles the unit can move to
        const nodes = MapSystem.breadth_first_search(
          map, 
          cursor.tile_x,
          cursor.tile_y,
          0,
          unit.speed,
          true
        );

        // update the game state
        const game_state_id = ecs.get_entity_with_component('game_state');
        const game_state = ecs.get_component(game_state_id, 'game_state');

        game_state.selected_unit = unit_id;
        game_state.movement_tiles = nodes;
        game_state.state = constants.GAME_STATES.unit_selected;

        ecs.add_component(game_state_id, 'game_state', game_state);

      }

    }

  }

  static draw(context, ecs) {
    MapSystem.draw_map(context, ecs);
    UnitSystem.draw_units(context, ecs);
    CursorSystem.draw_cursor(context, ecs);
  }

}