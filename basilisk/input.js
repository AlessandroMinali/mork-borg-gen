document.onkeydown = function(evt) {
  evt = evt || window.event;
  var keyCode = evt.keyCode;
  if (keyCode >= 37 && keyCode <= 40) {
      return false;
  }
};
const UP    = 0;
const RIGHT = 1;
const DOWN  = 2;
const LEFT  = 3;
const DIRECTIONS = ['UP', 'RIGHT', 'DOWN', 'LEFT'];
const NEIGHBOURS = [
  [0, -1], // above neighbour
  [1, 0],  // right neighbour
  [0, 1],  // below neighbour
  [-1, 0]  // left neighbour
]
var entering_from = LEFT;
function key_up(e) {
  switch(e.key) {
    case('ArrowLeft'): {
      entering_from = RIGHT;
      current_player.left();
      break;
    }
    case('ArrowRight'): {
      entering_from = LEFT;
      current_player.right();
      break;
    }
    case('ArrowUp'): {
      entering_from = DOWN;
      current_player.up();
      break;
    }
    case('ArrowDown'): {
      entering_from = UP;
      current_player.down();
      break;
    }
    case('g'): {
      current_player.take_all();
      break;
    }
    case(' '): {
      current_player.fists();
      break;
    }
    case('x'): {
      current_player.current_room().search();
      break;
    }
    case('r'): {
      del('player_moves');
      break;
    }
    case('a'): {
      console.log('hello');
      if (!_room().lair) {
        _room().approach();
      } else {
        audience();
      }
      break;
    }
    case('~'): {
      current_player.kill('suicide');
      break;
    }
    case('t'): {
      var room = _room();
      room.target_monster((room.monsters.indexOf(current_target) + 1) % room.monsters.length);
      break;
    }
    case('l'): {
      if (current_player.points >= 10) {
        switch(prompt("Choose a level up:\n1. Increase MAX HP and HP\n2. Fully heal\n3. Increase STRENGTH\n4. Increase AGILITY\n5. Increase PRESENCE\n6. Increase TOUGHNESS\n7. Gain a BOON")) {
          case('1'): {
            l_max_hp();
            break;
          }
          case('2'): {
            l_hp();
            break;
          }
          case('3'): {
            l_attr('str');
            break;
          }
          case('4'): {
            l_attr('agi');
            break;
          }
          case('5'): {
            l_attr('pre');
            break;
          }
          case('6'): {
            l_attr('tou');
            break;
          }
          case('7'): {
            l_boon();
            break;
          }
          default: {
            log("Invalid selection.");
          }
        }
        refresh_player_stats();
      }
      break;
    }
  }
  if (!isNaN(parseInt(e.key))) {
    var num = parseInt(e.key);
    num = num == 0 ? 9 : num - 1;
    if (current_player) {
      if (current_player.x != undefined) {
        document.querySelectorAll('#inventory > ol > li')[num]?.querySelector('button:not([style*="display: none"])')?.click();
      } else {
        document.querySelectorAll('#choose > button')[num]?.click();
      }
    } else {
      if (document.querySelectorAll('#char_select > div > button')[num]?.style?.display == 'none') { return; }
      document.querySelectorAll('#char_select > div > button')[num]?.click();
    }
  }
}