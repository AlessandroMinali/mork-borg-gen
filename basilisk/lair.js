function audience() {
  if (_room().check_monsters() || guardian || !_room().lair) { return; }
  window.removeEventListener('keyup', key_up);
  confirm("The cultist dead on the ground, you step over them and enter the unholy alcove.");
  confirm("Ahead of you in the darks depths you stand before Verhu, HE, the Twined-Headed Basilisk.");
  confirm("You reach into your pack and lift up the Mandate of Nechrubel.");
  confirm("The chamber begins to vibrate and a piercing laughter fills the air.");
  confirm("One head of the great snake lowers to your level. A great glassy eye examines you.");
  verhu(current_player.pre + d(6));
}
function verhu(result) {
  if (result <= 2) {
    lose();
  } else if (result == 3) {
    confirm("'HERESY', the words fill your head from an unknown source");
    if (current_player.backup) {
      confirm("Drenched in your own sweat, you finally find that 'other' copy of the Mandate and hold it up.");
      win();
    } else {
      lose();
    }
  } else if (result == 4) {
    confirm("The eye blinks and the serpent let's out a sigh. A moment passes in silence as the air thickens.");
    return verhu(current_player.pre + d(6));
  } else {
    win();
  }
}
function lose() {
  confirm("The Mandate bursts in flame along with your body.");
  confirm("You drop to the ground in an unrecognizable heap.");
  window.addEventListener('keyup', key_up);
  current_player.kill('Verhu');
}
function win() {
  confirm("The great snake unfurls and yet you cannot measure it's length.");
  confirm("It coils around you and suddenly you are on it's back.");
  confirm("Great leathery wings expand and you are both airborne, bursting forth from the catacombs");
  confirm("The countryside is aflame and you are at peace.");
  confirm("Witness the waste of the world and ascend to sit by Nechrubel's throne!");
  confirm('You win.');
  current_player = undefined;
  _room().draw();

}