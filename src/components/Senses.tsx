import ellipsize from "ellipsize";
import React, { useRef, useEffect, useState, useCallback } from "react";
import { useWordHierarchy } from "../hooks/wordHierarchy";
import * as d3 from "d3";
import { useDispatch, useSelector } from "react-redux";
import { selectSearchFromUrl } from "../selectors/location";
import { Routes } from "../routes";

const truncateStr = (s: string) => ellipsize(s, 52);

export function Senses() {
  const wordHierarchy = useWordHierarchy();
  const elem = useRef(null as null | Element);
  const width = (elem.current && elem.current.clientWidth) || 0;
  const [root, setRoot] = useState(null as any);
  const dispatch = useDispatch();
  const search = useSelector(selectSearchFromUrl);

  const handleClick = useCallback(
    (wordid) =>
      dispatch({ type: Routes.WORD, payload: { wordid }, query: { search } }),
    [dispatch]
  );

  useEffect(() => {
    if (wordHierarchy) {
      const newRoot = d3.hierarchy(wordHierarchy);
      newRoot.dx = 20;
      newRoot.dy = width / (newRoot.height + 1);
      setRoot(d3.tree().nodeSize([newRoot.dx, newRoot.dy])(newRoot));
    }
  }, [wordHierarchy]);

  useEffect(() => {
    if (elem.current.firstChild) {
      elem.current.removeChild(elem.current.firstChild);
    }
  }, [root]);

  useEffect(() => {
    if (!root || !elem.current) {
      return;
    }

    let x0 = Infinity;
    let x1 = -x0;

    root.each((d) => {
      if (d.x > x1) {
        x1 = d.x;
      }
      if (d.x < x0) {
        x0 = d.x;
      }

      if (d.y) {
        d.y = d.y - d.y * 0.1 * (d.depth - 1);
      }
    });

    const svg = d3
      .select(elem.current)
      .append("svg")
      .attr("viewBox", [0, 0, width, x1 - x0 + root.dx * 4]);

    const g = svg
      .append("g")
      .attr("font-family", 'Nunito", sans-serif')
      .attr("font-size", 14)
      .attr("transform", `translate(${root.dy / 2},${root.dx - x0})`);

    g.append("g")
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

    const node = g
      .append("g")
      .attr("stroke-linejoin", "round")
      .attr("stroke-width", 3)
      .selectAll("g")
      .data(root.descendants())
      .join("g")
      .attr("transform", (d) => {
        return `translate(${d.y},${d.x})`;
      });

    node
      .append("circle")
      .attr("fill", (d) => (d.children ? "#9b2c2c" : "#999"))
      .attr("r", 4);

    node
      .on("click", (d) => {
        d.data.wordid && handleClick(d.data.wordid);
      })
      .append("text")
      .attr("dy", (d) => (d.children ? `1.5em` : "0.31em"))
      .attr("x", (d) => (d.children ? `0` : "1em"))
      .attr("text-anchor", (d) => (d.children ? "middle" : "start"))
      .on("click", (d) => {
        d.data.wordid && handleClick(d.data.wordid);
      })
      .text((d) => truncateStr(d.data.lemma || d.data.definition))
      .append("svg:title")
      .text((d) => d.data.lemma || d.data.definition);
  }, [root, elem.current]);

  return <div ref={elem}>Senses</div>;
}
