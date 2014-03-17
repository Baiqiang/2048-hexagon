function KeyboardInputManager() {
  this.events = {};

  this.listen();
}

KeyboardInputManager.prototype.on = function (event, callback) {
  if (!this.events[event]) {
    this.events[event] = [];
  }
  this.events[event].push(callback);
};

KeyboardInputManager.prototype.emit = function (event, data) {
  var callbacks = this.events[event];
  if (callbacks) {
    callbacks.forEach(function (callback) {
      callback(data);
    });
  }
};

KeyboardInputManager.prototype.listen = function () {
  var self = this;

  var moveMap = {
    81: 2, // Q
    67: 3, // C
    69: 4, // E
    90: 5  // Z
  };

  var horizontalMap = {
    37: 0, // Left
    39: 1, // Right
    72: 0, // vim
    76: 1,
    65: 0, // A
    68: 1  // D
  }

  var verticalMap = {
    38: 2, // Up
    40: 5, // Down
    75: 2, // vim keybindings
    74: 5,
    87: 2, // W
    83: 5  // S
  };

  var holdingKeys = {};

  document.addEventListener("keydown", function (event) {
    var modifiers = event.altKey || event.ctrlKey || event.metaKey ||
                    event.shiftKey;
    var mapped = verticalMap[event.which] || horizontalMap[event.which];
    if (!modifiers) {
      if (mapped !== undefined) {
        holdingKeys[event.which] = true;
        event.preventDefault();
      }
      if (event.which === 32) self.restart.bind(self)(event);
    }
  });
  document.addEventListener("keyup", function (event) {
    var modifiers = event.altKey || event.ctrlKey || event.metaKey ||
                    event.shiftKey;
    var mapped    = moveMap[event.which];
    if (!modifiers) {
      if (holdingKeys[event.which]) {
        holdingKeys[event.which] = false;
      }

      if (mapped !== undefined) {
        event.preventDefault();
        self.emit("move", mapped);
      } else {
        var i = 0, j = 0, key, t;
        for (t in holdingKeys) {
          if (holdingKeys[t] == true) {
            i++;
            key = t;
          }
          j++;
        }
        if (i == 0) {
          if (j == 1 && horizontalMap[event.which] !== undefined) {
            self.emit("move", horizontalMap[event.which]);
          }
          if (j > 0) {
            for (t in holdingKeys) {
              delete holdingKeys[t];
            }
          }
        } else if (i == 1) {
          if ((verticalMap[key] !== undefined && horizontalMap[event.which] !== undefined)
            || (horizontalMap[key] !== undefined && verticalMap[event.which] !== undefined)
          ) {
            direction = detectDirection(key, event.which);
            event.preventDefault();
            self.emit("move", direction);
          }
        }
      }
    }

    function detectDirection(key1, key2) {
      var mapped1 = verticalMap[key1] || horizontalMap[key1];
      var mapped2 = verticalMap[key2] || horizontalMap[key2];
      if (mapped1 > mapped2) {
        mapped1 = mapped2 + mapped1 - (mapped2 = mapped1);
      }
      switch (mapped2) {
        case 2:
          return mapped1 * 2 + mapped2;
        case 5:
          return mapped2 - mapped1 * 2;
      }
    }
  });

  var retry = document.querySelector(".retry-button");
  retry.addEventListener("click", this.restart.bind(this));
  retry.addEventListener("touchend", this.restart.bind(this));

  var keepPlaying = document.querySelector(".keep-playing-button");
  keepPlaying.addEventListener("click", this.keepPlaying.bind(this));
  keepPlaying.addEventListener("touchend", this.keepPlaying.bind(this));

  // Listen to swipe events
  var touchStartClientX, touchStartClientY;
  var gameContainer = document.getElementsByClassName("game-container")[0];

  gameContainer.addEventListener("touchstart", function (event) {
    if (event.touches.length > 1) return;

    touchStartClientX = event.touches[0].clientX;
    touchStartClientY = event.touches[0].clientY;
    event.preventDefault();
  });

  gameContainer.addEventListener("touchmove", function (event) {
    event.preventDefault();
  });

  gameContainer.addEventListener("touchend", function (event) {
    if (event.touches.length > 0) return;

    var dx = event.changedTouches[0].clientX - touchStartClientX;
    var absDx = Math.abs(dx);

    var dy = event.changedTouches[0].clientY - touchStartClientY;
    var absDy = Math.abs(dy);
    var tan = dy / dx;
    var angle = Math.atan(dy / dx) / Math.PI * 180;
    var delta = 20;
    var direction

    switch (true) {
      case angle < 0 + delta && angle > 0 - delta:
        direction = dx > 0 ? 1 : 0;
        break;
      case angle < 60 + delta && angle > 60 - delta:
        direction = dx > 0 ? 3 : 2;
        break;
      case angle < -60 + delta && angle > -60 - delta:
        direction = dx > 0 ? 4 : 5;
        break;
    }
    if (direction !== undefined) {
      self.emit("move", direction);
    }
  });
};

KeyboardInputManager.prototype.restart = function (event) {
  event.preventDefault();
  this.emit("restart");
};

KeyboardInputManager.prototype.keepPlaying = function (event) {
  event.preventDefault();
  this.emit("keepPlaying");
};
