import React from "react";
import PropTypes from 'prop-types';
import Common from '../functions.js'
import Idea from "./Idea";
import Modal from "./Modal";
import {BN} from 'bn.js'

class RandomMeme extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            idea: {},

            isTipModalOpen: false,
            TipModalIdea: 0,
            TipModalOwnerAccountId: 0,
        }
    }

    componentDidMount() {
        try {
            this.props.contract.get_random_meme().then((idea) => {
                if (!this.props.ideas.length) {
                    this.props.contract.get_all_ideas().then((ideas) => {
                        this.setState({
                            ...this.state,
                            idea: Common.GetIdeaAdvancedFields(idea, ideas)
                        });
                    });
                } else {
                    this.setState({
                        ...this.state,
                        idea: Common.GetIdeaAdvancedFields(idea, this.props.ideas)
                    });
                }
            });
        } catch (err) {
            console.log(err);
        }
    }

    /* TODO mode it to common */
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

    tipMeme = async (idea_id, deposit, owner_account_id) => {
        if (!this.props.wallet.isSignedIn()) {
            window.alert("You need to sign in to tip!");
            return;
        } else if (owner_account_id === this.GetConnectedAccountId()) {
            window.alert("You can't tip your own meme");
            return;
        }

        const price_near = new BN(deposit * 100000).mul(new BN("10000000000000000000")).toString();
        try {
            await this.props.contract.tip_meme(
                {
                    idea_id
                },
                null,
                price_near
            );
        } catch (err) {
            console.error(err);
        }
    };

    GetConnectedAccountId() {
        return this.props.wallet._connectedAccount.accountId;
    }

    SubmitMeme = async ({idea_id}, price, title) => {
        if (!this.props.wallet.isSignedIn()) {
            window.alert("You need to sign in to submit meme!");
            return;
        }

        this.setState({
            submitMemeIdea: idea_id,
            submitMemePrice: price,
            submitMemeTitle: title
        });
    };


    render() {
        if (this.state.idea && Object.keys(this.state.idea).length) {
            const RenderTipModal = () => {
                return <Modal show={this.state.isTipModalOpen}
                              onClose={this.toggleTipModal}>
                    <div> Tip Some NEAR to {this.state.TipModalOwnerAccountId} </div>
                    <div>
                        <input autoFocus={true} type="text"
                               onChange={(event) => {
                                   this.tipAmount = event.target.value.replace(/[^0-9.]/g, '')
                               }
                               }
                        />
                    </div>
                    <div>
                        <button className='w-7 p-2 near-btn mb-auto align-top' onClick={() => {
                            this.tipMeme(this.state.TipModalIdea, this.tipAmount, this.state.TipModalOwnerAccountId)
                        }}>
                            Tip NEAR tokens
                        </button>
                    </div>
                </Modal>;
            };

            return (
                <div className="px-2 py-2 m-3 pb-2 text-center pt-20">
                    <div className='flex flex-col pb-4 col-xs-6'>
                        <div className="meme pt-3 pb-3 mx-auto">
                            <div className="max-w-2xl rounded overflow-hidden shadow-lg bg-white">
                                <Idea toggleTipModal={this.toggleTipModal} submitMeme={this.SubmitMeme}
                                      chooseWinnerMeme={this.chooseWinnerMeme} idea={this.state.idea} key={this.state.idea.idea_id}
                                      currentAccountId={this.props.wallet._connectedAccount.accountId} aloneMode={true}/>
                            </div>
                        </div>
                        <div><a className="mb-1 left near-btn justify-start mx-1"
                                href="/random">More Random</a>
                        </div>
                    </div>
                    <RenderTipModal/>
                </div>
            );
        } else
            return ("Wait...")
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


export default RandomMeme;
