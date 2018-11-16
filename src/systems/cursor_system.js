import constants from '../constants';
import utils from '../utils';
import MapSystem from './map_system';
import MenuSystem from './menu_system';

export default class CursorSystem {

  static draw_cursor(context, ecs) {

    const cursor_id = ecs.get_entity_with_component('cursor');
    const cursor = ecs.get_component(cursor_id, 'cursor');

    context.save();
    
    context.strokeStyle = 'white';
    context.lineWidth = 8;
    context.strokeRect(
      cursor.tile_x * constants.TILE_WIDTH,
      cursor.tile_y * constants.TILE_HEIGHT,
      constants.TILE_WIDTH,
      constants.TILE_HEIGHT
    );

    context.restore();

  }

  static draw_target_cursor(context, ecs) {

    const game_state_id = ecs.get_entity_with_component('game_state');
    const game_state = ecs.get_component(game_state_id, 'game_state');
    
    const target_tile = game_state.target_tiles[game_state.selected_target];

    context.save();
    
    context.strokeStyle = 'darkred';
    context.lineWidth = 8;
    context.strokeRect(
      target_tile.x * constants.TILE_WIDTH,
      target_tile.y * constants.TILE_HEIGHT,
      constants.TILE_WIDTH,
      constants.TILE_HEIGHT
    );

    context.restore();

  }

  static handle_arrow_keys(ecs) {

    const cursor_id = ecs.get_entity_with_component('cursor');
    const cursor = ecs.get_component(cursor_id, 'cursor');

    const input_id = ecs.get_entity_with_component('input_state');
    const input_state = ecs.get_component(input_id, 'input_state');

    const map_id = ecs.get_entity_with_component('map');
    const map = ecs.get_component(map_id, 'map');

    const up = utils.is_key_down(input_state.prev, input_state.cur, constants.KEYS.UP);
    const down = utils.is_key_down(input_state.prev, input_state.cur, constants.KEYS.DOWN);
    const left = utils.is_key_down(input_state.prev, input_state.cur, constants.KEYS.LEFT);
    const right = utils.is_key_down(input_state.prev, input_state.cur, constants.KEYS.RIGHT);

    if(up ^ down) {
      if(up) {
        if(cursor.tile_y > 0) {
          cursor.tile_y -= 1;
        }
      } else {
        if(cursor.tile_y < MapSystem.map_height(map) - 1) {
          cursor.tile_y += 1;
        }
      }
    }

    if(left ^ right) {
      if(left) {
        if(cursor.tile_x > 0) {
          cursor.tile_x -= 1;
        }
      } else {
        if(cursor.tile_x < MapSystem.map_width(map) - 1) {
          cursor.tile_x += 1;
        }
      }
    }

    ecs.add_component(cursor_id, 'cursor', cursor)

  }

}