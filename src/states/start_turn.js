import constants from '../constants';
import utils from '../utils';
import TimeDelta from '../time_delta';

import CursorSystem from '../systems/cursor_system';
import MapSystem from '../systems/map_system';
import MenuSystem from '../systems/menu_system';
import UnitSystem from '../systems/unit_system';
import PlayerSystem from '../systems/player_system';
import { isRegExp } from 'util';

const SPLASH_SCREEN_ANIMATION = [
  { t: TimeDelta({ seconds: 0 }), v: 0 },
  { t: TimeDelta({ seconds: 0.5 }), v: 1 },
  { t: TimeDelta({ seconds: 1.0 }), v: 1 },
  { t: TimeDelta({ seconds: 1.5 }), v: 0 }
];

export default class StartTurnState {

  static update(ts, ecs) {

    const game_state_id = ecs.get_entity_with_component('game_state');
    const game_state = ecs.get_component(game_state_id, 'game_state');

    if(!game_state.splash_screen_time) game_state.splash_screen_time = 0;
    game_state.splash_screen_time += ts;

    let i;
    for(i = 0; i < SPLASH_SCREEN_ANIMATION.length; i++) {
      if(game_state.splash_screen_time < SPLASH_SCREEN_ANIMATION[i].t) {
        break;
      }
    }

    if(i < SPLASH_SCREEN_ANIMATION.length) {
      
      let prev_frame = SPLASH_SCREEN_ANIMATION[i - 1];
      let next_frame = SPLASH_SCREEN_ANIMATION[i];

      let t = game_state.splash_screen_time - prev_frame.t;
      let td = next_frame.t - prev_frame.t;

      let v = prev_frame.v;
      let vd = next_frame.v - prev_frame.v;

      game_state.splash_screen_alpha = v + (t / td) * vd;

    } else {
      delete game_state.splash_screen_alpha;
      delete game_state.splash_screen_time;
      game_state.state = constants.GAME_STATES.idle;
    }

  }

  static draw(context, ecs) {
    MapSystem.draw_map(context, ecs);
    UnitSystem.draw_units(context, ecs);
    PlayerSystem.draw_player(context, ecs);
    PlayerSystem.draw_player_splash_screen(context, ecs);
  }

}