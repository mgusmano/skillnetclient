import { withStyles } from '@material-ui/core/styles';
import LoaderStyle from '../styles/loaderStyle';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import ReactLoaderSpinner from 'react-loader-spinner';

class Loader extends Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    render() {
        return (
            <div className="overlay">
                <div className={this.props.classes.loader_paper}>
                    <ReactLoaderSpinner type="ThreeDots" color="#9a9a9a" height={80} width={80} />
                </div>
            </div>
        );
    }
}

Loader.propTypes = {
    classes: PropTypes.object.isRequired,
};

Loader.defaultProps = {};

export default withStyles(LoaderStyle)(Loader);
