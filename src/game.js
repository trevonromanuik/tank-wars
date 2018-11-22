import clone from 'fast-clone';

import constants from './constants';

import ECS from './ecs';
import MapSystem from './systems/map_system';
import UnitSystem from './systems/unit_system';
import CursorSystem from './systems/cursor_system';
import MenuSystem from './systems/menu_system';

import states from './states';

export default class Game {

  constructor(canvas) {

    this.context = canvas.getContext('2d');

    canvas.width = constants.SCREEN_WIDTH;
    canvas.height = constants.SCREEN_HEIGHT;

    this.ecs = new ECS();

    this.pressed_keys = {};

    window.addEventListener('keydown', (e) => {
      this.pressed_keys[e.keyCode] = true;
    });

    window.addEventListener('keyup', (e) => {
      delete this.pressed_keys[e.keyCode];
    });

    this.preload();

  }

  preload() {

    const player_ids = [];

    player_ids.push(this.ecs.create_entity_with_components({
      player: {
        color: 'red'
      }
    }));

    player_ids.push(this.ecs.create_entity_with_components({
      player: {
        color: 'blue'
      }
    }));

    this.ecs.create_entity_with_components({
      game_state: {
        player_ids: player_ids,
        current_player_index: 0,
        state: constants.GAME_STATES.start_turn 
      }
    });

    this.ecs.create_entity_with_components({
      input_state: { prev: {}, cur: {} }
    });

    MapSystem.create_map(this.ecs, {
      tiles: [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 1, 0, 1, 1, 1, 1, 1, 2, 2, 1, 0],
        [0, 1, 0, 0, 0, 1, 1, 1, 1, 2, 1, 0],
        [0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0],
        [0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0],
        [0, 1, 0, 1, 1, 1, 1, 1, 3, 1, 1, 0],
        [0, 1, 0, 1, 1, 1, 1, 1, 1, 3, 1, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      ]
    });

    UnitSystem.create_unit(this.ecs, {
      player: player_ids[0],
      type: 'infantry',
      color: 'red',
      health: 10,
      tile_x: 5,
      tile_y: 5,
      speed: 4,
      rotation: 0
    });

    UnitSystem.create_unit(this.ecs, {
      player: player_ids[1],
      type: 'infantry',
      color: 'blue',
      health: 10,
      tile_x: 7,
      tile_y: 5,
      speed: 4,
      rotation: 0
    });

    UnitSystem.create_unit(this.ecs, {
      player: player_ids[1],
      type: 'infantry',
      color: 'blue',
      health: 10,
      tile_x: 6,
      tile_y: 6,
      speed: 4,
      rotation: 0
    });

    this.ecs.create_entity_with_components({
      cursor: {
        tile_x: 2,
        tile_y: 2
      }
    });

    this.run();
  }

  run() {
    let last_render = 0;
    let loop = (timestamp) => {
      let ts = timestamp - last_render;
      this.update(ts);
      this.draw();
      last_render = timestamp;
      window.requestAnimationFrame(loop);
    };
    window.requestAnimationFrame(loop);
  }

  update(ts) {

    let input_id = this.ecs.get_entity_with_component('input_state');
    let input_state = this.ecs.get_component(input_id, 'input_state');
    this.ecs.add_component(input_id, 'input_state', clone({
      prev: input_state.cur,
      cur: this.pressed_keys
    }));

    const game_state_id = this.ecs.get_entity_with_component('game_state');
    const game_state = this.ecs.get_component(game_state_id, 'game_state');
    states[game_state.state].update(ts, this.ecs);

  }

  draw() {
    
    const game_state_id = this.ecs.get_entity_with_component('game_state');
    const game_state = this.ecs.get_component(game_state_id, 'game_state');
    states[game_state.state].draw(this.context, this.ecs);

  }

}