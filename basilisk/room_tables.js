function _room() { return current_player?.current_room(); }
var exits_table = [
  [0, 0, 0, 0],
  [0, 1, 0, 0],
  [0, 0, 1, 0],
  [0, 0, 0, 1],
  [0, 1, 1, 0],
  [0, 1, 0, 1],
  [0, 0, 1, 1],
  [0, 1, 1, 1],
]
var check_exits = [DOWN, LEFT, UP, RIGHT];
var secret = [
  function() {
    var obj = _room().reveal('weak_monsters');
    log("You hear some shuffling behind some crates, a " + obj.name + " appears.");
    current_target || (current_target = _room().monsters[0]);
    obj.encounter();
  },
  function() {
    var obj = _room().reveal('traps');
    _room().run_trap(obj);
    current_target || (current_target = _room().monsters[0]);
  },
  function() { log("Finding nothing..."); },
  function() { _room().secret = true; log("Secret door! You may move into a wall to reveal a new exit."); }
]
var temple_table = [
  function() {
    log("You touch the altar and are immediately struck by lightning.");
    current_player.hit(_room().roll(8), 'electric', 'altar lightning');
  },
  function() {
    log("You touch the altar and are brought to your knees. You suffer a new affliction.");
    var aff = _room().choice(afflictions.filter(el => !current_player[el]));
    current_player[aff] = 1;
    if (aff == 'nudist' && current_player.donned_armor) {
      current_player.donned_armor = undefined;
      log("You throw off you armor in sudden disgust.");
    } else if (aff == 'cruel' && current_player.pets.length > 0) {
      current_player.pets.forEach(el => _room().items.push(el));
      current_player.pets = [];
      log("Your pets suddenly abadon you.");
    }
    refresh_player_stats();
  },
  function() {
    log("You touch the altar... and nothing happens");
  },
  function() {
    current_player.hp = current_player.max_hp;
    refresh_player_stats();
    log("You touch the altar and are bathe in holy light. You are now fully healed.");
  },
  function() {
    current_player.hp = current_player.max_hp;
    refresh_player_stats();
    log("You touch the altar and are bathe in holy light. You are now fully healed.");
  },
  function() {
    log("You touch the altar and feel power course through you. You care granted the use of a Power.");
    current_player.pick_up(_room().choice(scrolls)(_room().seed));
    refresh_player_stats();
  }
]
var encounters = [
  function() { _room().reveal('items'); },
  function() { _room().reveal('items'); },
  function() { _room().shop = true; },
  function() {
    log("A magical aberration occurs...");
    if (current_player.presence(12)) {
      log("You manage to avoid the sickly magiks.");
    } else {
      log("The tendrils of arcane magik hits you, casting " + _room().powers_pile.name);
      _room().powers_pile.activate(true);
    }
  },
  function() { _room().waterfall = true; },
  function() {
    log("While crossing the room you gently brush up against a casket and hearing a ticking sound from within.");
    var trap = _room().reveal('traps');
    if (current_player.agility(12)) {
      log("You deactivate the mechanism and it reveals a " + trap.name + " trap which you manage to avoid as it activates!");
      log("You discover treasure inside as well!");
      _room().reveal('items');
      _room().reveal('items');
    } else {
      log("You attempt to deactivate the mechanism but it crumbles revealing a " + trap.name + " trap.");
      trap.activate();
    }
    _room().traps_disabled.push(_room().traps.splice(_room().traps.indexOf(trap), 1));
  },
  function() { _room().soul = true; },
  function() { _room().vapours = true; }
]

class Special {
  constructor(name, activate, seed) {
    this.name = name;
    this.activate = activate;
    this.rand = r_gen(seed + name);
  }
  roll(num) {
    return Math.floor(this.rand() * num) + 1;
  }
}
var special_rooms = [
  function() { return new Special('Rotating Room',
    function() {
      log("The room starts to shake and rotates as you enter");
      var room = _room();
      room.exits = [0, 0, 0, 0];
      room.exits[entering_from] = 1;
      room.exits[room.secret_exit] = 1;
      room.exits = rotate(room.exits, -1);

      if (room.x == 0) { room.exits[3] = 0; } // reached left edge of map
      if (room.x == 9) { room.exits[1] = 0; } // reached right edge of map
      // If an exit leads into a previously discovered tile with no corresponding entrance, then it is a dead end.
      for(var i = 0; i < NEIGHBOURS.length; i++) {
        var y = (room.y + NEIGHBOURS[i][1]) % 7;
        if (y < 0) { y += 7; }
        var neighbour = rooms[y]?.[(room.x + NEIGHBOURS[i][0]) % 9];
        if (!neighbour?.visited) { continue; }
        if (room.exits[i] != neighbour.exits[check_exits[i]]) {
          neighbour.exits[check_exits[i]] = 0;
          room.exits[i] = 0;
        }
        if (!room.exits[i] && neighbour.secret_exit == check_exits[i]) { neighbour.secret_exit = undefined; }
        neighbour.draw();
      }
      room.suffocate();
    }, seed)},
  function() { return new Special('Hellvent',
    function() {
      _room().hellvent = true;
      log("The room has Hellvent, you try to avoid falling in...");
      if (current_player.hook) {
        log("You swing across with your grappling hook.");
      } else if (current_player.levitate) {
        log("You float across and land safely on the other side");
        this.levitate = false;
      } else if (current_player.agility(10)) {
        log("You manage to slip around the edge of the pit.");
      } else {
        log("You fall in.");
        current_player.kill('Hellvent');
      }
    }, seed)},
  function() { return new Special('Chasm',
    function() {
      log("A chasm stretches across the room.");
      var room = _room();
      if (!room.chasm) {
        room.chasm_dir = _room().roll(2) - 1;
        room.exits = [1, 1, 1, 1];
        room.fix_exits();
      }
      room.chasm = true;
    }, seed)},
  function() { return new Special('Impenetrable Darkness',
    function() {
      _room().darkness = true;
      log("The room is filled with a thick darkness.");
      if (current_player.boggle_eyed) {
        log("Thankfully your 'special' eyes allow you to see clearly.");
      } else {
        log("You can barely see anything.");
      }
      _room().exits = [1, 1, 1, 1];
      _room().fix_exits();
    }, seed)},
  function() { return new Special('Cave In',
    function() {
      _room().cave_in = true;
      log("The roof in this cavern is crumbling.");
      if (current_player.agility(8)) {
        log("You manage to avoid any falling debris");
      } else {
        log("A large piece of the roof slams into you from above.");
        current_player.hit(this.roll(4), 'blunt', 'crumbling roof');
      }
    }, seed)},
  function() { return new Special('Stepping Stones',
    function() {
      log("There is a large pit with rocks that you can hop across");
      if (current_player.agility(10)) {
        log("You make it across safely.");
      } else if (current_player.levitate) {
        log("You float across and land safely on the other side");
        current_player.levitate = false;
      } else {
        log("You slip while crossing...");
        if (!current_player.destroy_item()) { current_player.kill('Skipping Stone'); }
      }
      var room = _room();
      room.skipping = true;
      room.exits = [0, 0, 0, 0];
      room.exits[entering_from] = 1;
      room.exits[room.secret_exit] = 1;
      room.exits[check_exits[entering_from]] = 1;
      room.fix_exits();

      var exits = get_all_indexes(room.exits, 1);
      var doors = [(entering_from + 1) % 4, (entering_from - 1) % 4, check_exits[entering_from]]
      var i = 0;
      while(exits >= 3) {
        var test = room.exits[doors[i]];
        if (test) {
          room.exits[doors[i]] = 0;
          exits--;
        }
        i++;
      }
      if (room.x == 0) { room.exits[3] = 0; } // reached left edge of map
      if (room.x == 9) { room.exits[1] = 0; } // reached right edge of map
      // If an exit leads into a previously discovered tile with no corresponding entrance, then it is a dead end.
      for(var i = 0; i < NEIGHBOURS.length; i++) {
        var y = (room.y + NEIGHBOURS[i][1]) % 7;
        if (y < 0) { y += 7; }
        var neighbour = rooms[y]?.[(room.x + NEIGHBOURS[i][0]) % 9];
        if (!neighbour?.visited) { continue; }
        if (room.exits[i] != neighbour.exits[check_exits[i]]) { neighbour.exits[check_exits[i]] = 0; }
        neighbour.draw();
      }
    }, seed)},
  function() { return new Special('Necrospire',
    function() {
      log("There is an ominous pulsating Necrospire in the center of the cavern.");
      if (!_room().spire) {
        var obj = _room().reveal('weak_monsters');
        obj.encounter();
        current_target || (current_target = _room().monsters[0]);
      }
      _room().spire = true;
    }, seed)},
  function() { return new Special('Arcane Temple',
    function() {
      _room().temple = true;
      if (_room().temple_done) {
        log('There is a decrepit temple altar in the middle of the cavern.');
      } else {
        log('There is a decrepit temple altar in the middle of the cavern. You may choose to approach it.');
      }
  }, seed)}
]