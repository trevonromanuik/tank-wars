import clone from 'fast-clone';

import constants from './constants';

import ECS from './ecs';
import MapSystem from './systems/map_system';
import UnitSystem from './systems/unit_system';
import CursorSystem from './systems/cursor_system';
import MenuSystem from './systems/menu_system';

import ResourceManager from './resource_manager';

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
        [2, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 2],
        [1, 1, 4, 4, 4, 4, 6, 6, 6, 4, 4, 4, 4, 1, 1],
        [3, 3, 4, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 3, 3],
        [5, 5, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 4, 5, 5],
        [1, 1, 4, 1, 1, 1, 3, 3, 3, 1, 1, 1, 4, 1, 1],
        [7, 4, 4, 4, 4, 4, 4, 3, 4, 4, 4, 4, 4, 4, 7],
        [1, 1, 1, 1, 1, 1, 1, 3, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 6, 6, 3, 3, 3, 6, 6, 1, 1, 1, 1],
        [1, 1, 1, 1, 2, 3, 3, 3, 3, 3, 2, 1, 1, 1, 1],
        [1, 6, 6, 2, 2, 2, 2, 2, 2, 2, 2, 2, 6, 6, 1]
      ]
    });

    const red_units = [{
      type: 'tank',
      tile_x: 2,
      tile_y: 4
    }, {
      type: 'apc',
      tile_x: 1,
      tile_y: 5
    }, {
      type: 'infantry',
      tile_x: 1,
      tile_y: 6
    }, {
      type: 'infantry',
      tile_x: 2,
      tile_y: 6
    }, {
      type: 'mech',
      tile_x: 3,
      tile_y: 6
    }, {
      type: 'artillery',
      tile_x: 4,
      tile_y: 6
    }, {
      type: 'mech',
      tile_x: 1,
      tile_y: 7
    }, {
      type: 'recon',
      tile_x: 4,
      tile_y: 7
    }];

    red_units.forEach(({
      type,
      tile_x,
      tile_y
    }) => {
      UnitSystem.create_unit(this.ecs, {
        player_id: player_ids[0],
        type: type,
        tile_x: tile_x,
        tile_y: tile_y
      });
    });

    const blue_units = [{
      type: 'tank',
      tile_x: 12,
      tile_y: 4
    }, {
      type: 'apc',
      tile_x: 13,
      tile_y: 5
    }, {
      type: 'infantry',
      tile_x: 13,
      tile_y: 6
    }, {
      type: 'infantry',
      tile_x: 12,
      tile_y: 6
    }, {
      type: 'mech',
      tile_x: 11,
      tile_y: 6
    }, {
      type: 'artillery',
      tile_x: 10,
      tile_y: 6
    }, {
      type: 'mech',
      tile_x: 13,
      tile_y: 7
    }, {
      type: 'recon',
      tile_x: 10,
      tile_y: 7
    }];

    blue_units.forEach(({
      type,
      tile_x,
      tile_y
    }) => {
      UnitSystem.create_unit(this.ecs, {
        player_id: player_ids[1],
        type: type,
        tile_x: tile_x,
        tile_y: tile_y
      });
    });

    this.ecs.create_entity_with_components({
      cursor: {
        tile_x: 2,
        tile_y: 2
      }
    });

    Promise.all([
      ResourceManager.loadImage('units_blue', './assets/img/units_blue.png'),
      ResourceManager.loadImage('units_green', './assets/img/units_green.png'),
      ResourceManager.loadImage('units_red', './assets/img/units_red.png'),
      ResourceManager.loadImage('units_yellow', './assets/img/units_yellow.png'),
    ]).then(() => {
      this.run();
    });

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