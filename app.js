import mobilecheck from "./util/mobilecheck";

// const defaultConfig = {fullscreen: true};
const NUMBER_ROWS = 10;
const NUMBER_COLS = 8;
const DEFAULT_PADDING = 10;
const defaultConfig = { width: 700, height: 875 };
const defaultEdgeLength = defaultConfig.width / NUMBER_COLS;

const isMobile = mobilecheck();
if (isMobile) {
  alert("Mobile Device Detected.");
}

window.addEventListener("resize", function() {
  drawResponsivePitch();
});

// DOM stuff for Two.js
const appElem = document.getElementById("app");
const two = new Two(defaultConfig);
two.appendTo(appElem);

const initialHandles = {
  edges: [],
  legalMoveVertices: [],
  currentPositionDot: null,
  startPositionDot: null,
  graphPaper: null,
  pitchBorders: null
};

const centerpoint = getCenterPoint(defaultEdgeLength);
// boxes: subdvisions of the main canvas specific for this game. Used for placement of main elements
// model: effective state to base rendering from
// handles: references to two.js objects after creation, so they can be deleted or manipulated. May not include objects that never need manipulation.

const game = {
  boxes: {
    pitch: {
      anchor: {
        x: 0,
        y: 0
      },
      end: {
        x: 0,
        y: 0
      }
    }
  },
  model: {
    pointList: [centerpoint],
    edgeMap: { [getCoordKey(centerpoint)]: [] }
  },
  handles: { ...initialHandles }
};

function drawResponsivePitch() {
  const { innerWidth, innerHeight } = window;

  if (innerWidth <= 700 || isMobile) {
    if (innerHeight >= innerWidth) {
      two.width = innerWidth;
      two.height = innerWidth * 1.25;
    } else {
      two.height = innerHeight;
      two.width = innerHeight * 0.8;
    }
  } else {
    two.width = defaultConfig.width;
    two.height = defaultConfig.height;
  }

  // make function that defines a box within the canvas
  // so create the box, assign it to a handle, and then apply drawPitch() and drawGraphPaper() to that box

  // we'll need a translation function to offset stuff that happens in the boxes vs the main canvas

  // at this point, we need to calculate the actual drawable area

  const pitchAnchorPoint = {
    x: DEFAULT_PADDING,
    y: DEFAULT_PADDING
  };

  const pitchEndPoint = {
    x: two.width - DEFAULT_PADDING,
    y: two.height - DEFAULT_PADDING
  };

  game.boxes.pitch = {
    anchor: { ...pitchAnchorPoint },
    end: { ...pitchEndPoint }
  };

  drawPitch(game.boxes.pitch);
}

drawResponsivePitch();

function drawPitch(pitch) {
  const edgeLength = (pitch.end.x - pitch.anchor.x) / NUMBER_COLS;

  two.clear();
  game.handles = { ...initialHandles };

  // @TODO start adapting here, using the pitch argument
  const centerpoint = getCenterPoint(edgeLength);
  game.handles.pitchBorders = drawPitchBorders(pitch, edgeLength);
  game.handles.graphPaper = drawGraphPaper(pitch, edgeLength);
  game.handles.startPositionDot = drawStartDot(centerpoint, edgeLength);
  renderPath(edgeLength);
}

function drawGraphPaper(box, edgeLength) {
  const lines = [];

  const { anchor, end } = box;

  for (let x = 0; x <= NUMBER_ROWS; x++) {
    const line = two.makeLine(
      anchor.x,
      anchor.y + x * edgeLength,
      end.x,
      anchor.y + x * edgeLength
    );
    line.stroke = "lightblue";
    lines.push(lines);
  }
  for (let y = 0; y <= NUMBER_COLS; y++) {
    const line = two.makeLine(
      anchor.x + y * edgeLength,
      anchor.y,
      anchor.x + y * edgeLength,
      end.y
    );
    line.stroke = "lightblue";
    lines.push(lines);
  }

  return lines;
}

function getCenterPoint() {
  return {
    x: NUMBER_COLS / 2,
    y: NUMBER_ROWS / 2
  };
}

function drawPitchBorders(box, edgeLength) {
  const segments = [];
  const { anchor, end } = box;

  // get horizontal center
  const centerpointX = (end.x + anchor.x) / 2;

  // get half-height
  const heightBound = end.y;
  const widthBound = end.x;

  // draw goal ends
  segments.push(
    // top end

    two.makeLine(
      centerpointX - edgeLength,
      anchor.y,
      centerpointX + edgeLength,
      anchor.y
    ),
    two.makeLine(
      centerpointX - edgeLength,
      anchor.y,
      centerpointX - edgeLength,
      anchor.y + edgeLength
    ),
    two.makeLine(
      centerpointX + edgeLength,
      anchor.y,
      centerpointX + edgeLength,
      anchor.y + edgeLength
    ),

    two.makeLine(
      centerpointX - edgeLength,
      anchor.y + edgeLength,
      anchor.x,
      anchor.y + edgeLength
    ),
    two.makeLine(
      centerpointX + edgeLength,
      anchor.y + edgeLength,
      end.x,
      anchor.y + edgeLength
    ),

    // bottom end

    two.makeLine(
      centerpointX - edgeLength,
      heightBound,
      centerpointX + edgeLength,
      heightBound
    ),
    two.makeLine(
      centerpointX - edgeLength,
      heightBound,
      centerpointX - edgeLength,
      heightBound - edgeLength
    ),
    two.makeLine(
      centerpointX + edgeLength,
      heightBound,
      centerpointX + edgeLength,
      heightBound - edgeLength
    ),

    two.makeLine(
      centerpointX - edgeLength,
      heightBound - edgeLength,
      anchor.x,
      heightBound - edgeLength
    ),
    two.makeLine(
      centerpointX + edgeLength,
      heightBound - edgeLength,
      end.x,
      heightBound - edgeLength
    ),

    // sides

    two.makeLine(
      anchor.x,
      anchor.y + edgeLength,
      anchor.x,
      heightBound - edgeLength
    ),
    two.makeLine(
      widthBound,
      anchor.y + edgeLength,
      widthBound,
      heightBound - edgeLength
    )
  );

  segments.forEach(s => (s.linewidth = 3));
  return segments;
}

function drawStartDot(point, edgeLength) {
  const renderablePoint = { x: point.x * edgeLength, y: point.y * edgeLength };

  const dot = two.makeCircle(renderablePoint.x, renderablePoint.y, 8);
  dot.fill = "black";

  return dot;
}

function drawLinePath(points, edgeLength) {
  if (!points || !points.length) {
    return;
  }

  // scale up distances between points
  const renderablePoints = points.map(p => ({
    x: p.x * edgeLength,
    y: p.y * edgeLength
  }));

  let currentPoint;
  let nextPoint;

  for (let i in renderablePoints) {
    currentPoint = renderablePoints[Number(i)];
    nextPoint = renderablePoints[Number(i) + 1];
    if (nextPoint) {
      const segment = two.makeLine(
        currentPoint.x,
        currentPoint.y,
        nextPoint.x,
        nextPoint.y
      );
      segment.stroke = "black";
      segment.linewidth = 2;
    }
  }
}

function drawMoveableSpots(fromCoord, edgeLength) {
  const points = [];
  const radius = isMobile ? edgeLength / 3 : edgeLength / 8;
  const heightBound = NUMBER_ROWS;
  const widthBound = NUMBER_COLS;
  const horizontalCenter = widthBound / 2;

  function makeCircleConditionally(x, y, radius) {
    // restrict movement off shoulders of the pitch
    if (y < 1 || y > heightBound - 1) {
      if (x < horizontalCenter - 1 || x > horizontalCenter + 1) {
        return null;
      }
    }

    const currentPoint = game.model.pointList[game.model.pointList.length - 1];
    const key = getCoordKey({ x, y });
    const compare = game.model.edgeMap[key];
    if (!compare || !compare.includes(getCoordKey(currentPoint))) {
      return two.makeCircle(x * edgeLength, y * edgeLength, radius);
    }
  }

  points.push(
    makeCircleConditionally(fromCoord.x - 1, fromCoord.y, radius),
    makeCircleConditionally(fromCoord.x + 1, fromCoord.y, radius),
    makeCircleConditionally(fromCoord.x, fromCoord.y - 1, radius),
    makeCircleConditionally(fromCoord.x, fromCoord.y + 1, radius),
    makeCircleConditionally(fromCoord.x - 1, fromCoord.y - 1, radius),
    makeCircleConditionally(fromCoord.x - 1, fromCoord.y + 1, radius),
    makeCircleConditionally(fromCoord.x + 1, fromCoord.y + 1, radius),
    makeCircleConditionally(fromCoord.x + 1, fromCoord.y - 1, radius)
  );

  const filteredPoints = points.filter(p => p);

  two.update();

  filteredPoints.forEach(p => {
    p._renderer.elem.addEventListener("mouseover", function() {
      p.fill = "lightblue";
      p.opacity = 0.6;
      two.update();
    });
    p._renderer.elem.addEventListener("mouseout", function() {
      p.fill = "white";
      p.opacity = 1;
      two.update();
    });
    p._renderer.elem.addEventListener("click", function() {
      const lastPoint = game.model.pointList[game.model.pointList.length - 1];
      const newPoint = {
        x: p._translation.x / edgeLength,
        y: p._translation.y / edgeLength
      };

      const lastPointKey = getCoordKey(lastPoint);
      const newPointKey = getCoordKey(newPoint);

      game.model.pointList.push(newPoint);
      if (
        game.model.edgeMap[newPointKey] &&
        game.model.edgeMap[newPointKey].length
      ) {
        game.model.edgeMap[newPointKey].push(lastPointKey);
        game.model.edgeMap[lastPointKey].push(newPointKey);
      } else {
        game.model.edgeMap[newPointKey] = [lastPointKey];
        game.model.edgeMap[lastPointKey].push(newPointKey);
      }

      renderPath(edgeLength);
    });
  });

  // remove old circles from the pitch
  two.remove(game.handles.legalMoveVertices);
  game.handles.legalMoveVertices = [...filteredPoints];
}

function getCoordKey(point) {
  return `${point.x}-${point.y}`;
}

function renderPath(edgeLength) {
  const currentPoint = game.model.pointList[game.model.pointList.length - 1];

  drawLinePath(game.model.pointList, edgeLength);
  two.remove(game.handles.currentPositionDot);
  drawMoveableSpots(currentPoint, edgeLength);
  game.handles.currentPositionDot = two.makeCircle(
    currentPoint.x * edgeLength,
    currentPoint.y * edgeLength,
    edgeLength / 5
  );
  game.handles.currentPositionDot.fill = "yellow";
  two.update();
}
