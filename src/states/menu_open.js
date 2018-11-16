import constants from '../constants';
import utils from '../utils';

import MapSystem from '../systems/map_system';
import MenuSystem from '../systems/menu_system';
import UnitSystem from '../systems/unit_system';

export default class MenuOpenState {

  static update(ts, ecs) {

    const menu_id = ecs.get_entity_with_component('menu');
    const menu = ecs.get_component(menu_id, 'menu');

    const input_id = ecs.get_entity_with_component('input_state');
    const input_state = ecs.get_component(input_id, 'input_state');

    const up = utils.is_key_down(input_state.prev, input_state.cur, constants.KEYS.UP);
    const down = utils.is_key_down(input_state.prev, input_state.cur, constants.KEYS.DOWN);

    if(up ^ down) {
      if(up) {
        if(menu.selected_index > 0) {
          menu.selected_index -= 1;
        }
      } else {
        if(menu.selected_index < (menu.items.length - 1)) {
          menu.selected_index += 1;
        }
      }
    } 
    
    ecs.add_component(menu_id, 'menu', menu);
    
    if(utils.is_key_down(input_state.prev, input_state.cur, constants.KEYS.A)) {

      const game_state_id = ecs.get_entity_with_component('game_state');
      const game_state = ecs.get_component(game_state_id, 'game_state');

      game_state.state = menu.items[menu.selected_index].state;
      ecs.add_component(game_state_id, 'game_state', game_state);

      ecs.destroy_entity(menu_id);

    }

  }

  static draw(context, ecs) {
    MapSystem.draw_map(context, ecs);
    UnitSystem.draw_units(context, ecs);
    MenuSystem.draw_menu(context, ecs);
  }

}