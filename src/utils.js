export default {

  is_key_down(prev_state, state, key) {
    return !!(!prev_state[key] && state[key]);
  },

  is_key_up(prev_state, state, key) {
    return !!(prev_state[key] && !state[key]);
  },

  capitalize(s) {
    return s[0].toUpperCase() + s.substring(1);
  }

};