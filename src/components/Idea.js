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
    if(!idea.price) {
        tipButton = <button className='w-7 p-2 near-btn mb-auto align-top'
                            onClick={() => toggleTipModal(idea, idea.owner_account_id)}
                            disabled={tipDisabledFlag}>
            Tip
        </button>
    }


    return (
        <Card className='bg-gray-400 px-4 flex'>
            <div className='flex w-1/5 p-8 font-bold'>{memeTitle}</div>
            <div className='flex w-1/5 p-5'><img src={idea.image} className='meme'/></div>
            <div className='flex w-1/10 p-5'>Author: {idea.owner_account_id}</div>
            <div className='flex w-1/10 p-5'><a href={idea.link}>Details</a></div>
            <div className='flex w-1/10 p-5'>Tags: {idea.description}</div>
            <div className='flex w-1/10 p-5'>{priceField}</div>
            <div className='flex w-1/5 p-5'>
                {tipButton}
                {submitMemeButton}
                {chooseWinnerButton}
            </div>
        </Card>
    )
};

export default Idea;
