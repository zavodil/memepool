import React from "react";
import {Card} from "react-bootstrap";
import {Link} from "react-router-dom";

const Idea = ({idea, toggleTipModal, submitMeme, chooseWinnerMeme, currentAccountId}) => {
  const priceField = (idea.price ? `Price: ${idea.price} NEAR. ` : "") +
    (idea.proposal_price ? `Proposal: ${idea.proposal_price} NEAR. ` : "") +
    `Tips: ${idea.total_tips} NEAR (${idea.vote_count})`;

  const memeTitle = idea.title + (idea.proposal_title ? " (For: " + idea.proposal_title + ")" : "");

  let submitMemeButton = "";
  if ((idea.price)) {
    let submitDisabledFlag = !!idea.idea_id;
    let submitUrl = !submitDisabledFlag ? '/submit_meme' : '';
    submitMemeButton =
      <Link className={"w-7 p-2 near-btn mb-auto align-top ml-2" + (submitDisabledFlag ? " disabled" : "")}
            onClick={() => {
              submitMeme(idea, parseInt(idea.price), idea.title);
            }}
            disabled={submitDisabledFlag}
            to={submitUrl}
      >
        Submit
      </Link>;

  }

  let tipDisabledFlag = (idea.owner_account_id === currentAccountId);

  let chooseWinnerButton = "";
  if ((!idea.price && idea.proposal_id && idea.proposal_owner_account_id === currentAccountId)) {
    if (!idea.is_proposal_winner) {
      let chooseDisabledFlag = idea.proposal_winner_chosen;
      let chooseUrl = !chooseDisabledFlag ? '/select_winner_meme' : '';
      chooseWinnerButton =
        <Link className={'w-7 p-2 near-btn mb-auto align-top ml-2' + (chooseDisabledFlag ? " disabled" : "")}
              onClick={() => {
                chooseWinnerMeme(idea.idea_id, idea.proposal_id);
              }}
              disabled={chooseDisabledFlag}
              to={chooseUrl}
        >
          Choose
        </Link>;
    } else
      chooseWinnerButton = <button className='w-7 p-2 near-btn mb-auto align-top ml-2'
                                   disabled={true}>
        Winner
      </button>

  }

  let tipButton = "";
  if (!idea.price) {
    tipButton = <button className='near-btn'
                        onClick={() => toggleTipModal(idea, idea.owner_account_id)}
                        disabled={tipDisabledFlag}>
      Tip
    </button>
  }


  return (
    <div className="pt-3 pb-3 mx-auto">
      <div className="max-w-2xl rounded overflow-hidden shadow-lg bg-white">
        <img className="w-full" src={idea.image} alt="meme"/>
        <div className="px-6 py-4">
          <div className="flex">
          <div className="w-1/2 float-left font-bold text-xl mb-2 meme-title text-left">{memeTitle}</div>
          <div className="w-1/2 float-right text-base text-gray-600 leading-normal text-right">author: {idea.owner_account_id}</div>
          </div>
          <div className="text-gray-700 text-base">
            <p className='text-base text-gray-600 leading-normal'><a href={idea.link}>Details</a></p>
          </div>
        </div>
        <div className="px-6 pt-4 pb-2">
            <span
              className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">Tags: {idea.description}</span>
          <span
            className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">{priceField}</span>
        </div>

        <div className="flex mb-4">
          <div className="w-1/3 h-12">{submitMemeButton}</div>
          <div className="w-1/3 h-12">{chooseWinnerButton}</div>
          <div className="w-1/3 h-12">{tipButton}</div>
        </div>


      </div>


    </div>
  )
};

export default Idea;
