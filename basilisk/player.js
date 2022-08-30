var abilities = [,-2, -1, -1, 0, 0, 1, 1, 2];
var boons = ['boggle_eyed', 'brutal', 'cowardly', 'devious'];
var afflictions = ['pariah', 'illiterate', 'nudist', 'cruel'];
class Player {
  constructor() {
    this.name = frandom_item_from(names);
    // Roll d8 for each stat
    this.agi = abilities[fd(8)];
    this.pre = abilities[fd(8)];
    this.str = abilities[fd(8)];
    this.tou = abilities[fd(8)];
    // Hit Points are 15+TOU
    this.max_hp = 15 + this.tou;
    // Boon (d4)
    this[boons[fd(4) -1]] = true;
    // Affliction (d4)
    this[afflictions[fd(4) -1]] = true;
    this.hp = this.max_hp;
    this.points = 0;
    this.teleported = [];
    this.items = [];
    this.pets = [];
    this.armor = [];
    this.donned_armor;
    this.starting_items = [];
  }
  melee()  { return d(20) + this.str + (this.brutal ? 1 : 0) - (this.blinded() || this.darkness()); }
  ranged() { return d(20) + this.pre - (this.blinded() || this.darkness()); }
  agility(dr)   { return (d(20) + this.agi - this.heav_armor()) > (dr + this.blinded()); }
  presence(dr)  { return (d(20) + this.pre) > (dr + this.blinded()); }
  strength(dr)  { return (d(20) + this.str) > (dr + this.blinded()); }
  toughness(dr) { return (d(20) + this.tou) > (dr + this.blinded()); }
  fists() {
    log('You attack with your fists.');
    if (current_target) {
      current_target.hit(d(2), 'blunt');
    } else {
      log('Thankfully there are no enemies around to see you shadow boxing.')
    }
  }
  hit(damage, type, target) {
    this.hp -= damage;
    if (this.hp <= 0) {
      if (this.pets.length > 0) {
        for(var i = 0; i < this.pets.length; i++) {
          if (this.pets[i]?.defense()) {
            this.hp += damage;
            return;
          }
        }
      }
      this.kill(target);
    } else if (damage > 0) {
      log('You suffer ' + damage + 'HP of ' + type + " damage!");
    }
  }
  kill(target) {
    this.hp = 0;
    log('You died.');
    current_player.killed_by = target;
    if (players.filter(el => !el.killed_by).length > 0) {
      confirm(this.name + " has died, time for another adventurer.");
      choose_char();
    } else {
      confirm("The party is dead, you have failed.");
      log("The party is dead, you have failed.");
      window.removeEventListener('keyup', key_up);
      choose_char(true);
      document.getElementById('c_player').style.display = 'none';
      document.getElementById('choose_text').style.display = 'none';
      document.getElementById('c_inv').style.display = 'none';
      document.getElementById('c_room').style.display = 'none';
    }
    try { this.clear(); } catch {}
  }
  blinded() { return this.blind ? 6 : 0; }
  darkness() {return this.current_room().darkness && !this.boggle_eyed ? 6 : 0}
  flash() { this.blind = true; }
  heav_armor() { return this.donned_armor?.name == 'Decent Armor' ? -1 : 0 }
  decrease_ability() {
    this._f = random_item_from([
      function() { this.agi -= 1; log('You lost 1 point of AGILITY')},
      function() { this.pre -= 1; log('You lost 1 point of PRESENCE')},
      function() { this.str -= 1; log('You lost 1 point of STRENGTH')},
      function() { this.tou -= 1; log('You lost 1 point of TOUGHNESS')}
    ]);
    this._f();
  }
  hellghast_tick() {
    if (this.hellghast) {
      log("The hellghast flames continues to lick at your flesh.");
      this.hit(this.hellghast.pop(), 'necrotic', 'Hellghast');
      if (this.hellghast.length == 0) { this.hellghast = false; }
    }
    if (this.hellghast_target) {
      log("The hellghast flames continues to lick at your enemies flesh.");
      this.hellghast_target.direct_hit(this.hellghast_target.hellghast.pop(), 'necrotic');
      if (this.hellghast_target.hellghast.length == 0) { this.hellghast_target = undefined; }
    }
  }
  undead_tick(turns) {
    if (this.undead == undefined && turns) { return this.undead = turns; }
    if (this.undead == undefined) { return; }

    this.undead -= 1;
    if (this.undead <= 0) {
      log("You succumb to the undead rot.");
      this.current_room().monsters.push(weak_monster[3](this.current_room().seed));
      this.kill('Undead rot');
      log("Your dead corpse rises again...");
    }
  }
  round() {
    this.hellghast_tick();
    this.undead_tick();
  }
  current_room() {
    if (this.y == undefined) { return; }
    return rooms[this.y][this.x]
  }
  pick_up(obj, evasion) {
    if (this.current_room()?.check_monsters(evasion) ) { return; }
    if (obj instanceof Pet) {
      if (this.cruel) {
        log("You try to call the " + obj.name + " over but it doesn't listen and runs off");
      } else {
        this.pets.push(obj);
        log("The " + obj.name + " slowly approaches and begins following you.");
      }
    }
    if ((obj instanceof Treasure) || (obj instanceof Weapon)) {
      this.items.push(obj);
      if (obj.name == 'Gas Mask' || obj.name == 'Grappling Hook') {
        obj.use();
      } else {
        log("You pick up a " + obj.name + " and stash it away.");
      }
    }
    if (obj instanceof Armor) {
      this.armor.push(obj);
      obj.use();
    }
    if (obj instanceof Scroll) {
      this.items.push(obj);
      log("You pick up a scroll of " + obj.name + " and stash it away.");
    }
    return true;
  }
  take_all(evasion=false) {
    var room = this.current_room();
    room.items.forEach(item => this.pick_up(item, evasion));
    room.items = [];
    room.draw();
  }
  use(index) {
    this.items[index].use();
    this.round();
    this.current_room().draw();
  }
  use_armor(index) {
    if (this.current_room().check_monsters()) { return; }
    this.armor[index].use();
    this.round();
    refresh_player_stats()
  }
  discard(index) {
    this.items[index].discard();
    refresh_player_stats()
  }
  discard_pet(index) {
    this.pets[index].discard();
    refresh_player_stats()
  }
  discard_armor(index) {
    this.armor[index].discard();
    refresh_player_stats()
  }
  trade(index) {
    this.items[index].destroy();
    this.pick_up(this.current_room().trade);
    complete_trade();
    refresh_player_stats();
  }
  trade_armor(index) {
    this.armor[index].destroy();
    this.pick_up(this.current_room().trade);
    complete_trade();
    refresh_player_stats();
  }
  trade_pet(index) {
    this.pet[index].destroy();
    this.pick_up(this.current_room().trade);
    complete_trade();
    refresh_player_stats();
  }
  trade_soul() {
    if (this.current_room().check_monsters()) { return; }
    this.hp -= Math.ceil(this.hp / 4);
    log("Your life essence is drained and you are left with a new power.");
    log("Hopefully it was worth it...");
    log("The cavern rings with hollow laughter and the socerer is no where to be seen.");
    this.pick_up(this.current_room().powers_pile);
    this.current_room().soul = false;
    this.current_room().draw();
  }
  destroy_item() {
    let destroyed_item = this.items[Math.floor(Math.random() * this.items.length)];
    if (destroyed_item) {
      log('Your beloved ' + destroyed_item.name + ' was destroyed before your eyes.');
      destroyed_item.destroy();
    }
    return destroyed_item;
  }
  start(stairwell) {
    log('Dive down into the catacombs...');
    this.starting_items.forEach(el => this.pick_up(el));
    entering_from = LEFT;
    this.move(0, [0, 3, 6][stairwell], true);
  }
  left() {
    return this.move(this.x - 1, this.y);
  }
  right() {
    return this.move(this.x + 1, this.y);
  }
  up() {
    return this.move(this.x, this.y - 1);
  }
  down() {
    return this.move(this.x, this.y + 1);
  }
  move(x, y, start, random) {
    this.prev_x = this.x;
    this.prev_y = this.y;

    x = clamp(x, 0, 9);
    // The top and bottom sides of the map also wrap!
    y %= 7;
    if (y < 0) { y += 7; }

    if ((this.prev_x != x || this.prev_y != y) &&
          (start || this.teleported.length || this.current_room().secret || this.slide || rooms[this.prev_y][this.prev_x].exits[(entering_from + 2)%4])) {
      if (this.hp == 0) { return; }
      if (this.current_room()?.darkness && !random && !this.boggle_eyed) {
        log("You stumble in the darkness and walk out a random exit.");
        return this.random_move(this.current_room().rand);
      }
      if (this.current_room()?.chasm && this.current_room()?.visited) {
        if (this.last_entrance == entering_from) {
          if (this.hook) { log("You swing across with your grappling hook."); }
          else if (this.levitate) { log("You float across and land safely on the other side"); this.levitate = false; }
          else { return; }
        }
        if (this.current_room().chasm_dir && [RIGHT, UP, LEFT, DOWN][this.last_entrance] == entering_from) {
          if (this.hook) { log("You swing across with your grappling hook."); }
          else if (this.levitate) { log("You float across and land safely on the other side"); this.levitate = false; }
          else { return; }
        } else if (!this.current_room().chasm_dir && [LEFT, DOWN, RIGHT, UP][this.last_entrance] == entering_from) {
          if (this.hook) { log("You swing across with your grappling hook."); }
          else if (this.levitate) { log("You float across and land safely on the other side"); this.levitate = false; }
          else { return; }
        }
      }
      if (this.current_room()?.monsters.length > 0 && !random) { this.evade(x, y); }
      if (this.slide) { this.teleported.push(check_exits[entering_from]); this.slide = false; log("You pass through without a trace."); }
      this.x = x;
      this.y = y;
      if (rooms[this.prev_y]?.[this.prev_x]?.secret && !rooms[this.prev_y][this.prev_x].exits[check_exits[entering_from]]) {
        rooms[this.y][this.x].secret_exit = entering_from;
        rooms[this.y][this.x].exits && (rooms[this.y][this.x].exits[entering_from] = 1);
        rooms[this.prev_y][this.prev_x].secret = false;
        rooms[this.prev_y][this.prev_x].exits[(entering_from + 2)%4] = 1;
        rooms[this.prev_y][this.prev_x].secret_exit = (entering_from + 2)%4;
      }
      this.last_entrance = entering_from;
      rooms[this.prev_y]?.[this.prev_x].draw();
      rooms[this.y][this.x].enter();
      this.round();
      if (!this.teleported.length && !start && !replaying) { track([x, y, entering_from]); }
      return true;
    } else { this.current_room().draw(); }
  }
  random_move(roll) {
    var x = this.x, y = this.y;
    var exits = get_all_indexes(this.current_room().exits, 1);
    var exit  = exits[Math.floor(roll() * exits.length)];
    switch(exit) {
      case(UP): {
        y = this.y - 1;
        break;
      }
      case(RIGHT): {
        x = this.x + 1;
        break;
      }
      case(DOWN): {
        y = this.y + 1;
        break;
      }
      case(LEFT): {
        x = this.x - 1;
        break;
      }
    }
    entering_from = check_exits[exit];
    current_player.move(x, y, null, true);
  }
  evade(x, y) {
    var evasion = d(6) + (this.cowardly ? 1 : 0);
    if (this.current_room().monsters.every(el => el.sleep)) { evasion = 6; this.current_room().monsters.forEach(el => el.sleep = false); }
    if (this.slide) { evasion = 6; this.slide = false}
    if (evasion <= 2) {
      log("You slip away but provoke an attack of opportunity.");
      this.current_room().monsters.forEach(m => m.inflict_damage());
    } else if (evasion == 3) {
      log("You try to slip away, and you do...the problem is the monsters followed you.");
      for(var i = 0; i < this.current_room().monsters.length; i++) {
        this.current_room().move_monsters(x, y);
      }
    } else if (evasion <= 5) {
      log("You turn around so quickly you are out before anything notices.");
    } else {
      log("You run around the room, grab the treasure and make it out without a scratch!");
      this.take_all(true);
    }
  }
  clear() {
    var room = this.current_room()
    this.items.forEach(el => room.items.push(el));
    this.pets.forEach(el => room.items.push(el));
    this.armor.forEach(el => room.items.push(el));
    room.bodies.push(this);
    this.items = [];
    this.pets = [];
    this.armor = [];
    current_player = undefined;
    room.draw();
  }
}