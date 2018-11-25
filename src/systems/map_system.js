import constants from '../constants';

const DIRECTIONS = {
  UP: 1,
  RIGHT: 2,
  DOWN: 4,
  LEFT: 8
};

const TILE_COSTS = {
  0: Infinity,
  1: 1,
  2: 2,
  3: Infinity
};

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

  static draw_movement_path(context, ecs) {

    const game_state_id = ecs.get_entity_with_component('game_state');
    const game_state = ecs.get_component(game_state_id, 'game_state');
    const movement_path = game_state.movement_path;

    if(movement_path.length === 1) return;

    context.save();

    context.fillStyle = 'white';

    for(let i = 0; i < movement_path.length; i++) {
      
      const cur_step = movement_path[i];
      let d = 0;

      if(i > 0) {
        const prev_step = movement_path[i - 1];
        d += MapSystem._get_direction(cur_step, prev_step);
      }

      if(i < movement_path.length - 1) {
        const next_step = movement_path[i + 1];
        d += MapSystem._get_direction(cur_step, next_step);
      }

      if(d & DIRECTIONS.UP) {
        context.fillRect(
          (cur_step.x * constants.TILE_WIDTH) + (constants.TILE_WIDTH / 4),
          (cur_step.y * constants.TILE_HEIGHT),
          (constants.TILE_WIDTH / 2),
          (3 * constants.TILE_HEIGHT / 4)
        );
      }

      if(d & DIRECTIONS.RIGHT) {
        context.fillRect(
          (cur_step.x * constants.TILE_WIDTH) + (constants.TILE_WIDTH / 4),
          (cur_step.y * constants.TILE_HEIGHT) + (constants.TILE_HEIGHT / 4),
          (3 * constants.TILE_WIDTH / 4),
          (constants.TILE_HEIGHT / 2)
        );
      }

      if(d & DIRECTIONS.DOWN) {
        context.fillRect(
          (cur_step.x * constants.TILE_WIDTH) + (constants.TILE_WIDTH / 4),
          (cur_step.y * constants.TILE_HEIGHT) + (constants.TILE_HEIGHT / 4),
          (constants.TILE_WIDTH / 2),
          (3 * constants.TILE_HEIGHT / 4)
        );
      }

      if(d & DIRECTIONS.LEFT) {
        context.fillRect(
          (cur_step.x * constants.TILE_WIDTH),
          (cur_step.y * constants.TILE_HEIGHT) + (constants.TILE_HEIGHT / 4),
          (3 * constants.TILE_WIDTH / 4),
          (constants.TILE_HEIGHT / 2)
        );
      }

    }

    context.restore();

  }

  static _get_direction(source, target) {
    
    const dx = target.x - source.x;
    if(dx > 0) return DIRECTIONS.RIGHT;
    else if(dx < 0) return DIRECTIONS.LEFT;

    const dy = target.y - source.y;
    if(dy > 0) return DIRECTIONS.DOWN;
    else if(dy < 0) return DIRECTIONS.UP;

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

  static get_tile_cost(tile) {
    return TILE_COSTS[tile];
  }

  static calculate_movement_tiles(ecs, map, unit) {
    return MapSystem.breadth_first_search(map, unit.tile_x, unit.tile_y, 0, unit.speed, (tile, x, y, current_cost) => {
      const unit_id = MapSystem.map_unit(map, x, y);
      if(unit_id && ecs.get_component(unit_id, 'unit').player !== unit.player) {
        return Infinity;
      } else {
        return MapSystem.get_tile_cost(tile);
      }
    });
  }

  static calculate_threat_tiles(ecs, map, unit) {

    const game_state_id = ecs.get_entity_with_component('game_state');
    const game_state = ecs.get_component(game_state_id, 'game_state');

    const current_player_id = game_state.player_ids[game_state.current_player_index];

    const max_distance = unit.speed + 1;
    return MapSystem.breadth_first_search(map, unit.tile_x, unit.tile_y, 0, unit.speed + 1, (tile, x, y, current_cost) => {
      const cost = MapSystem.get_tile_cost(tile);
      const unit_id = MapSystem.map_unit(map, x, y);
      if((current_cost + cost) > unit.speed) {
        return (max_distance - current_cost) || Infinity;
      } else if(unit_id && ecs.get_component(unit_id, 'unit').player !== current_player_id) {
        return (max_distance - current_cost);
      } else {
        return cost;
      }
    });
  }

  static calculate_target_tiles(ecs, map, unit) {
    return MapSystem.breadth_first_search(map, unit.tile_x, unit.tile_y, 1, 1, (tile, x, y, current_cost) => {
      return 1;
    });
  }

  static breadth_first_search(map, x, y, min_distance, max_distance, tile_cost_fn) {

    const min_x = 0, max_x = MapSystem.map_width(map) - 1;
    const min_y = 0, max_y = MapSystem.map_height(map) - 1;

    const visited = {};
    const unvisited = [{ x, y, cost: 0, path: [{ x, y, cost: 0 }] }];

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
        
        cost += tile_cost_fn(tile, x, y, cost);

        if(cost > max_distance) continue;

        unvisited.push({ 
          x, 
          y, 
          cost,
          path: [].concat(node.path || [], [{ x, y, cost }])
        });

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