import { Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import errorStyle from '../styles/errorStyle';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

class Error extends Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    render() {
        return (
            <Typography
                align="center"
                color="error"
                className={this.props.classes.error_msg}
            >
                {this.props.errorMessage}
            </Typography>
        );
    }
}

Error.propTypes = {
    classes: PropTypes.object.isRequired,
    errorMessage: PropTypes.string,
};

Error.defaultProps = {};

export default withStyles(errorStyle)(Error);
