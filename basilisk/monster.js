class Monster {
  constructor(name, dr, hp, damage, type, flair, on_hit, encounter, seed) {
    this.x = current_player.x;
    this.y = current_player.y;
    this.name = name;
    this.dr = dr;
    this.hp = hp;
    this.damage = damage;
    this.type = type;
    this.flair = flair;
    this.on_hit = on_hit;
    this.encounter = encounter;
    this.miss = true;
    this.rand = r_gen(seed + name);
  }
  roll(num) {
    return Math.floor(this.rand() * num) + 1;
  }
  blinded() { return this.blind ? 6 : 0; }
  direct_hit(damage, type) {
    if (this.current_room().spire) {
      return log("A sickly black tendril of lighting emnates from the spire blocking the attack.");
    }
    log("The " + this.name +" suffers " + damage + "HP of " + type + " damage!");
    this.hp -= damage;
    if (this.hp <= 0) {
      log("You have slain the " + this.name + ", gaining " + this.dr + "Points");
      current_player.points += this.dr;
      return this.clear();
    }
  }
  hit(damage, type, crossbow=false) {
    if (this.current_room().spire) {
      return log("A sickly black tendril of lighting emnates from the spire blocking the attack.");
    }
    if (this.name == "Whisper Bird") {
      if (this.miss && !current_player.presence(10)) {
        log("Try as you might you can't bring your self to attack this pathetic creature.");
        return this.inflict_damage();
      } else { this.miss = false; }
    }

    var base_roll = d(20);
    var attack_roll = base_roll + (crossbow ? current_player.pre : current_player.str);
    if (base_roll == 20) {
      log("Critical hit!");
      this.take_damage(damage * 2, type);
    } else if (base_roll == 1) {
      log("Critical miss!");
      this.current_room().monsters.forEach(el => el.inflict_damage(true));
    } else if (attack_roll > (this.dr - this.blinded())) {
      this.take_damage(damage, type);
    } else if (attack_roll == (this.dr - this.blinded())) {
      this.current_room().monsters.forEach(el => el.inflict_damage());
      this.take_damage(damage, type);
    } else if (attack_roll < (this.dr - this.blinded())) {
      log("Your attack misses");
      this.current_room().monsters.forEach(el => el.inflict_damage());
    }

    if (this.name == "Dusk Troull" && this.roll(4) == 1) {
      this.current_room().monsters.push(tough_monster[0](this.current_room().seed));
      current_target || (current_target = _room().monsters[0]);
      this.current_room().draw();
      log("The creature howls and another Dusk Troull appears!");
    }
  }
  take_damage(damage, type) {
    log("The " + this.name +" suffers " + damage + "HP of " + type + " damage!");
    this.hp -= damage
    if (this.hp <= 0) {
      log("You have slain the " + this.name + ", gaining " + this.dr + "Points!");
      current_player.points += this.dr;
      return this.clear();
    }
    if (current_player.current_room() != this.current_room()) {
      _room().move_monsters(current_player.x, current_player.y);
      this.encounter();
    } else {
      for(var i = 0; i < current_player.pets.length; i++) {
        current_player.pets[i].combat()
      }
    }
  }
  inflict_damage(critical) {
    var attack = this.roll(this.damage);
    log(this.flair);
    if (critical) {
      log("The enemy lands a critical hit!");
      attack *= 2;
    }
    attack = current_player.donned_armor ? current_player.donned_armor.defense(attack) : attack;
    current_player.hit(attack, this.type, this.name);
    this.on_hit();
  }
  current_room() { return rooms[this.y][this.x]; }
  move(x, y) { this.x = x; this.y = y; }
  clear() {
    this.current_room().monsters_slain.push(this);
    this.current_room().monsters.splice(this.current_room().monsters.indexOf(this), 1);
    if (this.name == 'Arch Cultist') { guardian = false; log("The guardian is dead, now you may seek an audience with Verhu in the lair."); }
    current_target = _room().monsters[0] || undefined;
    this.current_room().draw();
  }
}
var arch_cultist = function(seed) {return new Monster("Arch Cultist", 16, 14, 10, 'slashing', "The cultits let's out a howl and flourshes their blade.",
  function() {
    if (!current_player.toughness(10)) {
      log('The poison on the cultist blades sinks into your veins and you drop to ground.');
      current_player.hit(999, 'poison', 'poisoned blade');
    } else {
      log('The poison on the cultist blades splatters across your flesh, stinging but not taking hold.');
    }
  }, function() {}, seed)};
var basilisk = function(seed) {return new Monster("Verhu, The Two-Headed Basilisk", 16, 30, 10, 'piercing', 'The huge beast strikes at your face.',
  function() {
    if (!current_player.toughness(10)) {
      log("The poison dripping from the beasts' fangs sinks into your veins and you drop to ground.");
      current_player.hit(999, 'poison');
    } else {
      log("The poison on the beasts' fangs blades splatters across your flesh, stinging but not taking hold.");
    }
  }, function() {}, seed)};
var weak_monster = [
  function(seed) {return new Monster("Whisper Bird", 5, 1, 4, 'piercing', 'The foul avians bites you.', function() {}, function() {}, seed)},
  function(seed) {return new Monster("Unterwolf", 10, 4, 6, 'piercing', 'The rabid canine bites you.', function() {}, function() {}, seed)},
  function(seed) {return new Monster("Acolyte", 8, 3, 4, 'piercing', 'The acolyte brandishes their ceremonial dagger.', function() {}, function() {}, seed)},
  function(seed) {return new Monster("Undead Acolyte", 7, 3, 4, 'piercing', 'The undead acolyte grabs you and bites down hard.',
    function() {
      if (current_player.toughness(8)) {
        log("The foul creature's teeth do not break through your skin.");
      } else {
        var death = this.roll(6);
        current_player.undead_tick(death + 1);
        log("The foul creature's teeth break through your skin. The rot beings to take over your body");
        log("You will become undead in " + death + ' turns.');
      }
    }, function() {}, seed)},
  function(seed) {return new Monster("Crypt-Robbing Scum", 9, 3, 4, 'slashing', 'The vagrant charges at you with their short sword.', function() {}, function() {}, seed)},
  function(seed) {return new Monster("Wickhead Assassin", 10, 3, 6, 'piercing', 'Illuminating the room, the wickhead viciously stabs towards you.', function() {},
    function() {
      if (!current_player.presence(12)) {
        log("You hear shuffling behind you and turn around just in time to see a blade being slipped in between your shoulder blades.");
        this.inflict_damage();
      }
    }, seed)}
]
var tough_monster = [
  function(seed) {return new Monster("Dusk Troull", 10, 6, 6, 'blunt', 'The troull slams it club against your head.', function() {}, function() {}, seed)},
  function(seed) {return new Monster("Nephalix monkey", 12, 7, 6, 'slashing', "The monkey swipes at you with it sharp claws.",
    function() {
      if (!current_player.strength(8)) {
        log("The force of the blow knocks you out of the room and onto your ass.");
        current_player.hit(this.roll(4), 'blunt', 'knockback');
        current_player.random_move(this.rand);
      }
    }, function() {}, seed)},
  function(seed) {return new Monster("Cult Inquisitor", 13, 8, 10, 'piercing', 'With a deft movement the Inquisitor parries and lunges with his rapier.', function() {}, function() {}, seed)},
  function(seed) {return new Monster("Uberwolf", 14, 8, 8, 'piercing', 'The massive beast tackles you to the ground and bites at your throat.', function() {}, function() {}, seed)},
  function(seed) {return new Monster("Basilisk Spawn", 12, 6, 6, 'piercing', "The Minor Serpent coils up and springs with it's fangs out.", function() {},
    function() {
      if (!current_player.agility(16)) {
        log("You hear a hiss and then a bang as a huge explosion rocks the chamber.");
        log("You wake up moments later charred and still smouldering.");
        current_player.hit(this.roll(6), 'explosive', 'explosive breathe');
      }
    }, seed)},
  function(seed) {return new Monster("Grotesque", 14, 7, 8, 'blunt', "Raising it's arms over it's head it bring it down on your frail figure",
    function() {
      if (current_player.toughness(10)) {
        log("You feel your skin begin to harden upon contact with the monster. Thankfully the affliction does not spread far.");
      } else {
        log("You feel your skin begin to harden upon contact with the monster.");
        current_player.hit(999, 'petrification', 'petrification touch');
      }
    }, function() {}, seed)},
]