import constants from '../constants';

import CursorSystem from '../systems/cursor_system';
import MapSystem from '../systems/map_system';
import MenuSystem from '../systems/menu_system';
import UnitSystem from '../systems/unit_system';
import PlayerSystem from '../systems/player_system';

// how long it takes for a unit to move one tile
const UNIT_MOVE_TIME = 150;

export default class UnitMovingState {

  static update(ts, ecs) {

    // get the game state
    const game_state_id = ecs.get_entity_with_component('game_state');
    const game_state = ecs.get_component(game_state_id, 'game_state');

    // get the unit
    const unit_id = game_state.selected_unit;
    const unit = ecs.get_component(unit_id, 'unit');

    if(!game_state.unit_moving_time) game_state.unit_moving_time = 0;
    game_state.unit_moving_time += ts;

    const i = Math.floor(game_state.unit_moving_time / UNIT_MOVE_TIME);
    if(i < game_state.movement_path.length - 1) {

      let cur_step = game_state.movement_path[i];
      let next_step = game_state.movement_path[i + 1];

      let dt = game_state.unit_moving_time % UNIT_MOVE_TIME;

      unit.tile_x = cur_step.x + (next_step.x - cur_step.x) * (dt / UNIT_MOVE_TIME);
      unit.tile_y = cur_step.y + (next_step.y - cur_step.y) * (dt / UNIT_MOVE_TIME);

    } else {

      let first_step = game_state.movement_path[0]; 
      let last_step = game_state.movement_path[game_state.movement_path.length - 1];

      delete game_state.movement_path;
      delete game_state.unit_moving_time;

      const map_id = ecs.get_entity_with_component('map');
      const map = ecs.get_component(map_id, 'map');

      // move the unit around on the units map
      delete map.units[first_step.y][first_step.x];
      map.units[last_step.y][last_step.x] = unit_id;

      // update the unit itself
      unit.tile_x = last_step.x;
      unit.tile_y = last_step.y;
      delete unit.selected;

      // add the default menu items
      const menu_items = [{
        state: constants.GAME_STATES.unit_moved,
        text: 'Wait'
      }];

      const melee_attack = unit.attacks.find((attack) => {
        return attack.range.min === 1;
      });

      if(first_step === last_step || melee_attack) {

        // check if there are any enemies in range
        const nodes = Object.values(MapSystem.calculate_target_tiles(ecs, map, unit));

        const target_tiles = [];
        for(let i = 0; i < nodes.length; i++) {
          
          const other_unit_id = MapSystem.map_unit(map, nodes[i].x, nodes[i].y);
          if(!other_unit_id) continue;

          const other_unit = ecs.get_component(other_unit_id, 'unit');
          if(other_unit.player_id !== unit.player_id) {
            target_tiles.push({ x: nodes[i].x, y: nodes[i].y, unit_id: other_unit_id });
          }

        }

        if(target_tiles.length) {
          
          game_state.selected_target = 0;
          game_state.target_tiles = target_tiles;
          
          menu_items.unshift({
            state: constants.GAME_STATES.select_target,
            text: 'Fire'
          });

        }
        
      }

      // show a menu
      MenuSystem.create_menu(ecs, {
        items: menu_items
      });

      // update the game_state
      game_state.state = constants.GAME_STATES.menu_open;

    }

  }

  static draw(context, ecs) {
    MapSystem.draw_map(context, ecs);
    UnitSystem.draw_units(context, ecs);
    CursorSystem.draw_cursor(context, ecs);
    PlayerSystem.draw_player(context, ecs);
  }

}