import React from "react";
import {Row, Col, Form, Button, Alert} from "react-bootstrap";
import {APP_PATH} from "../constants";
import {Link, Redirect} from "react-router-dom";

class CreateMeme extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            title: "",
            link: "",
            description: "",
            image: "",
            price: 0,
            toHome: false,
            proposal_id: 0,
            proposal_title: "",
            valid: true
        };
    }

    updateTitle(val) {
        this.setState({
            ...this.state,
            title: val,
        });
    }

    updateDescription(val) {
        this.setState({
            ...this.state,
            description: val,
        });
    }

    updateImage(val) {
        const valid = (val.match(/\.(jpeg|jpg|gif|png)$/) != null);
        this.setState({
            ...this.state,
            image: val,
            valid_image: valid,
        });
    }

    updateLink(val) {
        this.setState({
            ...this.state,
            link: val,
        });
    }

    async createMeme() {
        if (this.state.title.length === 0 || this.state.image.length === 0 || !this.state.valid_image)
            return null;

        this.setState({
            toHome: true,
        });

        try {
            await this.props.contract.create_meme({
                title: this.state.title,
                description: this.state.description,
                image: this.state.image,
                proposal_id: this.state.proposal_id,
                link: this.state.link || "",
            }).then(()=>{
                window.location.reload(false);
            });

            /* await this.props.contract.tip_meme({
                 idea_id: idea.idea_id,
                 price_near: parseFloat(this.state.price)
             });*/

        } catch (err) {
            console.error(err);
        }
    }

    componentDidMount() {
        if (this.props.hasOwnProperty("state")) {
            this.setState({
                proposal_id: this.props.state.idea_id,
                proposal_title: this.props.state.title
            });
        }
    }

    render() {
        if (this.state.toHome) {
            return <Redirect to={APP_PATH}/>;
        }

        const proposalTitle = (this.state.proposal_title) ?
            <h4 className='justify-center'>Proposal: {this.state.proposal_title}</h4> : "";

        const preview = this.state.image ?
            (this.state.valid_image ? <img src={this.state.image} width={200}/> : <div>Invalid image link</div>) : "";

        return (
            <div className='form-container flex flex-col'>
                <div className='flex py-2 px-2 my-6'>
                    <div className='w-1/6 flex mb-auto align-top'>
                        <div className='near-btn'>
                            <Link to={APP_PATH}>Back</Link>
                        </div>
                    </div>

                    <div className='w-4/6 px-10 bg-gray-200 pb-3'>
                        <div className='w-full'>
                            <h2 className='header justify-center'>Create a new meme</h2>
                            {proposalTitle}
                        </div>
                        <div className='block'>
                            <div className='justify-center inline-block'>
                                <Form
                                    className='justify-center'
                                    noValidate
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        this.createMeme();
                                    }}
                                >
                                    <Row className='my-5'>
                                        <Col className='my-5'>
                                            <Form.Control
                                                onChange={(e) => {
                                                    this.updateTitle(e.target.value);
                                                }}
                                                type='text'
                                                placeholder='Title'
                                            />
                                        </Col>
                                        <Col className='my-5'>
                                            <Form.Control
                                                onChange={(e) => {
                                                    this.updateImage(e.target.value);
                                                }}
                                                type='text'
                                                placeholder='Image url'
                                            />
                                        </Col>
                                        <Col className='my-5'>
                                            <Form.Control
                                                onChange={(e) => {
                                                    this.updateLink(e.target.value);
                                                }}
                                                type='text'
                                                placeholder='Source Link with description'
                                            />
                                        </Col>
                                        <Col className='my-5'>
                                            <Form.Control
                                                onChange={(e) => {
                                                    this.updateDescription(e.target.value);
                                                }}
                                                type='text'
                                                placeholder='Tags'
                                            />
                                        </Col>
                                        <Col className='my-5'>
                                            <Button className='near-btn' variant='primary' type='submit'>
                                                Create
                                            </Button>
                                        </Col>
                                    </Row>
                                </Form>
                            </div>
                            <div className='justify-center inline-block pl-1 align-top'>
                                <div className='create-meme-preview my-2'>
                                    {preview}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='w-1/6 flex'>
                    </div>

                </div>
            </div>
        );
    }
}

export default CreateMeme;
