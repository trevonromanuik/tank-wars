import constants from '../constants';
import utils from '../utils';

import CursorSystem from '../systems/cursor_system';
import MapSystem from '../systems/map_system';
import UnitSystem from '../systems/unit_system';
import MenuSystem from '../systems/menu_system';
import PlayerSystem from '../systems/player_system';

export default class IdleState {

  static update(ts, ecs) {

    CursorSystem.handle_arrow_keys(ecs);

    const input_id = ecs.get_entity_with_component('input_state');
    const input_state = ecs.get_component(input_id, 'input_state');

    const cursor_id = ecs.get_entity_with_component('cursor');
    const cursor = ecs.get_component(cursor_id, 'cursor');

    const map_id = ecs.get_entity_with_component('map');
    const map = ecs.get_component(map_id, 'map');

    const game_state_id = ecs.get_entity_with_component('game_state');
    const game_state = ecs.get_component(game_state_id, 'game_state');

    if(utils.is_key_down(input_state.prev, input_state.cur, constants.KEYS.A)) {

      // check if there is a unit under the cursor
      const unit_id = MapSystem.map_unit(map, cursor.tile_x, cursor.tile_y);
      const unit = ecs.get_component(unit_id, 'unit');

      const current_player_id = game_state.player_ids[game_state.current_player_index];

      if(unit && unit.player === current_player_id && !unit.moved) {
        
        // mark the unit as selected
        unit.selected = true;

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
        game_state.selected_unit = unit_id;
        game_state.movement_tiles = nodes;
        game_state.state = constants.GAME_STATES.unit_selected;

      } else {

        // show the game menu
        MenuSystem.create_menu(ecs, {
          items: [{
            action: () => {
              game_state.state = constants.GAME_STATES.end_turn;
            },
            text: 'End Turn'
          }]
        });

        // update the game_state
        game_state.state = constants.GAME_STATES.menu_open;

      }

    } else if(utils.is_key_down(input_state.prev, input_state.cur, constants.KEYS.B)) {

      // check if there is a unit under the cursor
      const unit_id = MapSystem.map_unit(map, cursor.tile_x, cursor.tile_y);
      const unit = ecs.get_component(unit_id, 'unit');

      if(unit) {

        // calculate the tiles the unit can move to
        const nodes = Object.values(MapSystem.breadth_first_search(
          map,
          cursor.tile_x,
          cursor.tile_y,
          0,
          unit.speed + 1,
          (cost) => { return cost <= unit.speed; }
        ));
        
        // update the game state
        game_state.target_tiles = nodes;
        game_state.state = constants.GAME_STATES.show_threat;

      }

    }

  }

  static draw(context, ecs) {
    MapSystem.draw_map(context, ecs);
    UnitSystem.draw_units(context, ecs);
    CursorSystem.draw_cursor(context, ecs);
    PlayerSystem.draw_player(context, ecs);
  }

}