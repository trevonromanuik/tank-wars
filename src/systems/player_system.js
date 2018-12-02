import constants from '../constants';
import utils from '../utils';

export default class PlayerSystem {

  static draw_player(context, ecs) {

    const game_state_id = ecs.get_entity_with_component('game_state');
    const game_state = ecs.get_component(game_state_id, 'game_state');

    const current_player_id = game_state.player_ids[game_state.current_player_index];
    const current_player = ecs.get_component(current_player_id, 'player');

    context.save();

    context.fillStyle = current_player.color;
    context.fillRect(
      (constants.SCREEN_TILE_WIDTH - 2) * constants.TILE_WIDTH,
      0,
      2 * constants.TILE_WIDTH,
      constants.TILE_HEIGHT / 2
    );

    context.restore();

  }

  static draw_player_splash_screen(context, ecs) {

    const game_state_id = ecs.get_entity_with_component('game_state');
    const game_state = ecs.get_component(game_state_id, 'game_state');

    if(!game_state.splash_screen_alpha) return;

    const current_player_id = game_state.player_ids[game_state.current_player_index];
    const current_player = ecs.get_component(current_player_id, 'player');

    context.save();

    context.globalAlpha = game_state.splash_screen_alpha;

    context.fillStyle = current_player.color;
    context.fillRect(
      constants.TILE_WIDTH * 2,
      constants.TILE_HEIGHT * 3,
      constants.SCREEN_WIDTH - (constants.TILE_WIDTH * 4),
      constants.SCREEN_HEIGHT - (constants.TILE_HEIGHT * 6)
    )
    
    context.font = '48px mono';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = 'black';
    context.fillText(
      `${utils.capitalize(current_player.color)} Player's Turn`,
      constants.SCREEN_WIDTH / 2,
      constants.SCREEN_HEIGHT / 2
    );

    context.restore();

  }

}