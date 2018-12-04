import querystring from 'query-string';

import Game from './game';

const canvas = document.getElementById('canvas');
const settings = {};

const qs = querystring.parse(window.location.search);
if(qs.map) settings.map = qs.map;

new Game(canvas, settings);
