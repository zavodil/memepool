import React from "react";
import {APP_PATH} from "../constants";
import {Link, Redirect} from "react-router-dom";
import {MDBRow, MDBCol, MDBBtn, MDBLink, MDBContainer} from "mdbreact";

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
      proposal_title: ""
    };
  }

  updateTitle(val) {
    this.setState({
      ...this.state,
      title: val,
    });
  }

  updatePrice(val) {
    this.setState({
      ...this.state,
      price: val,
    });
  }

  updateDescription(val) {
    this.setState({
      ...this.state,
      description: val,
    });
  }

  updateImage(val) {
    this.setState({
      ...this.state,
      image: val,
    });
  }

  updateLink(val) {
    this.setState({
      ...this.state,
      link: val,
    });
  }

  async createMeme() {
    //if (this.state.link.length == 0 || this.state.link.length == 0) return null;

    this.setState({
      toHome: true,
    });

    try {
      let idea = await this.props.contract.create_meme({
        title: this.state.title,
        description: this.state.description,
        image: this.state.image,
        proposal_id: this.state.proposal_id,
        link: this.state.link || "",
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

    return (
      <MDBContainer>
        <div className='flex flex-col'>
          <div className='flex py-2 px-2 my-6'>
            <div className='w-1/6 flex mb-auto align-top'>
              <MDBBtn color="red" to={APP_PATH}>Back</MDBBtn>
            </div>

            <div className=''>
              <div className='w-100'>
                <h2 className='header justify-center'>Create a new meme</h2>
                {proposalTitle}
              </div>
              <div className='justify-center'>
                <form
                  className='justify-center'
                  noValidate
                  onSubmit={(e) => {
                    e.preventDefault();
                    this.createMeme();
                  }}
                >
                  <MDBRow className='my-5'>
                    <MDBCol className='my-5'>
                      <form
                        onChange={(e) => {
                          this.updateTitle(e.target.value);
                        }}
                        type='text'
                        placeholder='Title'
                      />
                    </MDBCol>
                    <MDBCol className='my-5'>
                      <form
                        onChange={(e) => {
                          this.updateImage(e.target.value);
                        }}
                        type='text'
                        placeholder='Image url'
                      />
                    </MDBCol>
                    <MDBCol className='my-5'>
                      <form
                        onChange={(e) => {
                          this.updateLink(e.target.value);
                        }}
                        placeholder='Source Link with description'
                      />
                    </MDBCol>
                    <MDBCol className='my-5'>
                      <form
                        onChange={(e) => {
                          this.updateDescription(e.target.value);
                        }}
                        type='text'
                        placeholder='Tags'
                      />
                    </MDBCol>
                    <MDBCol className='my-5'>
                      <MDBBtn type='submit'>
                        Create
                      </MDBBtn>
                    </MDBCol>
                  </MDBRow>
                </form>
              </div>
            </div>

          </div>
        </div>
      </MDBContainer>
    );
  }
}

export default CreateMeme;
