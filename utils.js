function hash() {
  return window.location.hash.slice(1,);
}
function search() {
  if (window.location.hash) {
    return window.location.hash.slice(1,);
  } else {
    return window.location.search.slice(1,);
  }
}

function save_edits(tag) {
  var editElem = document.getElementsByClassName("edit");
  var edits = [];
  for(var i = 0; i < editElem.length; i++) {
    edits.push(editElem[i].innerHTML);
  }
  localStorage.setItem(tag, edits.join('&666&'));
  show_status("SAVED");
}
function load_edits(tag) {
  const edits = localStorage.getItem(tag).split('&666&');
  var editElem = document.getElementsByClassName("edit");
  console.log(edits, edits.length, editElem.length);
  for(var i = 0; i < edits.length; i++) {
    editElem[i].innerHTML = edits[i];
  }
  show_status("RESTORED");
}
function delete_edits(tag) {
  localStorage.removeItem(tag);
  window.location.reload();
}
function check_edits(tag) {
  return localStorage.getItem(tag) != null;
}
function enable_edits() {
  var editElem = document.getElementsByClassName("edit");
  for(var i = 0; i < editElem.length; i++) {
    editElem[i].contentEditable = "true";
  }
}
function disable_edits() {
  var editElem = document.getElementsByClassName("edit");
  for(var i = 0; i < editElem.length; i++) {
    editElem[i].contentEditable = "false";
  }
}

function show_status(msg) {
  var el = document.getElementById("status");
  el.innerHTML = msg;
  el.style.display = 'inline';
  hide_status();
}
var timers = [];
function hide_status() {
  for(var i = 0; i < timers.length; i++) {
    clearTimeout(timers[i]);
  }
  var el = document.getElementById("status");
  el.style.opacity = 1;
  for(var i = 0; i < 50; i++) {
    timers.push(setTimeout(function() { el.style.opacity -= 0.02; } , i * 60));
  }
}

function d(max) {
  return Math.floor(Math.random() * max) + 1;
}
function random_item_from(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function setCookie(cname, cvalue) {
  const d = new Date();
  d.setTime(d.getTime() + (5*365*24*60*60*1000));
  let expires = "expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for(let i = 0; i <ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

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
function seed() {
  var _s = cyrb128(_seed);
  _r = sfc32(_s[0], _s[1], _s[2], _s[3]);
}
function reseed() {
  _seed = Math.random().toString().slice(2,);
  seed();
}
function fixed_rolls_only() {
  window.d = function() { alert() }
  window.random_item_from = function() { alert() }
}
function fd(max) {
  return Math.floor(_r() * max) + 1;
}
function frandom_item_from(array) {
  return array[Math.floor(_r() * array.length)];
}
