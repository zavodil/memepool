import React, {Component} from "react";
import Header from "./components/Header";
import {APP_TITLE, MIN_DEPOSIT_AMOUNT, APP_PATH} from "./constants";
import {BrowserRouter as Router, Switch, Route, Redirect, Link} from "react-router-dom";
import CreateMeme from "./components/CreateMeme.js";
import CreateIdea from "./components/CreateIdea.js";
import HelmetMetaData from "./components/HelmetMetaData.js";
import {BN} from 'bn.js'
import Idea from "./components/Idea";
import Profile from "./components/Profile";
import Withdrawal from "./components/Withdrawal";
import WithdrawalShort from "./components/WithdrawalShort";
import UserDeposits from "./components/UserDeposits";
import Modal from './components/Modal';
import "regenerator-runtime/runtime";
import "./css/index.css";
import "./index.css";
import { utils } from 'near-api-js'

const FRAC_DIGITS = 5

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ideas: [],
            withdrawals: [],
            user_deposits: [],
            current_user_remaining_withdrawal: 0,

            isTipModalOpen: false,
            TipModalIdea: 0,
            TipModalOwnerAccountId: 0,

            submitMemeIdea: 0,
            submitMemePrice: 0,
            submitMemeTitle: ""
        };
        this.tipAmount = 10;
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


    formatNearAmount(amount) {
        if(!amount)
            return 0;

        amount =this.toFixed(amount);
        //return amount.toLocaleString().substr(0, amount.toLocaleString().length - ",000,000,000,000,000,000,000,000".length);
        let ret =  utils.format.formatNearAmount(amount.toString(), FRAC_DIGITS)
        console.log(ret)
        if (amount === '0') {
            return amount;
        } else if (ret === '0') {
            return `<${!FRAC_DIGITS ? `0` : `0.${'0'.repeat((FRAC_DIGITS || 1) - 1)}1`}`;
        }
        return ret;
    }

    toFixed(x) {
        if (Math.abs(x) < 1.0) {
            let e = parseInt(x.toString().split('e-')[1]);
            if (e) {
                x *= Math.pow(10,e-1);
                x = '0.' + (new Array(e)).join('0') + x.toString().substring(2);
            }
        } else {
            let e = parseInt(x.toString().split('+')[1]);
            if (e > 20) {
                e -= 20;
                x /= Math.pow(10,e);
                x += (new Array(e+1)).join('0');
            }
        }
        return x;
    }

    GetConnectedAccountId() {
        return this.props.wallet._connectedAccount.accountId;
    }

    GetBlackListId() {
        return [7];
    }

    componentDidMount() {
        try {
            this.props.contract.get_all_ideas().then((ideas) => {
                console.log("get_all_ideas");
                console.log(ideas);

                for (let index in ideas) {
                    const idea = ideas[index];
                    idea.price = this.formatNearAmount(idea.price);
                    idea.total_tips = this.formatNearAmount(idea.total_tips);
                    if (!idea.price && idea.proposal_id) {
                        idea.proposal_owner_account_id = ideas[idea.proposal_id].owner_account_id;
                        idea.proposal_winner_chosen = !!ideas[idea.proposal_id].proposal_id;
                        idea.is_proposal_winner = ideas[idea.proposal_id].proposal_id === idea.idea_id;
                        idea.proposal_price = ideas[idea.proposal_id].price || 0;
                        idea.proposal_title = ideas[idea.proposal_id].title || "";
                    }

                    if(idea.price && ideas.hasOwnProperty(idea.proposal_id)) {
                        idea.proposal_winner_title = ideas[idea.proposal_id].title || "";
                        idea.proposal_winner_id = ideas[idea.proposal_id].idea_id || 0;
                    }
                }

                const order_keys = Object.keys(ideas).sort(function (key1, key2) {
                    const a = ideas[key2];
                    const b = ideas[key1];
                    if (b.proposal_id && !a.proposal_id)
                        return a.idea_id < b.proposal_id ? -1 : a.idea_id > b.proposal_id ? 1 : 0;

                    if (a.proposal_id && !b.proposal_id)
                        return a.proposal_id < b.idea_id ? -1 : a.proposal_id > b.idea_id ? 1 : 0;

                    return a.idea_id < b.idea_id ? -1 : a.idea_id > b.idea_id ? 1 : 0
                });

                const output_ideas = {};
                let index = 1;
                const blacklist = this.GetBlackListId();
                for (let index_key of order_keys) {
                    index_key = Number(index_key);

                    if (!(blacklist.includes(index_key) || blacklist.includes(ideas[index_key].proposal_id)))
                        output_ideas[index++] = ideas[index_key]
                }

                console.log("output_ideas");
                console.log(output_ideas);

                let output_withdrawals = {};
                //this.props.contract.get_withdrawals_by_user({account_id: "zavodil.testnet"}).then((withdrawals) => {
                this.props.contract.get_all_withdrawals().then((withdrawals) => {
                    console.log("withdrawals");
                    console.log(withdrawals);
                    for (let index in withdrawals) {
                        const withdrawal = withdrawals[index];
                        withdrawal.total = this.formatNearAmount(withdrawal.amount_paid + withdrawal.amount_remaining) || 0;
                        withdrawal.amount_paid = this.formatNearAmount(withdrawal.amount_paid) || 0;
                        withdrawal.amount_remaining = this.formatNearAmount(withdrawal.amount_remaining) || 0;

                        if (withdrawal.owner_account_id === this.GetConnectedAccountId()) {
                            this.setState({
                                current_user_remaining_withdrawal: withdrawal.amount_remaining,
                                current_user_amount_paid: withdrawal.amount_paid,
                            });
                        }

                    }

                    const output_withdrawals_keys = Object.keys(withdrawals).sort(function (key1, key2) {
                        const a = withdrawals[key2];
                        const b = withdrawals[key1];
                        return Number(a.total) < Number(b.total) ? -1 : Number(a.total) > Number(b.total) ? 1 : 0
                    });

                    let index = 1;
                    for (let index_key of output_withdrawals_keys) {
                        output_withdrawals[index++] = withdrawals[index_key];
                        if (index > 10)
                            break;
                    }


                    let output_user_deposits = {};
                    this.props.contract.get_all_user_deposits().then((user_deposits) => {
                        console.log("get_all_user_deposits");
                        console.log(user_deposits);
                        for (let user_account_id in user_deposits) {
                            let user_total_deposit = 0;
                            for(let deposit of user_deposits[user_account_id]){
                                user_total_deposit += deposit.amount;
                            }
                            user_deposits[user_account_id].amount = this.formatNearAmount(user_total_deposit) || 0;
                            user_deposits[user_account_id].account_id = user_account_id;
                        }

                        const output_user_deposits_keys = Object.keys(user_deposits).sort(function (key1, key2) {
                            const a = user_deposits[key2];
                            const b = user_deposits[key1];
                            return Number(a.amount) < Number(b.amount) ? -1 : Number(a.amount) > Number(b.amount) ? 1 : 0
                        });

                        let index = 1;
                        for (let index_key of output_user_deposits_keys) {
                            output_user_deposits[index++] = user_deposits[index_key];
                            if (index > 10)
                                break;
                        }


                        this.setState({
                            ...this.state,
                            ideas: Object.values(output_ideas),
                            withdrawals: Object.values(output_withdrawals),
                            user_deposits: Object.values(output_user_deposits),
                        });
                    });
                });
            });
        } catch (err) {
            console.log(err);
        }
    }

    withdraw = async (withdraw_amount) => {
        if (!this.props.wallet.isSignedIn()) {
            window.alert("You need to sign in to vote!");
            return;
        }
        try {
            await this.props.contract.withdraw(
                {
                    amount: new BN((parseFloat(withdraw_amount) * 100000) + "0000000000000000000").toString()
                }
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


    upvoteIdea = async ({idea_id}) => {
        if (!this.props.wallet.isSignedIn()) {
            window.alert("You need to sign in to vote!");
            return;
        }
        try {
            await this.props.contract.upvote_idea(
                {
                    idea_id,
                },
                null,
                MIN_DEPOSIT_AMOUNT
            );
        } catch (err) {
            console.error(err);
        }
    };

    signIn = async () => {
        await this.props.wallet.requestSignIn(window.nearConfig.contractName, APP_TITLE);
    };

    signOut = async () => {
        this.props.wallet.signOut();
        setTimeout(window.location.replace(window.location.origin + APP_PATH), 500);
    };


    render() {

        const redirectIfNotSignedIn = (child) =>
            this.props.wallet.isSignedIn() ? child : <Redirect to={"/profile"}/>;

        const RenderIdeas = ({ideas}) => {
            if (ideas.length < 1) return null;

            const list = ideas.map((idea, i) => (
                <Idea toggleTipModal={this.toggleTipModal} submitMeme={this.SubmitMeme}
                      chooseWinnerMeme={this.chooseWinnerMeme} idea={idea} key={`${i}`}
                      currentAccountId={this.GetConnectedAccountId()}/>
            ));
            return <div className="row">
                <div className='flex flex-col pb-4 col-xs-6'>{list}</div>
            </div>
        };

        const RenderLeftSidebar = () => {
            return <div className="sidebar">
                <a className="active" href="/memeguild">Home</a>
                <a href="/create_meme">Add&nbsp;Meme</a>
                <a href="/create_idea">Add&nbsp;Idea</a>
                <a href="/withdrawals">Withdrawals</a>
            </div>;
        };

        const RenderRightSidebar = () => {
            return <div className="sidebar-right">
                <div className="container mx-auto mt-1 max-w-2xl">
                    <h2 className='py-4 justify-center'>Meme Authors LeaderBoard</h2>
                    <RenderWithdrawalsShort withdrawals={this.state.withdrawals}/>

                    <RenderCurrentUserRemainingWithdrawal
                        current_user_remaining_withdrawal={this.state.current_user_remaining_withdrawal}
                        current_user_amount_paid={this.state.current_user_amount_paid}/>

                    <RenderCurrentUserAmountPaid
                        current_user_amount_paid={this.state.current_user_amount_paid}/>

                    <h2 className='py-4 justify-center'>Deposits LeaderBoard</h2>
                    <RenderUserDeposits user_deposits={this.state.user_deposits}/>

                    <h2 className='py-4 justify-center'>Total Memes
                        Added: {this.state.ideas.length}</h2>

                </div>

            </div>;
        };

        const RenderMemeActionButtons = () => {
            return <div><Link
                onClick={() => {
                    if (!this.props.wallet.isSignedIn()) {
                        window.alert("You need to sign in to create a new idea!");
                    }
                }}
                to='/create_meme'
                className='mb-1 left near-btn justify-start mx-1'
            >
                Add&nbsp;Meme
            </Link>

                <Link
                    onClick={() => {
                        if (!this.props.wallet.isSignedIn()) {
                            window.alert("You need to sign in to create a new idea!");
                        }
                    }}
                    to='/create_idea'
                    className='mb-1 left near-btn justify-start mx-1'
                >
                    Add&nbsp;Meme&nbsp;Request
                </Link></div>;
        };

        const RenderIdeaPage = (props) => {
            return <div className="form-container">
                <RenderLeftSidebar/>
                <div className="content">
                    <div className='px-2 py-2 m-3 pb-2 text-center'>
                        <RenderMemeActionButtons/>
                        <div className="mt-1">
                            <RenderMemePage id={props.match.params.id}/>
                        </div>
                    </div>
                </div>
                <RenderRightSidebar/>
                <RenderTipModal/>
            </div>;
        };

        const RenderMemePage = (props) => {
            let id = parseInt(props.id);
            if (!id)
                return null;

            let thisMeme = this.state.ideas.filter(idea => idea.idea_id === id);
            if (!thisMeme.length)
                return null;

            thisMeme = thisMeme[0];
            const ideas = this.state.ideas.filter(idea => idea.idea_id === id || idea.proposal_id === id || idea.idea_id === thisMeme.proposal_id || (idea.proposal_id && idea.proposal_id === thisMeme.proposal_id));

            const order_keys = Object.keys(ideas).sort(function (key1, key2) {
                const a = ideas[key2];
                const b = ideas[key1];
                if (a.idea_id === id)
                    return 1;
                if (b.idea_id === id)
                    return -1;

                if (b.proposal_id && !a.proposal_id)
                    return a.idea_id < b.proposal_id ? -1 : a.idea_id > b.proposal_id ? 1 : 0;

                if (a.proposal_id && !b.proposal_id)
                    return a.proposal_id < b.idea_id ? -1 : a.proposal_id > b.idea_id ? 1 : 0;

                return a.idea_id < b.idea_id ? -1 : a.idea_id > b.idea_id ? 1 : 0
            });

            const output_ideas = [];
            let index = 1;
            for (let index_key of order_keys) {
                index_key = Number(index_key);
                output_ideas.push(ideas[index_key]);
            }

            /*
            const idea_output =
                <Idea toggleTipModal={this.toggleTipModal} submitMeme={this.SubmitMeme}
                      chooseWinnerMeme={this.chooseWinnerMeme} idea={idea} key={id}
                      currentAccountId={this.GetConnectedAccountId()}/>;

            return <div className="row">
                <div className='flex flex-col py-4 col-xs-6'>{idea_output}</div>
            </div>
             */

            let helmetProps = {};
            helmetProps.title = thisMeme.title;
            helmetProps.image = thisMeme.image;
            helmetProps.hashtag = thisMeme.description;
            helmetProps.location = {};
            helmetProps.location.pathname = "/meme/" + thisMeme.idea_id;
            return <div className="mt-1">
                <HelmetMetaData props={helmetProps}></HelmetMetaData>
                <RenderIdeas ideas={output_ideas}/>
            </div>;
        };

        const RenderWithdrawalsShort = ({withdrawals}) => {


            if (withdrawals.length < 1) return null;

            const list = <WithdrawalShort withdrawals={withdrawals}/>;

            /*const list = withdrawals.map((withdrawal, i) => (
                <Withdrawal withdrawal={withdrawal} key={`${i}`}/>
            ));*/
            return <div className='flex flex-col pb-4 col-xs-6'>{list}</div>;
        };

        const RenderWithdrawals = ({withdrawals}) => {


            if (withdrawals.length < 1) return null;

            const list = <Withdrawal withdrawals={withdrawals}/>;
            return <div className='flex flex-col py-4'>{list}</div>;
        };

        const RenderCurrentUserRemainingWithdrawal = ({current_user_remaining_withdrawal}) => {
            if (!current_user_remaining_withdrawal)
                return null;

            return <div className='flex flex-col py-4'>Available to withdraw: {current_user_remaining_withdrawal} NEAR
                <button className='w-7 p-2 near-btn mb-auto align-top max-w-sm' onClick={() => {
                    this.withdraw(current_user_remaining_withdrawal)
                }}>
                    Withdraw {current_user_remaining_withdrawal} NEAR
                </button>


            </div>;
        };

        const RenderCurrentUserAmountPaid = ({current_user_amount_paid}) => {
            if (!current_user_amount_paid)
                return null;

            return <div className='flex flex-col py-4'>Already claimed: {current_user_amount_paid} NEAR
            </div>;
        };

        const RenderUserDeposits = ({user_deposits}) => {
            if (user_deposits.length < 1) return null;

            const list = <UserDeposits user_deposits={user_deposits}/>;
            return <div className='flex flex-col pb-4'>{list}</div>;
        };


        const RenderTipModal = () => {
            return <Modal show={this.state.isTipModalOpen}
                          onClose={this.toggleTipModal}>
                <div> Tip Some NEAR to {this.state.TipModalOwnerAccountId} </div>
                <div>
                    <input autoFocus={true} type="text"
                           onChange={(event) => {
                               this.tipAmount = Number(event.target.value.replace(/[^0-9.]/g, ''))
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

        let helmetProps = {};
        helmetProps.title = "NEAR MEME POOL";
        helmetProps.image = "";
        helmetProps.hashtag = "";
        helmetProps.location = {};
        helmetProps.location.pathname = "/memeguild";
        return (
            <main>
                <HelmetMetaData props={helmetProps}></HelmetMetaData>
                <Router>
                    <Header signIn={this.signIn} signOut={this.signOut} wallet={this.props.wallet}/>

                    <Switch>


                        <Route path="/meme/:id" component={RenderIdeaPage}>

                        </Route>

                        <Route path='/profile'>
                            {
                                <Profile contract={this.props.contract} wallet={this.props.wallet}/>
                            }
                        </Route>

                        <Route path='/create_meme'>
                            {redirectIfNotSignedIn(
                                <CreateMeme contract={this.props.contract} wallet={this.props.wallet}/>
                            )}
                        </Route>

                        <Route path='/withdrawals'>
                            {
                                <RenderWithdrawals withdrawals={this.state.withdrawals}/>
                            }
                        </Route>

                        <Route path='/submit_meme'>
                            {redirectIfNotSignedIn(
                                <CreateMeme contract={this.props.contract} wallet={this.props.wallet} state={{
                                    idea_id: this.state.submitMemeIdea,
                                    price: this.state.submitMemePrice,
                                    title: this.state.submitMemeTitle
                                }}/>
                            )}
                        </Route>

                        <Route path='/create_idea'>
                            {redirectIfNotSignedIn(
                                <CreateIdea contract={this.props.contract} wallet={this.props.wallet}/>
                            )}
                        </Route>
                        <Route
                            path='/'
                            render={() => (
                                <div className="form-container">
                                    <RenderLeftSidebar/>
                                    <div className="content">
                                        <div className='px-2 py-2 m-3 pb-2 text-center'>
                                            <RenderMemeActionButtons/>
                                            <div className="mt-1">
                                                <RenderIdeas ideas={this.state.ideas}/>
                                            </div>
                                        </div>
                                    </div>
                                    <RenderRightSidebar/>
                                    <RenderTipModal/>
                                </div>
                            )}
                        />


                    </Switch>
                </Router>
            </main>
        );

    }
}

export default App;
