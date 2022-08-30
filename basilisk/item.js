class Armor {
  constructor(name, tier, seed) {
    this.name = name;
    this.tier = tier;
    this.protection = Math.floor(r_gen(seed + name)() * tier*2) + 1;
  }
  defense(damage) {
    log('The blows glances off your ' + this.name + '. Damage taken reduced by ' + this.protection + '.');
    return Math.max(damage - this.protection, 0);
  }
  use() {
    if (current_player.nudist) {
      log('The thought of wearing any clothes scares you.')
    } else if (!this.nudist && (current_player.donned_armor == undefined || current_player.donned_armor.tier < this.tier)) {
      current_player.donned_armor = this;
      log('You don the ' + this.name + ' as it protects better than what you currently have on.');
    } else {
      log("You pick up a " + this.name + " stash it away.");
    }
  }
  discard() {
    current_player.current_room().add_item(this);
    this.destroy()
  }
  destroy() {
    if (current_player.donned_armor == this) { current_player.donned_armor = undefined; }
    current_player.armor.splice(current_player.armor.indexOf(this), 1);
    refresh_player_stats();
  }
}
class Weapon {
  constructor(name, damage, type) {
    this.name = name;
    this.damage = damage;
    this.type = type;
  }
  use() {
    log('You attack with the ' + this.name + '.');
    if (current_target) {
      current_target.hit(d(this.damage), this.type, this.name == "Crossbow");
    } else {
      log('But there is no enemy to be seen. Great move.')
    }
  }
  discard() {
    current_player.current_room().add_item(this);
    this.destroy()
  }
  destroy() {
    current_player.items.splice(current_player.items.indexOf(this), 1);
    refresh_player_stats();
  }
}
class Pet {
  constructor(name, combat, defense, seed) {
    this.name = name;
    this.combat = combat;
    this.defense = defense;
    this.rand = r_gen(seed + name);
  }
  roll(num) {
    return Math.floor(this.rand() * num) + 1;
  }
  discard() {
    log('You tell your ' + this.name + ' to stay behind. It listens.');
    current_player.current_room().add_item(this, false);
    this.destroy();
  }
  destroy() {
    current_player.pets.splice(current_player.pets.indexOf(this), 1);
    refresh_player_stats();
  }
}
class Treasure {
  constructor(name, use, deactivate, seed) {
    this.name = name;
    this.use = use;
    this.deactivate = deactivate;
    this.rand = r_gen(seed + name);
  }
  roll(num) {
    return Math.floor(this.rand() * num) + 1;
  }
  choice(array, msg) {
    return array[Math.floor(this.rand() * array.length)];
  }
  direct_attack(damage, type) {
    log('You attack with the ' + this.name);
    if (current_target) {
      current_target.direct_hit(this.roll(damage), type);
    } else {
      log('But there is no enemy to be seen. Great move.')
    }
  }
  discard() {
    this.deactivate();
    current_player.current_room().add_item(this);
    current_player.items.splice(current_player.items.indexOf(this), 1);
    refresh_player_stats();
  }
  destroy() {
    this.deactivate();
    current_player.items.splice(current_player.items.indexOf(this), 1);
    refresh_player_stats();
  }
}
class Scroll {
  constructor(name, activate, seed) {
    this.name = 'Scroll of ' + name;
    this.activate = activate;
    this.rand = r_gen(seed + name);
  }
  roll(num) {
    return Math.floor(this.rand() * num) + 1;
  }
  use() {
    if (current_player.illiterate) {
      return log("You try as you might to read the scroll but it doesn't make any sense to you.");
    } else {
      log("You open the scroll and chant it's verse out loud.");
      this.activate();
    }
  }
  discard() {
    current_player.current_room().add_item(this);
    current_player.items.splice(current_player.items.indexOf(this), 1);
    refresh_player_stats();
  }
  destroy() {
    current_player.items.splice(current_player.items.indexOf(this), 1);
    refresh_player_stats();
  }
}
var treasure_table = [
  function(seed) {return new Treasure("Grappling Hook",
    function() {
      current_player.hook = true;
      log('Grappling hook equipped. Should make crossing Hellvents and Chasms easy.');
    },
    function() {
      current_player.hook = false;
    }, seed
  )},
  function(seed) {return new Treasure("Salve",
    function() {
      var restore = this.roll(6);
      current_player.hp = Math.min((current_player.hp += restore), current_player.max_hp);
      log('You gulp down the potion and restore ' + restore + 'HP');
      this.destroy();
    }, function() {}, seed
  )},
  function(seed) {return new Treasure("Bomb",
    function() {
      this.direct_attack(12, 'explosive');
      this.destroy();
    }, function() {}, seed
  )},
  function(seed) {return new Pet("Monkey",
    function() {
      log('Your monkey jumps on the enemy and bites down hard!');
      current_target.direct_hit(this.roll(4), 'piercing');
    },
    function() {
      log('Your beloved monkey jumps in front of you at the last second absorbing a fatal blow. It lies there dead.');
      current_player.current_room().bodies.push(this);
      current_player.pets.splice(current_player.pets.indexOf(this), 1);
      return true;
    }, seed
  )},
  function(seed) {return new Armor("Crude Armor", 1, seed)},
  function(seed) {return new Treasure("Phase Key",
    function() {
      current_player.current_room().secret = true;
      log('The key disappears and now you may walk through a single wall in this room to reveal a hidden passage.');
      this.destroy();
    }, function() {}, seed
  )},
  function(seed) {return (current_player && _room().choice(scrolls)(seed)) || frandom_item_from(scrolls)(_seed) },
  function(seed) {return new Treasure("Black Poison",
    function() {
      this.direct_attack(4, 'burning');
      this.destroy();
    }, function() {}, seed
  )},
  function(seed) {return new Treasure("Rogue's Kit",
    function() {
      if (_room().traps.length) {
        _room().traps.forEach(el => {
          log('After sometime you manage disarm to disarm ' + el.name);
          _room().traps_disabled.push(el);
        });
        _room().traps = [];
        this.destroy();
      } else {
        log('There are no traps that you can see here.');
      }
    }, function() {}, seed
  )},
  function(seed) {return new Pet("Vicious Dog",
    function() {
      log('Your dog jumps on the enemy and bites down hard!');
      current_target.direct_hit(this.roll(4), 'piercing');
    }, function() {}, seed
  )},
  function() {return new Weapon("Zweihander", 10, 'slashing')},
  function(seed) {return (_room() && _room().choice(scrolls)(seed)) || frandom_item_from(scrolls)(_seed) },
  function(seed) {return new Treasure("Soporific Flute",
    function() {
      current_player.current_room().monsters.forEach(el => el.sleep = true);
      log('You play a sweet lullaby and the monsters falls asleep. The flute shatter silently in your hand once you stop. You can now evade once freely.');
      this.destroy();
    }, function() {}, seed
  )},
  function(seed) {return new Armor("Decent Armor", 2, seed)},
  function(seed) {return new Treasure("Water",
    function() {
      if (current_player.blind) {
        current_player.blind = false;
        log("You splash the water in your eyes. It's a miracle, you're no longer blind!");
      } else {
        current_player.hp = Math.min((current_player.hp += 1), current_player.max_hp);
        log("You splash the water on your face. Refreshing. Restore 1HP");
      }
      this.destroy();
    }, function() {}, seed
  )},
  function(seed) {return new Treasure("Gas Mask",
    function() {
      current_player.gas_mask = true;
      log('Gas mask equipped. Should make nullifying Basilisk Vapours and Neurotoxins easy.');
    },
    function() {
      current_player.gas_mask = false;
    }, seed
  )},
  function() {return new Weapon("Sword", 6, 'slashing')},
  function() {return new Weapon("Flail", 8, 'blunt')},
  function() {return new Weapon("Crossbow", 8, 'piercing')},
  function(seed) {return new Treasure("Backup Mandate",
    function() {
      current_player.backup = true;
      log('Mandates of Nechrubel: documents sealed by that great and dismal deity guaranteeing passage on the wings of the great Two- Headed Basilisk. Passage from the Dying World to the Undying Hereafter. Seems to be a copy of the one you were already holding. Can never have to many I suppose!');
    }, function() {}, seed
  )}
]
var weapons_table = [
  function() {return new Weapon("Staff", 4, 'blunt')},
  ...treasure_table.slice(16,19)
]
function cocoon_error() {
  window.addEventListener('keyup', key_up);
  log("The spell fizzles out. You did something wrong, please enter only valid numbers.");
}
var scrolls = [
  function(seed) {return new Scroll('Velvet Cocoon',
    function(self) {
      window.removeEventListener('keyup', key_up);
      var r_boons = boons.filter(el => current_player[el]);
      var r_boon = prompt(
        "Choose a BOON to remove:\n" +
        r_boons.map((el, index) => index + 1 + '. ' + el.replace(/_/, '-').toUpperCase()).join("\n"))
      r_boon = parseInt(r_boon);
      if (isNaN(r_boon) || r_boon < 1 || r_boon > r_boons.length) { return cocoon_error(); }
      current_player[r_boons[r_boon - 1]] = false;
      var r_affs = afflictions.filter(el => current_player[el]);
      var r_aff = prompt(
        "Choose a AFFLICTION to remove:\n" +
        afflictions.filter(el => current_player[el]).map((el, index) => index + 1 + '. ' + el.toUpperCase()).join("\n"))
      r_aff = parseInt(r_aff)
      if (isNaN(r_aff) || r_aff < 1 || r_aff > r_affs.length) { return cocoon_error(); }
      current_player[r_affs[r_aff - 1]] = false;

      var a_boons = boons.filter(el => !current_player[el]);
      var a_boon = prompt(
        "Choose a BOON to add:\n" +
        a_boons.map((el, index) => index + 1 + '. ' + el.replace(/_/, '-').toUpperCase()).join("\n"))
      a_boon = parseInt(a_boon);
      if (isNaN(a_boon) || a_boon < 1 || a_boon > a_boons.length) { return cocoon_error(); }
      current_player[a_boons[a_boon - 1]] = true;
      var a_affs = afflictions.filter(el => !current_player[el]);
      var a_aff = prompt(
        "Choose a AFFLICTION to add:\n" +
        afflictions.filter(el => !current_player[el]).map((el, index) => index + 1 + '. ' + el.toUpperCase()).join("\n"))
      a_aff = parseInt(a_aff)
      if (isNaN(a_aff) || a_aff < 1 || a_aff > a_affs.length) { return cocoon_error(); }
      current_player[a_affs[a_aff - 1]] = true;

      if (a_affs[a_aff - 1] == 'nudist' && current_player.donned_armor) {
        current_player.donned_armor = undefined;
        log("You throw off you armor in sudden disgust.");
      } else if (a_affs[a_aff - 1] == 'cruel' && current_player.pets.length > 0) {
        current_player.pets.forEach(el => _room().items.push(el));
        current_player.pets = [];
        log("Your pets suddenly abadon you.");
      }
      window.addEventListener('keyup', key_up);
      if (!self) { this.destroy(); }
    }, seed
  )},
  function(seed) {return new Scroll('Backslide',
    function(self) {
      log("You can walk through a wall once.");
      current_player.slide = true;
      if (!self) { this.destroy(); }
    }, seed
  )},
  function(seed) {return new Scroll('Nihil',
    function(self) {
      if (self) { return current_player.hit(666, 'necrotic', 'Nihil'); }
      if (!current_target) { return log("You need a target for this spell."); }
      log("Black tendrils of magik errupt from your fingers and engulf your target.");
      if (current_target.name == 'Arch Cultist') {
        log("The cultist laughs as the tendrils lap weakly at his flesh, inflicting no harm.");
      } else {
        log("The instant that the tendril makes contact with the " + current_target.name + 'is removed from existence.');
        current_target.direct_hit(666, 'necrotic');
        if (this.roll(4) == 1) {
          _room().items = [];
          log("The treasure in the room is also incinerated");
        }
      }
      if (!self) { this.destroy(); }
    }, seed
  )},
  function(seed) {return new Scroll('Levitate',
    function(self) {
      log("You begin to levitate, and easily pass over one obstacle.");
      current_player.levitate = true;
      if (!self) { this.destroy(); }
    }, seed
  )},
  function(seed) {return new Scroll('Northern Darkness',
    function(self) {
      if (self) {
        current_player.blind = true;
        return log("Darkness decends upon your eyes. You now suffer from blindness.");
      }
      if (!current_target) { return log("You need a target for this spell."); }
      _room().monsters.forEach(el => el.blind = true);
      log("Darkness decends on the eyes of you enemies, they now suffer from blindness.");
      if (!self) { this.destroy(); }
    }, seed
  )},
  function(seed) {return new Scroll('Stitch',
    function(self) {
      current_player.hp = current_player.max_hp;
      log("You are bathe in holy light. You are now fully healed.");
      if (!self) { this.destroy(); }
    }, seed
  )},
  function(seed) {return new Scroll('Push',
    function(self) {
      if (self) {
        log("The force of the blow knocks you out of the room and onto your ass.");
        return current_player.random_move(this.rand);
      }
      if (!current_target) { return log("You need a target for this spell."); }
      var dir = prompt("Select a direction to push the monster(s):\n1. UP\n2. RIGHT\n3. DOWN\n4. LEFT") - 1;
      if (isNaN(dir) || dir < 0 || dir > 3) { return log("The spell fizzles out. You did something wrong, please enter only valid numbers."); }
      if (_room().exits[parseInt(dir)] != 1) { return log("The spell fizzles out. This exit does not exist, try again."); }
      entering_from = check_exits[dir];
      if (dir == UP) { // replace with neighbour consts?
        _room().move_monsters(current_target.x, current_target.y - 1, true);
      } else if (dir == RIGHT) {
        _room().move_monsters(current_target.x + 1, current_target.y, true);
      } else if (dir == DOWN) {
        _room().move_monsters(current_target.x, current_target.y + 1, true);
      } else if (dir == LEFT) {
        _room().move_monsters(current_target.x - 1, current_target.y, true);
      }
      log("The monsters are forcibly pushed into the adjacent room.");
      if (!self) { this.destroy(); }
    }, seed
  )},
  function(seed) {return new Scroll('Hellghast',
    function(self) {
      var hits = [this.roll(6), this.roll(6), this.roll(6)];
      if (self) {
        log("You are engulfed in unholy fire. Nothing can stop this until it burns out.")
        current_player.hellghast = hits;
        return;
      }
      if (!current_target) { return log("You need a target for this spell."); }
      log("Your target is engulfed in unholy fire. Nothing can stop this until it burns out.")
      current_player.hellghast_target = current_target;
      current_player.hellghast_target.hellghast = hits;
      if (!self) { this.destroy(); }
    }, seed
  )}
]