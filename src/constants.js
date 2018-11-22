let constants = {
	SCREEN_WIDTH: 768,
	SCREEN_HEIGHT: 512,
	TILE_WIDTH: 64,
	TILE_HEIGHT: 64,
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
		mountains: 3
	},
	GAME_STATES: {
		idle: 'idle',
		unit_selected: 'unit_selected',
		menu_open: 'menu_open',
		menu_selected: 'menu_selected',
		select_target: 'select_target',
		show_threat: 'show_threat',
		start_turn: 'start_turn',
		end_turn: 'end_turn'
	}
};

export default constants;