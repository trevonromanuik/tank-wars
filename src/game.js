import clone from 'fast-clone';

import constants from './constants';

import ECS from './ecs';
import MapSystem from './systems/map_system';
import UnitSystem from './systems/unit_system';
import CursorSystem from './systems/cursor_system';
import MenuSystem from './systems/menu_system';

import ResourceManager from './resource_manager';

import states from './states';
import maps from './maps';

export default class Game {

  constructor(canvas, settings) {

    this.context = canvas.getContext('2d');

    canvas.width = constants.SCREEN_WIDTH;
    canvas.height = constants.SCREEN_HEIGHT;

    canvas.imageSmoothingEnabled = false;

    this.settings = Object.assign({
      map: 'river'
    }, settings);

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

    const map_data = maps[this.settings.map];

    MapSystem.create_map(this.ecs, {
      tiles: map_data.tiles
    });

    map_data.units.forEach(({
      player_index,
      type,
      tile_x,
      tile_y
    }) => {
      UnitSystem.create_unit(this.ecs, {
        player_id: player_ids[player_index],
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
      ResourceManager.loadImage('damage_numbers', './assets/img/damage_numbers.png'),
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