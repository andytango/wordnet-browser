import { map } from "ramda";
import React, { useCallback } from "react";
import { FaArrowRight } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { SenseLinkResult } from "../db/senseLinks";
import { Routes } from "../routes";
import { Senses } from "./Senses";
import { selectSearchFromUrl } from "../selectors/location";

export default function Word({ hidden }) {
  return (
    <div className={`w-full text-center ${hidden ? "hidden" : ""}`}>
      <BackButton />
      <Senses />
    </div>
  );
}

function BackButton() {
  const dispatch = useDispatch();
  const search = useSelector(selectSearchFromUrl);

  const handleClick = useCallback(
    () => dispatch({ type: Routes.ROOT, query: { search } }),
    [dispatch, search]
  );

  return (
    <a
      className="inline-block md:m-2 p-3 rounded-md font-bold text-gray-600  cursor-pointer border-2 border-gray-600"
      onClick={handleClick}
    >
      Back to results for "{search}''
    </a>
  );
}

function SenseLinks() {
  const senseLinks = useSelector(selectSenseLinks);

  if (senseLinks.length) {
    return (
      <>
        <div className="min-w-full">Related senses:</div>
        <div>{renderSenseLinks(senseLinks)}</div>
      </>
    );
  }

  return null;
}

const renderSenseLinks = map(renderSenseLink);

function renderSenseLink(senseLink: SenseLinkResult) {
  return <SenseLink key={senseLink.synsetid} senseLink={senseLink} />;
}

function SenseLink({ senseLink }: { senseLink: SenseLinkResult }) {
  return (
    <div className="flex  max-w-screen-sm mx-auto text-left py-2 my-6">
      <div className="text-gray-700 py-2">
        {senseLink.link}
        <FaArrowRight className="mx-6 inline-block" />
      </div>
      <div className="border-2 bg-white rounded-lg px-6 py-2 flex-1">
        <div>
          <span className="text-gray-500 font-bold mr-2">
            {senseLink.pos}.&nbsp;
          </span>
          <span>{senseLink.definition}</span>
        </div>
      </div>
    </div>
  );
}
