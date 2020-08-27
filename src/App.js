import React, {Component} from "react";
import Header from "./components/Header";
import {APP_TITLE, MIN_DEPOSIT_AMOUNT, APP_PATH} from "./constants";
import {BrowserRouter as Router, Switch, Route, Redirect, Link} from "react-router-dom";
import CreateMeme from "./components/CreateMeme.js";
import Idea from "./components/Idea";
import "regenerator-runtime/runtime";
import "./css/index.css";
import "./index.css";

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ideas: [],
        };
    }

    componentDidMount() {
        try {
            this.props.contract.get_all_ideas().then((ideas) => {
                for(let index in ideas) {
                    const idea = ideas[index];
                    idea.price = idea.price.toLocaleString()
                    idea.total_tips = idea.total_tips.toLocaleString().substr(0, idea.total_tips.toLocaleString().length - ",000,000,000,000,000,000,000,000".length);
                }

                this.setState({
                    ideas: Object.values(ideas),
                });
            });
        } catch (err) {
            console.err(err);
        }
    }

    tipMeme = async ({idea_id}, deposit) => {
        const price_near = deposit ? deposit  + "000000000000000000000000" : MIN_DEPOSIT_AMOUNT;
        if (!this.props.wallet.isSignedIn()) {
            window.alert("You need to sign in to vote!");
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

        const RenderIdeas = ({ideas}) => {
            if (ideas.length < 1) return null;

            const list = ideas.map((idea, i) => (
                <Idea tipMeme={this.tipMeme} idea={idea} key={`${i}`}/>
            ));
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
