// ask for player and room to start
function refresh_player_stats() {
  document.getElementById('name').innerHTML = current_player.name;
  document.getElementById('strength').innerHTML = pos(current_player.str);
  document.getElementById('agility').innerHTML = pos(current_player.agi);
  document.getElementById('presence').innerHTML = pos(current_player.pre);
  document.getElementById('toughness').innerHTML = pos(current_player.tou);
  document.getElementById('max_hp').innerHTML = current_player.max_hp;
  document.getElementById('hp').innerHTML = current_player.hp;
  document.getElementById('points').innerHTML = current_player.points;
  document.querySelectorAll('.upgrade').forEach(el => el.style.display = (current_player.points >= 10) ? 'inline' : 'none');

  document.getElementById('boons').innerHTML =
    boons.filter(el => current_player[el]).map(el => el.replace(/_/, '-').toUpperCase()).join('<br>');
  document.getElementById('afflictions').innerHTML =
    afflictions.filter(el => current_player[el]).map(el => el.toUpperCase()).join('<br>');
  if (current_player.blind) { document.getElementById('afflictions').innerHTML += '<br><b>BLIND</b>'; }
  document.getElementById('inventory').innerHTML = "<ol>" +
    current_player.items.map((el, index) => {
      return "<li>" + el.name +
             "<button style='display: none' onclick='(function() { current_player.trade(" + index + ") })();'>Trade</button>" +
             ((el.name == 'Gas Mask' || el.name == 'Grappling Hook') ? '' : "<button onclick='(function() { current_player.use(" + index + ") })();'>Use</button>") +
             "<button onclick='(function() { current_player.discard(" + index + ") })()'>Discard</button>" +
             "</li>";
    }).join('') +
    current_player.armor.filter(el => current_player.donned_armor != el).map((el, index) => {
      return "<li>" + el.name +
             "<button style='display: none' onclick='(function() { current_player.trade_armor(" + index + ") })();'>Trade</button>" +
             "<button onclick='(function() { current_player.use_armor(" + index + ") })()'>Use</button>" +
             "<button onclick='(function() { current_player.discard_armor(" + index + ") })()'>Discard</button>" +
             "</li>";
    }).join('') + "</ol>" +
    "<ul>" +
    (current_player.donned_armor ? (
      "<li>" + current_player.donned_armor?.name +
      "<button style='display: none' onclick='(function() { current_player.trade_armor(" + current_player.armor.indexOf(current_player.donned_armor) + ") })();'>Trade</button>" +
      "<button onclick='(function() { current_player.discard_armor(" + current_player.armor.indexOf(current_player.donned_armor) + ") })()'>Discard</button>" +
      "</li>") : '') +
    current_player.pets.map((el, index) => {
      return "<li>" + el.name +
             "<button style='display: none' onclick='(function() { current_player.trade_pet(" + index + ") })();'>Trade</button>" +
             "<button onclick='(function() { current_player.discard_pet(" + index + ") })()'>Discard</button>" +
             "</li>";
    }).join('') +
    "</ul>"
  var room_monsters = document.getElementById('room_monsters')
  room_monsters.innerHTML =
    current_player.current_room().monsters.map((el, index) => {
      return "<li>" + el.name +
             ((current_target == el) ? '' : "<button onclick='(function() { current_player.current_room().target_monster(" + index + ") })()'>Target (t)</button>") +
             "</li>";
    }).join('');
  var room_traps = document.getElementById('room_traps')
  room_traps.innerHTML =
    current_player.current_room().traps.map((el, index) => {
      return "<li>" + el.name +
             // "<button onclick='(function() { current_player.current_room().target_trap(" + index + ") })()'>Target</button>" +
             "</li>";
    }).join('');
  var room_items = document.getElementById('room_items');
  room_items.innerHTML =
    current_player.current_room().items.map((el, index) => {
      return "<li>" + el.name +
             "<button onclick='(function() { current_player.current_room().pick_up(" + index + ") })()'>Grab</button>" +
             "</li>";
    }).join('');

  document.getElementById('r_temple').style.display =  ((_room().temple && !_room().temple_done) ? 'inline' : 'none');
  document.getElementById('audience').style.display =  ((_room().lair && !guardian) ? 'inline' : 'none');
  (room_monsters.innerHTML == '') ? (r_monsters_wrapper.style.display = 'none') : (r_monsters_wrapper.style.display = 'inline');
  (room_traps.innerHTML == '') ? (r_traps_wrapper.style.display = 'none') : (r_traps_wrapper.style.display = 'inline');
  (room_items.innerHTML == '') ? (r_items_wrapper.style.display = 'none') : (r_items_wrapper.style.display = 'inline');

  if (current_player.current_room().shop && !current_player.pariah) {
    document.getElementById('merchant').style.display = 'inline';
    document.getElementById('merchant_items').innerHTML =
      current_player.current_room().items_pile.map((el, index) => {
        return "<li>" + el.name +
               "<button onclick='(function(e) { trade(" + index + ") })()'>Trade</button>" +
               "</li>";
      }).join('');
  } else {
    document.getElementById('merchant').style.display = 'none';
  }
  if (current_player.current_room().soul && !current_player.pariah) {
    document.getElementById('sorcerer').style.display = 'inline';
    document.getElementById('sorcerer_items').innerHTML =
        "<li>1/4 of HP for Scroll" +
        "<button onclick='(function(e) { current_player.trade_soul() })()'>Trade</button>" +
        "</li>";
  } else {
    document.getElementById('sorcerer').style.display = 'none';
  }
  document.getElementById('search').style.display = ((_room().searched || _room().lair) ? 'none' : 'inline');
}
function trade(index) {
  if (_room().check_monsters()) { return; }
  window.removeEventListener('keyup', key_up);
  document.querySelectorAll('#inventory > ol > li > button, #inventory > ul > li > button').forEach(el => {
    el.style.display = (el.style.display == 'none' ? 'inline' : 'none');
  })
  current_player.current_room().trade = current_player.current_room().remove_treasure(index);
  document.querySelectorAll('#merchant_items > li > button').forEach(el => el.style.visibility = 'hidden');
}
function complete_trade() {
  window.addEventListener('keyup', key_up);
  document.querySelectorAll('#inventory > ol > li > button, #inventory > ul > li > button').forEach(el => {
    el.style.display = (el.style.display != 'none' ? 'inline' : 'none');
  })
  document.querySelectorAll('#merchant_items > li > button').forEach(el => el.style.visibility = 'visible');
  if (_room().items_pile.length == 0) {
    log("'My job is done here', says the merchant and walks off into the catacombs.");
    _room().shop = false;
    _room().draw();
  }
}
function choose_char(show) {
  players.forEach((player, index) => {
    index++;
    document.getElementById('name_' + index).innerHTML = player.name;
    document.getElementById('max_hp_' + index).innerHTML = player.max_hp;
    document.getElementById('hp_' + index).innerHTML = player.hp;
    document.getElementById('strength_' + index).innerHTML = pos(player.str);
    document.getElementById('agility_' + index).innerHTML = pos(player.agi);
    document.getElementById('presence_' + index).innerHTML = pos(player.pre);
    document.getElementById('toughness_' + index).innerHTML = pos(player.tou);
    document.getElementById('boons_' + index).innerHTML =
      boons.filter(el => player[el]).map(el => el.replace(/_/, '-').toUpperCase()).join('<br>');
    document.getElementById('afflictions_' + index).innerHTML =
      afflictions.filter(el => player[el]).map(el => el.toUpperCase()).join('<br>');
    document.getElementById('inventory_' + index).innerHTML =
      player.starting_items.map(el => {
        return "<li>" + el.name + "</li>";
      }).join('')
    document.getElementById('killed_by_' + index).innerHTML = player.killed_by?.toUpperCase() || '';
  })
  document.getElementById('char_select').style.display = 'block';
  document.querySelectorAll('#char_select > div > button').forEach((el, index) =>{
    if (players[index]?.killed_by) { el.style.display = 'none'; }
  })
  if (!show) { document.getElementById('screen').style.display = 'none'; }
}
function choose_start() {
  try { rooms[0][0].draw(); } catch {}
  try { rooms[3][0].draw(); } catch {}
  try { rooms[6][0].draw(); } catch {}
  ctx.font = "40px Luminari";
  ctx.fillStyle = "red";
  ctx.fillText("1", size/2, size + border - size/3);
  ctx.fillText("2", size/2, size*4 + border - size/3);
  ctx.fillText("3", size/2, size*7 + border - size/3);
  document.getElementById('choose').style.display = 'block';
  document.getElementById('char_select').style.display = 'none';
  document.getElementById('screen').style.display = 'block';
  refresh_player_stats();
}
function start(s) {
  try { rooms[0][0].draw(); } catch {}
  try { rooms[3][0].draw(); } catch {}
  try { rooms[6][0].draw(); } catch {}
  document.getElementById('choose').style.display = 'none';
  current_player.start(s);
  refresh_player_stats();
}
function controls() {
  confirm(`CONTROLS
arrows keys: move character
1-9, 0: Use item from inventory (0 willl use item 10)
g: Take All
spacebar: Use Fists
x: Search room
t: toggle Target
l: Use Points
a: Approach altar / VERHU
~: suicide

*You can click any button if you don't want to use the keyboard shortcuts`);
}
function tips() {
  confirm(`- The dungeon is always the same.
  The only thing that changes is sometimes exits may be drawn differently between rooms depending on how you enter them.
  Try different routes but remember what each room holds.
  If you want a new dungeon layout, then click "New Dungeon"
- PRE is super useful in the final encounter
- if you are stuck you can kill yourself with by pressing "~"
- STR helps in melee combat
- PRE helps against traps or ranged combat(crossbow)
- AGI helps you avoid natural dangers
- TOU helps you prevent enemy status effects
- decent armor > crude armor but lowers AGI
- bomb > zweihander > flail, crossbow > sword, black poision > staff
- pets are great to have
- if you are having trouble with something specific try leveling up a BOON early on`);
}

output = true;
var players = [new Player(), new Player(), new Player(), new Player(), new Player()];
players.forEach(el => {
  el.starting_items.push(frandom_item_from(weapons_table)());
  el.starting_items.push(treasure_table[fd(10) - 1](_seed));
});
choose_char();
var current_player;
var current_target;
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
ctx.fillStyle = 'white';
ctx.fillRect(0, 0, canvas.width, canvas.height);
var rooms = [];
var size = 70;
var border = size / 10;
window.onload = (event) => {
  draw_map();
  window.addEventListener('keyup', key_up);
}
