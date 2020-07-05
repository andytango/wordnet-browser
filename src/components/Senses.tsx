import * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { renderWordHierarchy } from "../d3/wordHierarchy";
import { useWordHierarchy } from "../hooks/wordHierarchy";
import { Routes } from "../routes";
import { selectSearchFromUrl, selectWordId } from "../selectors/location";

export function Senses() {
  const wordid = useSelector(selectWordId);
  const wordHierarchy = useWordHierarchy();
  const elemRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: -1, height: -1 });
  const dispatch = useDispatch();
  const search = useSelector(selectSearchFromUrl);

  const handleClick = useCallback(
    (wordid) =>
      dispatch({ type: Routes.WORD, payload: { wordid }, query: { search } }),
    [dispatch]
  );

  const resetCanvas = useCallback(() => {
    if (elemRef.current && elemRef.current.firstChild) {
      elemRef.current.removeChild(elemRef.current.firstChild);
    }
  }, [elemRef.current]);

  useEffect(resetCanvas, [wordid]);

  useEffect(() => {
    if (elemRef.current !== null) {
      const updateDimensions = () => {
        resetCanvas();
        setDimensions({
          width: elemRef.current.clientWidth,
          height: elemRef.current.clientHeight,
        });
      };

      updateDimensions();

      window.addEventListener("resize", updateDimensions);

      return () => {
        window.removeEventListener("resize", updateDimensions);
      };
    }

    return () => null;
  }, [elemRef.current]);

  useEffect(() => {
    console.log("Rendering tree", {
      wordHierarchy,
      dimensions,
      elemRef: elemRef.current,
      handleClick,
    });
    if (
      wordHierarchy &&
      dimensions.width > 0 &&
      elemRef.current &&
      handleClick
    ) {
      renderWordHierarchy(
        wordHierarchy,
        dimensions,
        resetCanvas,
        elemRef.current,
        handleClick
      );
    }
  }, [wordHierarchy, dimensions, elemRef.current, handleClick]);

  return <div className="flex-1" ref={elemRef} />;
}
