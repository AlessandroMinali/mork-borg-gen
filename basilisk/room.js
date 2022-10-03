var lair_entered = false;
var guardian = true;
class Room {
  constructor(x, y, seed) {
    this.x = x;
    this.y = y;
    this.seed = seed + x + y;
    this.traps = [];
    this.traps_disabled = [];
    this.monsters = [];
    this.monsters_slain = [];
    this.bodies = [];
    this.searched = false;
    this.lair = false;
    this.rand = r_gen(this.seed + x + y);
    this.visited = false;
    this.items = [];
  }
  roll(max) {
    return Math.floor(this.rand() * max) + 1;
  }
  choice(array) {
    return array[Math.floor(this.rand() * array.length)];
  }
  draw() {
    var font_size = 12;
    ctx.fillStyle = "white";
    ctx.fillRect(size*this.x, size*this.y, size, size);
    ctx.fillStyle = (this.darkness ? 'black' : "grey");
    if (this.lair) { ctx.fillStyle = 'rgb(0, 0, 0, 0.8)'; }
    ctx.fillRect(size*this.x+border, size*this.y+border, size - border, size - border);
    if (this.cave_in) {
      ctx.fillStyle = '#aaa';
      for(var i = 0; i < 10; i++) {
        ctx.fillRect(size*this.x+border+d(size - border*2), size*this.y+border+d(size - border*2), border, border)
      }
    }
    if (this.hellvent || this.skipping || this.spire || this.temple) {
      ctx.fillStyle = (this.spire || this.temple ? 'black' : 'white');
      ctx.fillRect(size*this.x+border*3, size*this.y+border*3, size/2, size/2);
      ctx.fillStyle = 'grey';
      if (this.temple) {
        ctx.fillRect(size*this.x+border*2, size*this.y+border*2, size/5, size/5);
        ctx.fillRect(size*this.x+border*7, size*this.y+border*2, size/5, size/5);
        ctx.fillRect(size*this.x+border*7, size*this.y+border*7, size/5, size/5);
        ctx.fillRect(size*this.x+border*2, size*this.y+border*7, size/5, size/5);
        ctx.fillRect(size*this.x+border*4.5, size*this.y+border*4.5, size/5, size/5);
      }
      if (this.skipping) {
        ctx.fillRect(size*this.x+border*4.5, size*this.y+border*4.5, size/5, size/5);
      }
    }
    if (this.x == current_player?.x && this.y == current_player?.y) {
      var shift_y = 0, shift_x = 0, shift = 20;
      if (this.chasm || this.hellvent || this.temple || this.spire || this.skipping) {
        if (current_player.last_entrance == 0) { shift_y = -shift; }
        if (current_player.last_entrance == 1) { shift_x = shift; }
        if (current_player.last_entrance == 2) { shift_y = shift; }
        if (current_player.last_entrance == 3) { shift_x = -shift; }
      }
      ctx.fillStyle = ['red', 'green', 'blue', 'yellow', 'purple'][players.indexOf(current_player)];
      ctx.fillRect(this.x*size + size/2 - 1 + shift_x, this.y*size + size/2 - 1 + shift_y, 10, 10);
    }
    ctx.font = font_size + "px Arial";
    ctx.textAlign = 'center';
    ctx.fillStyle = "white";
    if (this.searched) { ctx.fillText("X", this.x*size+border+10, this.y*size+border+font_size); }
    if (this.traps.length > 0) { ctx.fillText("T", this.x*size+border+10, this.y*size+border+font_size*2); }
    if (this.monsters.length > 0) { ctx.fillText("M", this.x*size+border+10, this.y*size+border+font_size*3); }
    if (this.items.length > 0) { ctx.fillText("I", this.x*size+border+10, this.y*size+border+font_size*4); }
    if (this.shop || this.soul) { ctx.fillText("$", this.x*size+border+10, this.y*size+border+font_size*5); }
    if (this.vapours) { ctx.fillText("V", this.x*size+border+10, this.y*size+border+font_size*5); }
    if (this.waterfall) { ctx.fillText("W", this.x*size+border+10, this.y*size+border+font_size*5); }
    ctx.fillStyle = "#aaa";
    if (this.traps_disabled.length > 0) { ctx.fillText("T", this.x*size+border+10, this.y*size+border+font_size*2); }
    if (this.monsters.length == 0 && this.monsters_slain.length > 0) { ctx.fillText("M", this.x*size+border+10, this.y*size+border+font_size*3); }

    var stroke = 20;
    ctx.lineWidth = stroke;
    if (this.exits[0]) {
      ctx.strokeStyle = 'black';
      if (this.secret_exit == 0) { ctx.strokeStyle = '#aaa'; }
      ctx.beginPath();
      ctx.moveTo(this.x*size + size/2 + border/2, this.y*size);
      ctx.lineTo(this.x*size + size/2 + border/2, this.y*size + border);
      ctx.stroke();
    }
    if (this.exits[1]) {
      ctx.strokeStyle = 'black';
      if (this.secret_exit == 1) { ctx.strokeStyle = '#aaa'; }
      ctx.beginPath();
      ctx.moveTo(this.x*size + size,          this.y*size + size/2 + border/2);
      ctx.lineTo(this.x*size + size + border, this.y*size + size/2 + border/2);
      ctx.stroke();
    }
    if (this.exits[2]) {
      ctx.strokeStyle = 'black';
      if (this.secret_exit == 2) { ctx.strokeStyle = '#aaa'; }
      ctx.beginPath();
      ctx.moveTo(this.x*size + size/2 + border/2, this.y*size + size);
      ctx.lineTo(this.x*size + size/2 + border/2, this.y*size + size + border);
      ctx.stroke();
    }
    if (this.exits[3]) {
      ctx.strokeStyle = 'black';
      if (this.secret_exit == 3) { ctx.strokeStyle = '#aaa'; }
      ctx.beginPath();
      ctx.moveTo(this.x*size,          this.y*size + size/2 + border/2);
      ctx.lineTo(this.x*size + border, this.y*size + size/2 + border/2);
      ctx.stroke();
    }
    if (this.chasm) {
      ctx.lineWidth = 5;
      ctx.strokeStyle = 'white';
      ctx.beginPath();
      if (this.chasm_dir) {
        ctx.moveTo(this.x*size, this.y*size);
        ctx.lineTo(this.x*size + size, this.y*size + size);
      } else {
        ctx.moveTo(this.x*size + size + border, this.y*size);
        ctx.lineTo(this.x*size, this.y*size + size + border);
      }
      ctx.stroke();
    }
    refresh_player_stats();
  }
  enter() {
    if (!this.visited) { this.generate(); }
    if (this.secret) { log("There is still a secret door to be used here, walk through a wall to reveal it."); }
    this.special?.activate();
    //special room
    if (this.waterfall) {
      log("There is a gentle waterfall flowing through the cracks of this cavern.");
      if (current_player.hp < current_player.max_hp) { log("You regain 1HP."); }
      current_player.hp = Math.min((current_player.hp += 1), current_player.max_hp);
      if (current_player.blind) {
        current_player.blind = false;
        log("You splash your face with the trickling water and alas your blindness is cured!");
      }
    }
    if (this.vapours) {
      log("Foul toxins fill this cavern. Remnants of the basilisk passing through.");
      if (current_player.gas_mask) {
        log('You quickly put on your gas mask.');
      } else {
        log('Inhaling the vapours, you feel weak.');
        current_player.hit(1, 'poison', 'Basilisk Vapours');
      }
    }
    this.merchant();
    this.sorcerer();
    //bodies
    this.bodies.forEach(el => log("The body of " + el.name + " lies here."));
    //monsters
    for(var i = 0; i < this.monsters.length; i++) {
      this.monsters[i].encounter();
      if (!this.visited) {
        log("You've discovered a " + this.monsters[i].name + " lurking about.");
      } else {
        log("There is still a " + this.monsters[i].name + " here.");
      }
    }
    //monsters slain
    for(var i = 0; i < this.monsters_slain.length; i++) {
      log("There is a slain " + this.monsters_slain[i].name + " here.");
    }
    //treasure
    for(var i = 0; i < this.items.length; i++) {
      log("There's a " + this.items[i].name + " in this room.");
    }
    //traps
    this.traps.forEach(el => this.run_trap(el));

    current_target = _room()?.monsters[0]; // needed due to teleport
    this.visited = true;
    this.draw();
  }
  generate() {
    if (rooms[2][8] == rooms[this.y][this.x] || rooms[3][8] == rooms[this.y][this.x]) {
      if (!lair_entered) { this.monsters.push(arch_cultist(seed)); lair_entered = true; }
    } else {
      // treasure pool
      var i_pile = this.two_unique(treasure_table);
      this.items_pile = [i_pile[0](this.seed), i_pile[1](this.seed)];
      // trap pool
      var t_pile = this.two_unique(traps_table);
      this.traps_pile = [new Trap(...t_pile[0], this.seed), new Trap(...t_pile[1], this.seed)];
      // monster_pool
      var w_pile = this.two_unique(weak_monster);
      this.weak_monsters_pile = [w_pile[0](this.seed), w_pile[1](this.seed)];
      var t_pile = this.two_unique(tough_monster);
      this.tough_monsters_pile = [t_pile[0](this.seed), t_pile[1](this.seed)];
      // power_pool
      this.powers_pile = this.choice(scrolls)(this.seed);
      // search_pool
      this.search_pile = this.choice(secret);

      // fill room
      this.encounter = this.choice([
        function() {},
        function() { this.reveal('traps'); },
        function() { this.reveal('traps'); },
        function() { this.reveal('weak_monsters'); },
        function() { this.reveal('weak_monsters'); },
        function() { this.reveal('tough_monsters'); this.reveal('items'); },
        function() { this.choice(encounters)(); },
        function() { this.choice(encounters)(); },
        function() { this.special = this.choice(special_rooms)(seed); },
        function() { this.special = this.choice(special_rooms)(seed); }
      ]);
    }
    // draw exits
    var tele = current_player.teleported.pop();
    this.exits = rotate(this.choice(exits_table), -(tele || entering_from));
    if (tele == undefined || this.secret_exit != undefined) { this.exits[entering_from] = 1; }
    this.fix_exits();
    if (!this.lair) { this.encounter(); }
  }
  two_unique(array) {
    var x = this.choice(array);
    var y;
    do {
      y = this.choice(array);
    } while(x == y);

    return [x, y]
  }
  move_monsters(x, y, push) {
    x = clamp(x, 0, 9);
    // The top and bottom sides of the map also wrap!
    y %= 7;
    if (y < 0) { y += 7; }
    this.monsters.forEach(m => {
      m.x = x;
      m.y = y;
      rooms[y][x].monsters.push(m);
    });
    this.monsters = [];
    if (rooms[y][x].visited) { rooms[y][x].draw(); }
    this.draw();
  }
  target_monster(index) {
    current_target = this.monsters[index];
    refresh_player_stats();
  }
  remove_treasure(index) {
    var treasue = this.items_pile[index];
    this.items_pile.splice(index, 1);
    return treasue;
  }
  reveal(type) {
    var obj = this[type + '_pile'].pop();
    this[type.replace(/(weak|tough)_/, '')].push(obj);
    return obj;
  }
  pick_up(index) {
    if (current_player.pick_up(this.items[index])) {
      this.items.splice(index, 1);
      this.draw();
      refresh_player_stats();
    }
  }
  merchant() {
    if (this.shop) {
      log("You see a bent and hooded figure in one corner of the cave.");
      if (this.items_pile.length > 0 && !current_player.pariah) {
        log("'Would you like to trade for something nice?', the merchant croaks.");
      } else {
        log("The merchant eyes you suspiciously across the room but does not say a word.");
      }
    }
  }
  sorcerer() {
    if (this.soul) {
      log("You see an ancient wizard in tattered clothes leaning against the cavern wall.");
      if (!current_player.pariah) { log("He laughs weakly and offers a trade."); }
    }
  }
  add_item(item, msg=true) {
    if (msg) { log('You leave ' + item.name + ' on the floor.'); }
    this.items.push(item);
    this.draw();
  }
  search() {
    if (this.check_monsters() || this.lair) { return; }
    if (this.searched) { return log("This room has already been searched"); }
    log("You spend 10 minutes searching the room...");
    this.search_pile();
    this.searched = true;
    current_player.round();
    this.draw();
    this.suffocate();
  }
  run_trap(trap) {
    // To avoid traps test DR10 PRE.
    if (current_player.levitate || current_player.presence(current_player.devious ? 6 : 10)) {
      if (current_player.levitate) { current_player.levitate = false; log("You float quietly across the room."); }
      if (!this.visited) {
        log("You've discovered a " + trap.name + " trap...careful now...");
      } else {
        log("There is a " + trap.name + " trap here.");
      }
    } else {
      log("You were caught by the " + trap.name + " trap!");
      trap.activate();
      log("At least now the " + trap.name + " trap is no more.");
      // Traps remain on the map until triggered.
      this.traps_disabled.push(this.traps.splice(this.traps.indexOf(trap), 1));
    }
  }
  check_monsters(evasion) {
    if (evasion || this.monsters.every(el => el.sleep)) { return false; }
    if (this.monsters.length > 0) {
      log("You can't do that with enemies around.");
      return true;
    } else {
      return false;
    }
  }
  fix_exits() {
    if (this.x == 0) { this.exits[3] = 0; } // reached left edge of map
    if (this.x == 9) { this.exits[1] = 0; } // reached right edge of map
    // If an exit leads into a previously discovered tile with no corresponding entrance, then it is a dead end.
    for(var i = 0; i < NEIGHBOURS.length; i++) {
      var neighbouring_door;
      var y = (this.y + NEIGHBOURS[i][1]) % 7;
      if (y < 0) { y += 7; }
      neighbouring_door = rooms[y]?.[(this.x + NEIGHBOURS[i][0]) % 9]?.exits?.[check_exits[i]];
      if (neighbouring_door != undefined) { this.exits[i] = neighbouring_door }
    }
  }
  suffocate() {
    if (this.exits.every(el => el == 0) && this.searched) {
      log("The exit disappears behind you, and you are trapped.");
      log("Some minutes pass as you suffocate.");
      current_player.kill('suffocation');
      this.draw();
    }
  }
  approach() {
    if (this.check_monsters() || !this.temple || this.temple_done) { return; }
    this.choice(temple_table)();
    this.temple_done = true;
    refresh_player_stats();
  }
}
function draw_map() {
  for(var y = 0; y < 7; y++) {
    var temp = [];
    for(var x = 0; x < 10; x++) {
      temp.push(new Room(x, y, _r().toString().slice(2,)));
    }
    rooms.push(temp);
  }
  rooms[2][8].lair = true;
  rooms[3][8].lair = true;
  ctx.fillStyle = "black";
  ctx.fillRect(size*8+border, size*2+border, size - border, size*2 - border);
  ctx.font = "40px Luminari";
  ctx.fillStyle = "white";
  ctx.fillText("L", size*8+border*2, size*2+border*8);
  ctx.fillText("I", size*8+border*2, size*2+border*16);
  ctx.fillText("A", size*8+border*5, size*2+border*10);
  ctx.fillText("R", size*8+border*5, size*2+border*18);
}