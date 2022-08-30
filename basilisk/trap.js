class Trap {
  constructor(name, activate, seed) {
    this.name = name;
    this.activate = activate;
    this.rand = r_gen(seed + name);
  }

  roll(num) {
    return Math.floor(this.rand() * num) + 1;
  }
}

var traps_table = [
  [
    "Teleport",
    function() {
      var x = current_player.x, y = current_player.y;
      log('It tries to teleport to another room nearby...');
      var dir = [1, -1][this.roll(2) - 1];
      var spaces = this.roll(4);
      if (this.roll(2) == 1) {
        x = current_player.x + dir * spaces;
        current_player.teleported.push(dir > 0 ? LEFT : RIGHT);
      } else {
        y = current_player.y + dir * spaces;
        current_player.teleported.push(dir > 0 ? DOWN : UP);
      }
      current_player.move(x, y);
    }
  ],
  [
    "Spiked pit",
    function() {
      current_player.hit(this.roll(4), 'piercing', this.name);
      if (!current_player.agility(6)) {
        log('Whoops, you fell in again.')
        current_player.hit(this.roll(4), 'piercing', this.name);
        log('Finally you make your way out of the pit.')
      } else {
        log('You manage to climb out without further issue.')
      }
    }
  ],
  [
    "Rolling boulder",
    function() { current_player.hit(this.roll(6), 'crushing', this.name); }
  ],
  [
    "Acid",
    function() {
      log('A bucket tips and covers you in bubbling acid...');
      current_player.hit(this.roll(4), 'acid', this.name);
      current_player.destroy_item();
    }
  ],
  [
    "Monster pit",
    function () {
      var room = current_player.current_room();
      var monster = room.reveal('tough_monsters');
      log("A " + monster.name + " climbs out of the pit.");
      monster.encounter();
      room.draw();
    }
  ],
  [
    "Devious Puzzle",
    function() {
      if (!current_player.presence(2+this.roll(12))) {
        log('You fiddle with the mechanism...');
        current_player.hit(this.roll(4), 'piercing', this.name);
      } else {
        log('You fiddle with the mechanism...');
        log('and manage to disarm it!');
      }
    }
  ],
  [
    "Neurotoxin",
    function() {
      if (current_player.gas_mask) {
        log('You quickly put on your gas mask.');
      } else {
        log('Gas fills the room and you feel weak.');
        current_player.decrease_ability();
      }
    }
  ],
  [
    "Blinding Flash",
    function() {
      log('AHHHHHHHHH, you are blinded!');
      current_player.flash();
    }
  ]
]