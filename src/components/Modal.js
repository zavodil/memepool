import React from 'react';
import PropTypes from 'prop-types';

class Modal extends React.Component {
    render() {
        // Render nothing if the "show" prop is false
        if(!this.props.show) {
            return null;
        }

        return (
            <div className="backdrop" >
                <div className="modal">
                    {this.props.children}

                    <div className="footer">
                        <button className="close" onClick={this.props.onClose}>
                            X
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

Modal.propTypes = {
    onClose: PropTypes.func.isRequired,
    show: PropTypes.bool,
    children: PropTypes.node
};

export default Modal;