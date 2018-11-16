import constants from '../constants';
import utils from '../utils';

import CursorSystem from '../systems/cursor_system';
import MapSystem from '../systems/map_system';
import MenuSystem from '../systems/menu_system';
import UnitSystem from '../systems/unit_system';

export default class UnitSelectedState {

  static update(ts, ecs) {

    CursorSystem.handle_arrow_keys(ecs);

    const input_id = ecs.get_entity_with_component('input_state');
    const input_state = ecs.get_component(input_id, 'input_state');

    if(utils.is_key_down(input_state.prev, input_state.cur, constants.KEYS.A)) {

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

      // check if we can move the selected unit to this tile
      const movement_tiles = game_state.movement_tiles;
      if(!movement_tiles[`${cursor.tile_x},${cursor.tile_y}`]) return;
      
      const cursor_unit_id = MapSystem.map_unit(map, cursor.tile_x, cursor.tile_y);
      if(cursor_unit_id && cursor_unit_id !== unit_id) return;

      // move the unit around on the units map
      delete map.units[unit.tile_y][unit.tile_x];
      map.units[cursor.tile_y][cursor.tile_x] = unit_id;
      ecs.add_component(map_id, 'map', map);

      // update the unit itself
      unit.prev_tile_x = unit.tile_x;
      unit.prev_tile_y = unit.tile_y;
      unit.tile_x = cursor.tile_x;
      unit.tile_y = cursor.tile_y;
      unit.rotation = 0;
      delete unit.selected;
      ecs.add_component(unit_id, 'unit', unit);

      // add the default menu items
      const menu_items = [{
        state: constants.GAME_STATES.idle,
        text: 'Wait'
      }];

      // check if there are any enemies in range
      const nodes = Object.values(MapSystem.breadth_first_search(
        map,
        cursor.tile_x,
        cursor.tile_y,
        1,
        1,
        false
      ));

      const target_tiles = [];
      for(let i = 0; i < nodes.length; i++) {
        
        const other_unit_id = MapSystem.map_unit(map, nodes[i].x, nodes[i].y);
        if(!other_unit_id) continue;

        const other_unit = ecs.get_component(other_unit_id, 'unit');
        if(other_unit.player !== unit.player) {
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

      // show a menu
      MenuSystem.create_menu(ecs, {
        items: menu_items
      });

      // update the game_state
      game_state.state = constants.GAME_STATES.menu_open;
      ecs.add_component(game_state_id, 'game_state', game_state);

    }

  }

  static draw(context, ecs) {
    MapSystem.draw_map(context, ecs);
    MapSystem.draw_movement_tiles(context, ecs);
    UnitSystem.draw_units(context, ecs);
    CursorSystem.draw_cursor(context, ecs);
  }

}