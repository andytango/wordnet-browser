import * as d3 from "d3";
import ellipsize from "ellipsize";
import { always, hasPath, prop, tap, path } from "ramda";

export function renderWordHierarchy(
  wordHierarchy,
  dimensions,
  resetCanvas,
  elem,
  handleClick
) {
  resetCanvas();
  const { width } = dimensions;
  const root = createD3Hierarchy(wordHierarchy, dimensions);
  const { x1, x0 } = getBounds(root);
  const strLimit = getStrLimit(dimensions);
  const truncateStr = (s, depth) => ellipsize(s, strLimit(depth));

  const svg = d3
    .select(elem)
    .append("svg")
    .attr("viewBox", [0, 0, width, x1 - x0 + root.data.dx * 4]);

  root.each((d) => {
    if (d.depth < 3) {
      d.y = d.y * 0.5;
    }
  });

  const mainGroup = svg
    .append("g")
    .attr("font-family", 'Nunito", sans-serif')
    .attr("font-size", width < 1024 ? 12 : 14)
    .attr("transform", `translate(${root.data.dy / 2},${root.data.dx - x0})`);

  mainGroup
    .append("g")
    .attr("fill", "none")
    .attr("stroke", "#555")
    .attr("stroke-opacity", 0.05)
    .attr("stroke-width", 2)
    .selectAll("path")
    .data(root.links())
    .join("path")
    .attr(
      "d",
      d3
        .linkHorizontal()
        .x((d) => d.y)
        .y((d) => d.x)
    );

  const node = mainGroup
    .append("g")
    .attr("stroke-linejoin", "round")
    .attr("stroke-width", 3)
    .selectAll("g")
    .data(root.descendants())
    .join("g")
    .attr("class", (d) => {
      if (d.depth > 0) {
        return "cursor-pointer";
      }

      return "";
    })
    .on("click", function (d) {
      if (d.depth === 3) {
        d.data.wordid && handleClick(d.data.wordid);
      } else if (d.depth > 0) {
        tooltip.attr("transform", `translate(${d.y},${d.x})`);

        const textWidth = tooltipText
          .attr("dy", d.depth < 3 ? `1.5em` : "0.31em")
          .attr("dx", d.children ? `0.5em` : "1.2em")
          .text(d.data.definition)
          .attr("text-anchor", getTextAnchor(d))
          .node()
          .getComputedTextLength();

        tooltipRect.attr("width", textWidth + 16);

        if (d.depth < 2) {
          tooltipRect.attr("x", -textWidth / 2);
        } else {
          tooltipRect.attr("x", 0);
        }

        tooltip.attr("visibility", "visible");
        d3.event.stopPropagation();
      }
    })
    .attr("transform", (d) => `translate(${d.y},${d.x})`);

  node
    .append("circle")
    .attr("fill", (d) => (d.depth === 0 || d.depth === 3 ? "#9b2c2c" : "#999"))
    .attr("r", 6);

  node
    .filter(hasPath(["data", "link"]))
    .append("text")
    .attr("fill", "#718096")
    .attr("dy", `1.2em`)
    .attr("text-anchor", "end")
    .text(path(["data", "link"]));

  node
    .append("text")
    .attr("class", (d) => {
      if (d.depth > 0) {
        return "underline";
      }

      return "";
    })
    .attr("dy", (d) => {
      return d.depth < 3 ? `1.2em` : "0.2em";
    })
    .attr("dx", (d) => (d.children ? `0.5em` : "1em"))
    .attr("text-anchor", getTextAnchor)
    .on("click", (d) => {
      d.data.wordid && handleClick(d.data.wordid);
    })
    .text((d) => truncateStr(d.data.lemma || d.data.definition, d.depth))
    .append("svg:title")
    .text((d) => d.data.lemma || d.data.definition);

  const tooltip = mainGroup.append("g");

  const tooltipRect = tooltip
    .append("rect")
    .attr("y", "0.2em")
    .attr("height", "2em")
    .attr("fill", "white")
    .attr("rx", "3");
  const tooltipText = tooltip.append("text");

  mainGroup.on("click", () => {
    tooltip.attr("visibility", "hidden");
  });
}

function createD3Hierarchy(wordHierarchy, { height, width }) {
  const newRoot = d3.hierarchy(wordHierarchy);
  newRoot.data.dx = getDx(newRoot, height);
  newRoot.data.dy = getDy(width, newRoot);
  return d3.tree().nodeSize([newRoot.data.dx, newRoot.data.dy])(newRoot);
}

function getDy(width, newRoot) {
  if (width < 1440) {
    return width / (newRoot.height + 2);
  }

  return width / (newRoot.height + 1);
}

const minSpacing = 24;

function getDx(newRoot, height) {
  const summed = newRoot.copy().sum(always(1));
  const nodeCount = summed.value - 1;

  if (minSpacing * nodeCount < height) {
    return height / nodeCount;
  }

  return minSpacing;
}

function getStrLimit({ width }) {
  return (depth) => {
    if (depth === 0) {
      return 30;
    }

    if (depth === 1 && width > 2560) {
      return 70;
    }

    if (depth === 1 && width > 1920) {
      return 50;
    }

    if (depth === 1 && width > 1600) {
      return 40;
    }

    if (depth === 1) {
      return 30;
    }

    if (width > 2560) {
      return 160;
    }

    if (width > 1920) {
      return 140;
    }

    if (width > 1600) {
      return 140;
    }

    if (width > 1440) {
      return 120;
    }

    if (width > 1280) {
      return 100;
    }

    if (width > 1024) {
      return 60;
    }

    return 50;
  };
}

function getBounds(root) {
  let x0 = Infinity;
  let x1 = -x0;

  root.each((d) => {
    if (d.x > x1) {
      x1 = d.x;
    }
    if (d.x < x0) {
      x0 = d.x;
    }
  });

  return { x1, x0 };
}

function getTextAnchor(d) {
  if (d.depth < 2) {
    return "middle";
  }

  return "start";
}