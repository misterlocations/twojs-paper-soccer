import {
  DEFAULT_PADDING_X,
  DEFAULT_PADDING_Y,
  DEFAULT_PITCH_DIMENSIONS,
  NUMBER_COLS,
} from "./constants";

import { createGame } from './core';

import {
  renderPitch
} from './renderers'

function createPitch() {
  const { innerWidth, innerHeight } = window;

  // in the future, let's probably just display a "height is too small" message in css
  if (innerWidth <= 440) {
    if (innerHeight >= innerWidth) {
      two.width = innerWidth;
      two.height = innerWidth * 1.25;
    } else {
      two.height = innerHeight;
      two.width = innerHeight * 0.8;
    }
  } else {
    two.width = DEFAULT_PITCH_DIMENSIONS.width;
    two.height = DEFAULT_PITCH_DIMENSIONS.height;
  }

  const pitchAnchorPoint = {
    x: DEFAULT_PADDING_X,
    y: DEFAULT_PADDING_Y,
  };

  const pitchEndPoint = {
    x: two.width - DEFAULT_PADDING_X,
    y: two.height - DEFAULT_PADDING_Y,
  };

  return [{
    anchor: { ...pitchAnchorPoint },
    end: { ...pitchEndPoint },
  }, (pitchEndPoint.x - pitchAnchorPoint.x) / NUMBER_COLS];
}

// ENTRY POINT

// create the game
const game = createGame();
const { two } = game;

// start off with the first render of the pitch
const [pitch, edgeLength] = createPitch();
game.boxes.pitch = pitch;
game.edgeLength = edgeLength;
renderPitch(game);

// Global window stuff
window.addEventListener("resize", function () {
  const [pitch, edgeLength] = createPitch();
  game.boxes.pitch = pitch;
  game.edgeLength = edgeLength;
  renderPitch(game);
});
