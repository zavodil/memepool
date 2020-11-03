import React from "react";
import PropTypes from 'prop-types';
import Idea from "./Idea";

class MemePage extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        console.log(this);
        try {
            this.props.contract.get_idea_by_id({id:1}).then((idea) => {
                this.idea = idea;
            });
        } catch (err) {
            console.log(err);
        }
    }

    toggleTipModal = async ({idea_id}, owner_account_id) => {
        if (!this.props.wallet.isSignedIn()) {
            window.alert("You need to sign in to tip!");
            return;
        }

        this.setState({
            isTipModalOpen: !this.state.isTipModalOpen,
            TipModalIdea: idea_id,
            TipModalOwnerAccountId: owner_account_id
        });
    };

    chooseWinnerMeme = async (idea_id, proposal_id) => {
        if (!this.props.wallet.isSignedIn()) {
            window.alert("You need to sign in to choose the winner!");
            return;
        }
        try {
            await this.props.contract.choose_winner(
                {
                    idea_id,
                    proposal_id
                },
                null
            );
        } catch (err) {
            console.error(err);
        }
    };

    render() {
        console.log(this.props);

        return (
            <Idea toggleTipModal={this.toggleTipModal} submitMeme={this.SubmitMeme}
                  chooseWinnerMeme={this.chooseWinnerMeme} idea={this.idea} key="1"
                  currentAccountId={this.GetConnectedAccountId()}/>
        );
    }
}
    /*

    const priceField = (idea.price ? `Price: ${idea.price} NEAR. ` : "") +
        (idea.proposal_price ? `Proposal: ${idea.proposal_price} NEAR. ` : "") +
        `Tips: ${idea.total_tips} NEAR ` + (idea.vote_count ? `(${idea.vote_count})` : "");

    const memeTitle = idea.title + (idea.proposal_title ? " (For: " + idea.proposal_title + ")" : "");

    let submitMemeButton = "";
    if ((idea.price)) {
        let submitDisabledFlag = !!idea.proposal_id;
        let submitUrl = !submitDisabledFlag ? '/submit_meme' : '';
        submitMemeButton =
            <Link className={"w-7 mx-2 p-2 near-btn  align-top" + (submitDisabledFlag ? " disabled" : "")}
                  onClick={() => {
                      submitMeme(idea, parseInt(idea.price), idea.title);
                  }}
                  disabled={submitDisabledFlag}
                  to={submitUrl}
            >
                Submit meme to earn {parseInt(idea.price)} NEAR
            </Link>;

    }

    let tipDisabledFlag = (idea.owner_account_id === currentAccountId);

    let chooseWinnerButton = "";
    if ((!idea.price && idea.proposal_id && idea.proposal_owner_account_id === currentAccountId)) {
        if (!idea.is_proposal_winner) {
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
        } else
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
            <p className='text-base text-gray-600 leading-normal'><a href={idea.link}>Details</a></p>
        </div>
    </div> : "";

    const memelink = "/meme/" + idea.idea_id;
    return (
        <div className="meme pt-3 pb-3 mx-auto">
            <div className="max-w-2xl rounded overflow-hidden shadow-lg bg-white">
                <div className="px-6 py-4">
                    <div className="flex">
                        <div className="w-full font-bold text-xl mb-2 meme-title text-left">{memeTitle}</div>
                        <div className="text-l meme-title text-right"><a href={memelink}>#{idea.idea_id}</a></div>
                        <div
                            className="text-base text-gray-600 leading-normal text-right meme-author">By {idea.owner_account_id}</div>
                    </div>
                </div>
                <img className="w-full" src={idea.image} alt="meme"/>

                <div className="my-4 mx-2 meme-action-buttons">
                    {submitMemeButton}
                    {chooseWinnerButton}
                    {tipButton}
                </div>

                <div className="px-6 pb-2">
                <span
                className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">Tags: {idea.description}</span>
                    <span
                        className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">{priceField}</span>

                    {detailsBlock}
                </div>

            </div>


        </div>
    )*/


export default MemePage;
