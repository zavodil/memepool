import React from "react";
import {Card} from "react-bootstrap";
import {Link} from "react-router-dom";

const Idea = ({idea, toggleTipModal, submitMeme}) => {
    const priceField = (idea.price ? `Price: ${idea.price} NEAR. ` : "") +
        (idea.proposal_price ?  `Proposal: ${idea.proposal_price} NEAR. ` : "") +
        `Tips: ${idea.total_tips} NEAR (${idea.vote_count})`;

    const memeTitle = idea.title + (idea.proposal_title ? " (For: " + idea.proposal_title + ")" : "");

    let submitMemeButton = "";
    if ((idea.price)) {
        submitMemeButton =

            <Link className='w-7 p-2 near-btn mb-auto align-top ml-2'
                    onClick={() => {
                        submitMeme(idea, parseInt(idea.price), idea.title);
                    }}
                    to='/submit_meme'
            >
                Submit
            </Link>;

    }


    return (
        <Card className='bg-gray-400 px-4 flex'>
            <div className='flex w-1/5 p-8 font-bold'>{memeTitle}</div>
            <div className='flex w-1/5 p-5'><img src={idea.image} className='meme'/></div>
            <div className='flex w-1/10 p-5'>Author: {idea.owner_account_id}</div>
            <div className='flex w-1/10 p-5'><a href={idea.link}>Details</a></div>
            <div className='flex w-1/10 p-5'>Tags: {idea.description}</div>
            <div className='flex w-1/10 p-5'>{priceField}</div>
            <div className='flex w-1/10 p-5'>
                <button className='w-7 p-2 near-btn mb-auto align-top'
                        onClick={() => toggleTipModal(idea, idea.owner_account_id)}>
                    Tip
                </button>
                {submitMemeButton}
            </div>
        </Card>
    )
};

export default Idea;
