const constants = {
	SCREEN_TILE_WIDTH: 15,
	SCREEN_TILE_HEIGHT: 10,
	TILE_WIDTH: 64,
	TILE_HEIGHT: 64,
	SPRITE_WIDTH: 64,
	SPRITE_HEIGHT: 64,
	KEYS: {
		START: 13,
		SELECT: 16,
		LEFT: 37,
		UP: 38,
		RIGHT: 39,
		DOWN: 40,
		A: 88,
		B: 90,
		L: 65,
		R: 83
	},
	TILE_TYPES: {
		water: 0,
		grass: 1,
		forest: 2,
		mountains: 3,
		road: 4,
		river: 5,
		city: 6,
		hq: 7
	},
	GAME_STATES: {
		end_turn: 'end_turn',
		idle: 'idle',
		menu_open: 'menu_open',
		menu_selected: 'menu_selected',
		select_target: 'select_target',
		show_threat: 'show_threat',
		start_turn: 'start_turn',
		unit_selected: 'unit_selected',
		unit_moved: 'unit_moved',
		unit_moving: 'unit_moving'
	}
};

Object.assign(constants, {
	SCREEN_WIDTH: constants.SCREEN_TILE_WIDTH * constants.TILE_WIDTH,
	SCREEN_HEIGHT: constants.SCREEN_TILE_HEIGHT * constants.TILE_HEIGHT
});

export default constants;