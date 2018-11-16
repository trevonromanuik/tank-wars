import constants from '../constants';

export default class UnitSystem {

  static create_unit(ecs, data) {

    const map_id = ecs.get_entity_with_component('map');
    const map = ecs.get_component(map_id, 'map');

    const units = map.units;
    if(units[data.tile_y][data.tile_x]) {
      throw new Error(`Already a Unit at ${data.tile_x},${data.tile_y}`);
    }

    const unit_id = ecs.create_entity_with_components({
      unit: data
    });

    units[data.tile_y][data.tile_x] = unit_id;
    ecs.add_component(map_id, 'map', map);

  }

  static draw_units(context, ecs) {

    const unit_ids = ecs.get_entities_with_component('unit');
    for(let i = 0; i < unit_ids.length; i++) {
      
      const unit = ecs.get_component(unit_ids[i], 'unit');
      
      context.save();
      
      context.translate(
        unit.tile_x * constants.TILE_WIDTH + (constants.TILE_WIDTH / 2),
        unit.tile_y * constants.TILE_HEIGHT + (constants.TILE_HEIGHT / 2)
      );
      context.fillStyle = unit.color;
      if(unit.rotation != 0) {
        context.rotate(unit.rotation * Math.PI / 180);
      }
      context.fillRect(
        -24,
        -24,
        constants.TILE_WIDTH - 16,
        constants.TILE_HEIGHT - 16
      );

      if(unit.health < 10) {
        context.fillStyle = 'white';
        context.font = '32px serif';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(unit.health, 0, 0);
      }

      context.restore();

    }

  }

}