import clone from 'fast-clone';

import ResourceManager from '../resource_manager';

import constants from '../constants';
import * as unit_data from '../data/units.json';

export default class UnitSystem {

  static create_unit(ecs, {
    type,
    player_id,
    tile_x,
    tile_y
  }) {

    const map_id = ecs.get_entity_with_component('map');
    const map = ecs.get_component(map_id, 'map');

    const player = ecs.get_component(player_id, 'player');

    const units = map.units;
    if(units[tile_y][tile_x]) {
      throw new Error(`Already a Unit at ${tile_x},${tile_y}`);
    }

    const unit = clone(unit_data[type]);

    unit.player_id = player_id;
    unit.tile_x = tile_x;
    unit.tile_y = tile_y;
    unit.gas.cur = unit.gas.max;
    unit.health = 10;
    unit.color = player.color;

    unit.attacks.forEach((attack) => {
      attack.ammo.cur = attack.ammo.max;
    });

    const unit_id = ecs.create_entity_with_components({
      unit: unit
    });

    units[tile_y][tile_x] = unit_id;

  }

  static destroy_unit(ecs, unit_id) {

    const unit = ecs.get_component(unit_id, 'unit');
    ecs.destroy_entity(unit_id);

    const map_id = ecs.get_entity_with_component('map');
    const map = ecs.get_component(map_id, 'map');

    delete map.units[unit.tile_y][unit.tile_x];

  }

  static draw_units(context, ecs) {

    const unit_ids = ecs.get_entities_with_component('unit');
    for(let i = 0; i < unit_ids.length; i++) {
      const unit = ecs.get_component(unit_ids[i], 'unit');
      UnitSystem._draw_unit(context, unit);
    }

  }

  static _draw_unit(context, unit) {

    // create a buffer canvas
    const buffer = document.createElement('canvas');
    buffer.width = constants.TILE_WIDTH;
    buffer.height = constants.TILE_HEIGHT;
    const bx = buffer.getContext('2d');

    const image = ResourceManager.getImage(`units_${unit.color}`);
    const sprite = unit.sprites.idle;

    if(unit.color === 'red' || unit.color === 'green') {
      bx.translate(constants.TILE_WIDTH, 0);
      bx.scale(-1, 1);
    }

    bx.drawImage(
      image,
      sprite.x * constants.SPRITE_WIDTH,
      sprite.y * constants.SPRITE_HEIGHT,
      constants.SPRITE_WIDTH,
      constants.SPRITE_HEIGHT,
      0,
      0,
      constants.TILE_WIDTH,
      constants.TILE_HEIGHT
    );

    if(unit.moved) {
      bx.globalCompositeOperation = 'source-atop';
      bx.fillStyle = 'black';
      bx.globalAlpha = 0.5;
      bx.fillRect(0, 0, constants.TILE_WIDTH, constants.TILE_HEIGHT);
    }

    context.drawImage(
      buffer,
      unit.tile_x * constants.TILE_WIDTH,
      unit.tile_y * constants.TILE_HEIGHT,
      constants.TILE_WIDTH,
      constants.TILE_HEIGHT
    );
    
    if(unit.health < 10) {

      context.drawImage(
        ResourceManager.getImage('damage_numbers'),
        constants.SPRITE_WIDTH * unit.health,
        0,
        constants.SPRITE_WIDTH,
        constants.SPRITE_HEIGHT,
        unit.tile_x * constants.TILE_WIDTH,
        unit.tile_y * constants.TILE_HEIGHT,
        constants.TILE_WIDTH,
        constants.TILE_HEIGHT
      );

    }

  }

}