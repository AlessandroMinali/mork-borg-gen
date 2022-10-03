var output = false;
function log(msg) {
  if (output) {
    var log_window = document.getElementById('log')
    log_window.innerHTML += msg.replace(/a\ A/, 'an A') + "<br>";
    log_window.scrollTop = log_window.scrollHeight;
    // console.warn(msg.replace(/\ [aeiouy]\ ([aeiouy])/i, " an $1"));
  }
}
const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
function rotate(array, count) {
  var arr = array.slice();
  count -= arr.length * Math.floor(count / arr.length);
  arr.push.apply(arr, arr.splice(0, count));
  return arr;
}
function get_all_indexes(arr, val) {
  var indexes = [], i = -1;
  while ((i = arr.indexOf(val, i+1)) != -1){
    indexes.push(i);
  }
  return indexes;
}
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
function pos(num) { return num >= 0 ? ('+' + num) : num; }

function save(tag, item) {
  localStorage.setItem(tag, item);
}
function check(tag) {
  return localStorage.getItem(tag);
}
function del(tag) {
  localStorage.removeItem(tag);
  window.location.reload();
}

function track(coords) {
  var prev_moves = check('player_moves') || '';
  save('player_moves', prev_moves += coords.join(''));
}
var replaying = false;
async function replay(moves) {
  if (!moves) { return; }
  replaying = true;
  moves = moves.split('');
  for(var i = 0; i < moves.length-1; i+=3) {
    if (!replaying) {
      save('player_moves', moves.slice(0,i-6).join(''));
      break;
    }
    await sleep(50);
    entering_from = parseInt(moves[i+2]);
    current_player.move(parseInt(moves[i]), parseInt(moves[i+1]));
  }
  replaying = false;
}
function cut_track() { replaying = false; }

function cyrb128(str) {
  let h1 = 1779033703, h2 = 3144134277,
      h3 = 1013904242, h4 = 2773480762;
  for (let i = 0, k; i < str.length; i++) {
    k = str.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
  return [(h1^h2^h3^h4)>>>0, (h2^h1)>>>0, (h3^h1)>>>0, (h4^h1)>>>0];
}
function sfc32(a, b, c, d) {
  return function() {
    a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0;
    var t = (a + b) | 0;
    a = b ^ b >>> 9;
    b = c + (c << 3) | 0;
    c = (c << 21 | c >>> 11);
    d = d + 1 | 0;
    t = t + d | 0;
    c = c + t | 0;
    return (t >>> 0) / 4294967296;
  }
}
var _seed;
var _r;
function seed(s) {
  _seed = s || Math.random().toString().slice(2,);
  var _s = cyrb128(_seed);
  _r = sfc32(_s[0], _s[1], _s[2], _s[3]);
}
function r_gen(str) {
  var _s = cyrb128(_seed + str);
  return sfc32(_s[0], _s[1], _s[2], _s[3]);
}
function fd(max) {
  return Math.floor(_r() * max) + 1;
}
function frandom_item_from(array) {
  return array[Math.floor(_r() * array.length)];
}
function d(max) {
  return Math.floor(Math.random() * max) + 1;
}
function random_item_from(array) {
  return array[Math.floor(Math.random() * array.length)];
}
