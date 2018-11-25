import constants from '../constants';

export default class UnitSystem {

  static create_unit(ecs, data) {

    const map_id = ecs.get_entity_with_component('map');
    const map = ecs.get_component(map_id, 'map');

    const player = ecs.get_component(data.player, 'player');

    const units = map.units;
    if(units[data.tile_y][data.tile_x]) {
      throw new Error(`Already a Unit at ${data.tile_x},${data.tile_y}`);
    }

    const unit_id = ecs.create_entity_with_components({
      unit: Object.assign(data, {
        color: player.color
      })
    });

    units[data.tile_y][data.tile_x] = unit_id;

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
      const [x, y] = [
        unit.tile_x * constants.TILE_WIDTH + (constants.TILE_WIDTH / 2),
        unit.tile_y * constants.TILE_HEIGHT + (constants.TILE_HEIGHT / 2)
      ];
      
      UnitSystem._draw_unit(context, unit, x, y);

    }

  }

  static _draw_unit(context, unit, x, y) {

    context.save();
      
    context.translate(
      unit.tile_x * constants.TILE_WIDTH + (constants.TILE_WIDTH / 2),
      unit.tile_y * constants.TILE_HEIGHT + (constants.TILE_HEIGHT / 2)
    );
    context.fillStyle = unit.color;
    context.fillRect(
      -24,
      -24,
      constants.TILE_WIDTH - 16,
      constants.TILE_HEIGHT - 16
    );

    if(unit.moved) {

      context.save();

      context.fillStyle = 'black';
      context.globalAlpha = 0.5;
      context.fillRect(
        -24,
        -24,
        constants.TILE_WIDTH - 16,
        constants.TILE_HEIGHT - 16
      );

      context.restore();

    }

    if(unit.health < 10) {

      context.save();

      context.fillStyle = 'white';
      context.font = '32px serif';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(unit.health, 0, 0);

      context.restore();

    }

    context.restore();

  }

}