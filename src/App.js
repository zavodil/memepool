import React, {Component} from "react";
import Header from "./components/Header";
import {APP_TITLE, MIN_DEPOSIT_AMOUNT, APP_PATH} from "./constants";
import {BrowserRouter as Router, Switch, Route, Redirect, Link} from "react-router-dom";
import CreateMeme from "./components/CreateMeme.js";
import Idea from "./components/Idea";
import Withdrawal from "./components/Withdrawal";
import UserDeposits from "./components/UserDeposits";
import "regenerator-runtime/runtime";
import "./css/index.css";
import "./index.css";

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ideas: [],
            withdrawals: [],
            user_deposits: [],
            current_user_remaining_withdrawal: 0
        };
    }

    formatNearAmount(amount){
        return amount.toLocaleString().substr(0, amount.toLocaleString().length - ",000,000,000,000,000,000,000,000".length);
    }

    GetConnectedAccountId(){
        return this.props.wallet._connectedAccount.accountId;
    }

    componentDidMount() {
        try {
            this.props.contract.get_all_ideas().then((ideas) => {
                for(let index in ideas) {
                    const idea = ideas[index];
                    idea.price = idea.price.toLocaleString();
                    idea.total_tips = this.formatNearAmount(idea.total_tips);
                }

                this.setState({
                    ideas: Object.values(ideas),
                });

                //this.props.contract.get_withdrawals_by_user({account_id: "zavodil.testnet"}).then((withdrawals) => {
                this.props.contract.get_all_withdrawals().then((withdrawals) => {
                    for(let index in withdrawals) {
                        const withdrawal = withdrawals[index];
                        withdrawal.total = this.formatNearAmount(withdrawal.amount_paid + withdrawal.amount_remaining)  || 0;
                        withdrawal.amount_paid = this.formatNearAmount(withdrawal.amount_paid) || 0;
                        withdrawal.amount_remaining = this.formatNearAmount(withdrawal.amount_remaining) || 0;

                        if(withdrawal.owner_account_id === this.GetConnectedAccountId()){
                            this.setState({
                                current_user_remaining_withdrawal: withdrawal.amount_remaining,
                            });
                        }
                    }

                    this.setState({
                        withdrawals: Object.values(withdrawals),
                    });
                });

                this.props.contract.get_all_user_deposits().then((user_deposits) => {
                    for(let index in user_deposits) {
                        const user_deposit = user_deposits[index];
                        user_deposit.amount = this.formatNearAmount(user_deposit.amount) || 0;
                    }

                    this.setState({
                        user_deposits: Object.values(user_deposits),
                    });
                });
            });





        } catch (err) {
            console.err(err);
        }
    }

    withdraw = async (withdraw_amount) => {
        const withdraw_amount_near = parseInt(withdraw_amount) ; // + "000000000000000000000000";
        if (!this.props.wallet.isSignedIn()) {
            window.alert("You need to sign in to vote!");
            return;
        }
        try {
            await this.props.contract.withdraw(
                {
                    amount: withdraw_amount_near
                }
            );
        } catch (err) {
            console.error(err);
        }
    };

    tipMeme = async ({idea_id}, deposit, owner_account_id) => {
        const price_near = deposit ? deposit  + "000000000000000000000000" : MIN_DEPOSIT_AMOUNT;
        if (!this.props.wallet.isSignedIn()) {
            window.alert("You need to sign in to vote!");
            return;
        }
        else if(owner_account_id === this.GetConnectedAccountId()){
            window.alert("You can't tip your own to meme");
            return;
        }
        try {
            await this.props.contract.tip_meme(
                {
                    idea_id,
                    price_near
                },
                null,
                price_near
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
            this.props.wallet.isSignedIn() ? child : <Redirect to={APP_PATH}/>;

        console.log(this.props.wallet);

        const RenderIdeas = ({ideas}) => {
            if (ideas.length < 1) return null;

            const list = ideas.map((idea, i) => (
                <Idea tipMeme={this.tipMeme} idea={idea} key={`${i}`}/>
            ));
            return <div className='flex flex-col py-4'>{list}</div>;
        };

        const RenderWithdrawals = ({withdrawals}) => {


            if (withdrawals.length < 1) return null;

            const list = <Withdrawal withdrawals={withdrawals} />;

            /*const list = withdrawals.map((withdrawal, i) => (
                <Withdrawal withdrawal={withdrawal} key={`${i}`}/>
            ));*/
            return <div className='flex flex-col py-4'>{list}</div>;
        };

        const RenderCurrentUserRemainingWithdrawal = ({current_user_remaining_withdrawal}) => {
            if(!current_user_remaining_withdrawal)
                return null;

            return <div className='flex flex-col py-4'>Available to withdraw: {current_user_remaining_withdrawal} NEAR
                <button className='w-7 p-2 near-btn mb-auto align-top max-w-sm' onClick={() => {this.withdraw(current_user_remaining_withdrawal)}}>
                    Withdraw {current_user_remaining_withdrawal} NEAR
                </button>
            </div>;
        };

        const RenderUserDeposits = ({user_deposits}) => {
            if (user_deposits.length < 1) return null;

            const list = <UserDeposits user_deposits={user_deposits} />;
            return <div className='flex flex-col py-4'>{list}</div>;
        };


        return (
            <Router>
                <Header signIn={this.signIn} signOut={this.signOut} wallet={this.props.wallet}/>

                <Switch>
                    <Route path='/create_meme'>
                        {redirectIfNotSignedIn(
                            <CreateMeme contract={this.props.contract} wallet={this.props.wallet}/>
                        )}
                    </Route>
                    <Route
                        path='/'
                        render={() => (
                            <div className='px-2 py-2 m-2'>
                                <Link
                                    onClick={() => {
                                        if (!this.props.wallet.isSignedIn()) {
                                            window.alert("You need to sign in to create a new idea!");
                                        }
                                    }}
                                    to='/create_meme'
                                    className='w-200 left near-btn justify-start'
                                >
                                    Add Meme
                                </Link>

                                <RenderIdeas ideas={this.state.ideas}/>

                                <h2 className='py-4 justify-center'>Meme Authors LeaderBoard</h2>
                                <RenderWithdrawals withdrawals={this.state.withdrawals}/>

                                <RenderCurrentUserRemainingWithdrawal current_user_remaining_withdrawal={this.state.current_user_remaining_withdrawal}/>

                                <h2 className='py-4 justify-center'>Deposits LeaderBoard</h2>
                                <RenderUserDeposits user_deposits={this.state.user_deposits}/>

                                <h2 className='py-4 justify-center'>Total: {this.state.ideas.length}</h2>
                            </div>
                        )}
                    />
                </Switch>
            </Router>
        );
    }
}

export default App;
