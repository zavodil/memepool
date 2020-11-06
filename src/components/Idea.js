import React from "react";
import {Link} from "react-router-dom";

import {
    FacebookShareButton,
    TelegramShareButton,
    TwitterShareButton,
} from "react-share";
import {
    FacebookIcon,
    TelegramIcon,
    TwitterIcon
} from "react-share";

function smartTrim(str, length, delim, appendix) {
    if (str.length <= length) return str;

    var trimmedStr = str.substr(0, length + delim.length);

    var lastDelimIndex = trimmedStr.lastIndexOf(delim);
    if (lastDelimIndex >= 0) trimmedStr = trimmedStr.substr(0, lastDelimIndex);

    if (trimmedStr) trimmedStr += appendix;
    return trimmedStr;
}

function formatUrl(url) {
    let httpString = "http://";
    let httpsString = "https://";
    if (url.substr(0, httpString.length).toLowerCase() !== httpString && url.substr(0, httpsString.length).toLowerCase() !== httpsString)
        url = httpString + url;
    return validURL(url) ? url : "";
}

function validURL(str) {
    let pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
        '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    return !!pattern.test(str);
}

const Idea = ({idea, toggleTipModal, submitMeme, chooseWinnerMeme, currentAccountId, aloneMode}) => {
    if(aloneMode === undefined)
        aloneMode = false;

    const priceField = (idea.price ? `Price: ${idea.price} NEAR. ` : "") +
        (idea.proposal_price ? `Proposal: ${idea.proposal_price} NEAR. ` : "") +
        `Tips: ${idea.total_tips} NEAR ` + (idea.vote_count ? `(${idea.vote_count})` : "");

    const memeTitle = smartTrim(idea.title, 35, ' ', '…');
    const tagsArray = idea.description.split(",");

    const proposalButton = idea.proposal_id && idea.proposal_title ?
        <div className="text-base text-gray-600 leading-normal text-right meme-author">
            <a href={'/meme/' + idea.proposal_id}>
                <div
                    className='meme-proposal inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2'>
                    Proposal: {smartTrim(idea.proposal_title, 10, ' ', '…')}
                </div>
            </a>
        </div>
        : "";

    const winnerButton = idea.proposal_winner_title && idea.proposal_winner_id ?
        <div className="text-base text-gray-600 leading-normal text-right meme-author">
            <a href={'/meme/' + idea.proposal_winner_id}>
                <div
                    className='meme-proposal inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2'>
                    Winner: {smartTrim(idea.proposal_winner_title, 10, ' ', '…')}
                </div>
            </a>
        </div>
        : "";

    let submitMemeButton = "";
    if (!aloneMode && (idea.price)) {
        let submitDisabledFlag = !!idea.proposal_id;
        let submitUrl = !submitDisabledFlag ? '/submit_meme' : '';
        submitMemeButton =
            <Link className={"w-7 mx-2 p-2 near-btn  align-top" + (submitDisabledFlag ? " disabled" : "")}
                  onClick={() => {
                      submitMeme(idea, idea.price, idea.title);
                  }}
                  disabled={submitDisabledFlag}
                  to={submitUrl}
            >
                Submit meme to earn {parseFloat(idea.price).toFixed(2)} NEAR
            </Link>;

    }

    let tipDisabledFlag = (idea.owner_account_id === currentAccountId);

    let chooseWinnerButton = "";
    console.log("proposal_owner_account_id");
    console.log(idea.proposal_owner_account_id);
    if ((!idea.price && idea.proposal_id)) {
        if (idea.proposal_owner_account_id === currentAccountId && !idea.proposal_winner_chosen) {
            let chooseDisabledFlag = idea.proposal_winner_chosen;
            let chooseUrl = !chooseDisabledFlag ? '/select_winner_meme' : '';
            chooseWinnerButton =
                <Link className={'w-7 p-2 near-btn  align-top mx-2' + (chooseDisabledFlag ? " disabled" : "")}
                      onClick={() => {
                          chooseWinnerMeme(idea.idea_id, idea.proposal_id);
                      }}
                      disabled={chooseDisabledFlag}
                      to={chooseUrl}
                >
                    Choose Winner
                </Link>;
        } else if (idea.is_proposal_winner)
            chooseWinnerButton = <button className='w-7 p-2 near-btn  align-top mx-2'
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

    let detailsBlock = (idea.link) ? <div className="px-6 py-4">
        <div className="text-gray-700 text-base">
            <p className='text-base text-gray-600 leading-normal'><a href={formatUrl(idea.link)}>Details</a></p>
        </div>
    </div> : "";

    const tagsSpan = idea.description ? <span
        className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">Tags: {idea.description}</span> : "";

    const memelink = "/meme/" + idea.idea_id;

    const imgBlock = (idea.image && (idea.image.match(/\.(jpeg|jpg|gif|png)$/) != null)) ?
        <img className="w-full" src={idea.image} alt="meme"/> : "";

    return (
        <div className="meme pt-3 pb-3 mx-auto">
            <div className="max-w-2xl rounded overflow-hidden shadow-lg bg-white">
                <div className="text-base text-gray-600 float-right pr-1"><a href={memelink}
                                                                             title={"Meme ID " + idea.idea_id}
                                                                             className="mt-3">#{idea.idea_id}</a></div>
                <div className="px-6 py-4">
                    <div className="flex">
                        <div className="w-full font-bold text-xl mb-2 meme-title text-left">
                            <a href={memelink}>{memeTitle}</a>
                        </div>

                        {proposalButton}{winnerButton}
                    </div>
                </div>
                {imgBlock}

                <div className="my-4 mx-2 meme-action-buttons">
                    {submitMemeButton}
                    {chooseWinnerButton}
                    {tipButton}
                </div>

                <div className="px-6 pb-2 mb-2">
                    <span
                        className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2">Author: {idea.owner_account_id}</span>
                    {tagsSpan}
                    <span
                        className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2">{priceField}</span>

                    <span className='inline-block align-middle'>
                    <TwitterShareButton url={'http://near.gagcraft.com' + memelink} title={idea.title}
                                        via='near_protocol' hashtags={tagsArray}>
                        <TwitterIcon size={20} round={true}/></TwitterShareButton>&nbsp;
                        <FacebookShareButton url={'http://near.gagcraft.com' + memelink} title={idea.title}>
                        <FacebookIcon size={20} round={true}/></FacebookShareButton>&nbsp;
                        <TelegramShareButton url={'http://near.gagcraft.com' + memelink} title={idea.title}>
                        <TelegramIcon size={20} round={true}/></TelegramShareButton>
                    </span>

                    {detailsBlock}
                </div>

            </div>

        </div>
    )
};

export default Idea;
