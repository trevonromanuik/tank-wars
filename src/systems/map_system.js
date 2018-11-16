import constants from '../constants';
import tile_definitions from '../tile_definitions';
import ResourceManager from '../resource_manager';

export default class MapSystem {

  static create_map(ecs, data) {

    data.units = new Array(data.tiles.length);
    for(let i = 0; i < data.tiles.length; i++) {
      data.units[i] = new Array(data.tiles[i].length);
    }

    ecs.create_entity_with_components({
      map: data
    });

  }

  static draw_map(context, ecs) {

    const map_id = ecs.get_entity_with_component('map');
    const map = ecs.get_component(map_id, 'map');

    context.save();

    for(let i = 0; i < map.tiles.length; i++) {
      for(let j = 0; j < map.tiles[i].length; j++) {        
        const tile_type = map.tiles[i][j];
        switch(tile_type) {
          case constants.TILE_TYPES.water:
            context.fillStyle = 'lightblue';
            break;
          case constants.TILE_TYPES.grass:
            context.fillStyle = 'green';
            break;
          case constants.TILE_TYPES.forest:
            context.fillStyle = 'darkgreen';
            break;
          case constants.TILE_TYPES.mountains:
            context.fillStyle = 'brown';
            break;
        }
        context.fillRect(
          j * constants.TILE_WIDTH, 
          i * constants.TILE_HEIGHT, 
          constants.TILE_WIDTH, 
          constants.TILE_HEIGHT
        );
      }
    }

    context.restore();

  }

  static draw_movement_tiles(context, ecs) {

    const game_state_id = ecs.get_entity_with_component('game_state');
    const game_state = ecs.get_component(game_state_id, 'game_state');

    context.save();

    const movement_tiles = Object.values(game_state.movement_tiles);
        
    context.fillStyle = 'blue';
    context.globalAlpha = 0.4;
    for(let i = 0; i < movement_tiles.length; i++) {
      const tile = movement_tiles[i];
      context.fillRect(
        tile.x * constants.TILE_WIDTH,
        tile.y * constants.TILE_HEIGHT,
        constants.TILE_WIDTH,
        constants.TILE_HEIGHT
      );
    }

    context.font = '32px serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    for(let i = 0; i < movement_tiles.length; i++) {
      const tile = movement_tiles[i];
      context.fillText(
        tile.cost,
        tile.x * constants.TILE_WIDTH + (constants.TILE_WIDTH / 2),
        tile.y * constants.TILE_HEIGHT + (constants.TILE_HEIGHT / 2)
      );
    }

    context.restore();

  }

  static draw_target_tiles(context, ecs) {

    const game_state_id = ecs.get_entity_with_component('game_state');
    const game_state = ecs.get_component(game_state_id, 'game_state');

    context.save();

    const target_tiles = game_state.target_tiles;

    context.fillStyle = 'red';
    context.globalAlpha = 0.5;
    for(let i = 0; i < target_tiles.length; i++) {
      const tile = target_tiles[i];
      context.fillRect(
        tile.x * constants.TILE_WIDTH,
        tile.y * constants.TILE_HEIGHT,
        constants.TILE_WIDTH,
        constants.TILE_HEIGHT
      );
    }

    context.restore();

  }

  static breadth_first_search(map, x, y, min_distance, max_distance, use_tile_costs) {

    const min_x = 0, max_x = MapSystem.map_width(map) - 1;
    const min_y = 0, max_y = MapSystem.map_height(map) - 1;

    const visited = {};
    const unvisited = [{ x, y, cost: 0 }];

    while(unvisited.length) {
      
      const node = unvisited.shift();
      visited[`${node.x},${node.y}`] = node;
      
      const neighbours = [
        [node.x - 1, node.y],
        [node.x + 1, node.y],
        [node.x, node.y - 1],
        [node.x, node.y + 1]
      ];

      for(let i = 0; i < neighbours.length; i++) {
        
        const neighbour = neighbours[i];
        const x = neighbour[0], y = neighbour[1];
        
        if(x < min_x || x > max_x || y < min_y || y > max_y) continue;
        if(visited[`${x},${y}`]) continue;
        
        const tile = MapSystem.map_tile(map, x, y);
        let cost = node.cost;
        
        if(use_tile_costs) {
          if(tile === 0) continue;
          if(tile === 3) continue;
          if(tile === 1) cost += 1;
          if(tile === 2) cost += 2;
        } else {
          cost += 1;
        }

        if(cost > max_distance) continue;

        unvisited.push({ x, y, cost });

      }

    }

    if(min_distance > 0) {      
      const filtered = {};
      const keys = Object.keys(visited);
      for(let i = 0; i < keys.length; i++) {
        const n = visited[keys[i]];
        if(n.cost >= min_distance) {
          filtered[keys[i]] = n;
        }
      }
      return filtered;
    }

    return visited;

  }

  static map_width(map) {
    return map.tiles[0].length;
  }

  static map_height(map) {
    return map.tiles.length;
  }

  static map_tile(map, x, y) {
    return map.tiles[y][x];
  }

  static map_unit(map, x, y) {
    return map.units[y][x];
  }

}