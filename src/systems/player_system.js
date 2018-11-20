import constants from '../constants';

export default class PlayerSystem {

  static draw_player(context, ecs) {

    const game_state_id = ecs.get_entity_with_component('game_state');
    const game_state = ecs.get_component(game_state_id, 'game_state');

    const current_player_id = game_state.player_ids[game_state.current_player_index];
    const current_player = ecs.get_component(current_player_id, 'player');

    context.save();

    context.fillStyle = current_player.color;
    context.fillRect(
      640,
      0,
      128,
      32
    );

    context.restore();

  }

}