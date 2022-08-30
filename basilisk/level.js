document.getElementById('increase_max_hp').addEventListener('click', function() { l_max_hp(); });
document.getElementById('increase_hp').addEventListener('click', function() { l_hp(); });
['str', 'agi', 'pre', 'tou'].forEach(attr => {
  document.getElementById('increase_' + attr).addEventListener('click', function() { l_attr(attr); })
})
document.getElementById('increase_boon').addEventListener('click', function() { l_boon(); })

function l_max_hp() {
  if (_room().check_monsters() || current_player.points < 10) { return; }
  var roll = d(4);
  current_player.points -= 10;
  log('MAX HP and HP increased by ' + roll + '.');
  current_player.max_hp += roll;
  current_player.hp = Math.min(current_player.hp += roll, current_player.max_hp);
}
function l_hp() {
  if (_room().check_monsters() || current_player.points < 10) { return; }
  current_player.points -= 10;
  log('HP fully restored.');
  current_player.hp = current_player.max_hp;
}
function l_attr(attr) {
  if (_room().check_monsters() || current_player.points < 10) { return; }
    if (current_player[attr] < 1) {
      current_player.points -= 10;
    } else if (current_player[attr] < 2) {
      if (current_player.points < 20) { return log('You need 20Points to increase from +1 to +2'); }
      current_player.points -= 20;
    } else if ((current_player[attr] < 3)) {
      if (current_player.points < 30) { return log('You need 30Points to increase from +1 to +2'); }
      current_player.points -= 30;
    } else {
      return log('This stat is maxed out.');
    }
    current_player[attr] += 1;
}
function l_boon() {
  if (_room().check_monsters() || current_player.points < 10) { return; }
  if (boons.every(el => current_player[el])) { return log("You already have all possible boons."); }
  window.removeEventListener('keyup', key_up);
  switch(prompt("What boon would you like:\n1. Boggle-Eyed (Impenetrable darkness has no effect)\n2. Brutal (+1 modifier in melee combat)\n3. Coward (+1 to evade rolls)\n4. Devious (Reduce traps to DR6 PRE)")) {
    case('1'): {
      if (current_player[boons[0]]) { log('You already have this Boon, select another.'); break; }
      current_player[boons[0]] = true;
      current_player.points -= 10;
      break;
    }
    case('2'): {
      if (current_player[boons[1]]) { log('You already have this Boon, select another.'); break; }
      current_player[boons[1]] = true;
      current_player.points -= 10;
      break;
    }
    case('3'): {
      if (current_player[boons[2]]) { log('You already have this Boon, select another.'); break; }
      current_player[boons[2]] = true;
      current_player.points -= 10;
      break;
    }
    case('4'): {
      if (current_player[boons[3]]) { log('You already have this Boon, select another.'); break; }
      current_player[boons[3]] = true;
      current_player.points -= 10;
      break;
    }
    default: {
      log("Invalid selection.");
      break;
    }
  }
  window.addEventListener('keyup', key_up);
}

document.querySelectorAll('.upgrade').forEach(el => el.addEventListener('click', refresh_player_stats));