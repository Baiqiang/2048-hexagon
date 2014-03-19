// Wait till the browser is ready to render the game (avoids glitches)
window.requestAnimationFrame(function () {
  window.gameName = "2048-hexagon";
  new GameManager(5, KeyboardInputManager, HTMLActuator, LocalScoreManager);
});
