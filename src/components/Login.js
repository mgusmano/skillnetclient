import React, { Component } from 'react';
import { Button, Grid, Paper, TextField, Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import Cookies from 'js-cookie';
import Error from '../common/Error';
import httpHelper from '../helper/httpHelper';
import Loader from '../common/Loader';
import LoginPageStyle from '../styles/loginStyle';
import logoImg from '../images/logo.png';
import PropTypes from 'prop-types';

class Login extends Component {
    constructor(props) {
        super(props);

        this.onChange = this.onChange.bind(this);
        this.submitButton = this.submitButton.bind(this);
        this.checkValue = this.checkValue.bind(this);
        this.resetErrorValue = this.resetErrorValue.bind(this);
        this.loginSuccess = this.loginSuccess.bind(this);
        this.requestFailure = this.requestFailure.bind(this);
        this.getError = this.getError.bind(this);

        this.state = {
            username: '',
            password: '',
            usernameIsInvalid: false,
            passwordIsInvalid: false,
            errorMessage: '',
        };
    }

    /**
     * On change event of the textfields
     * @param  {Object} target [Event target object]
     */
    onChange({ target }) {
        this.setState({ [target.name]: target.value });
    }

    /**
     * Shows/Hide Server Side error.
     * @return {Component} [Either Error Message or null.]
     */
    getError() {
        let errorComp = null;

        if (this.state.errorMessage) {
            errorComp = (<Error errorMessage={this.state.errorMessage} />);
        }

        return errorComp;
    }

    /**
     * On blur event function.
     * @param  {Object} target [Event target object]
     */
    checkValue({ target }) {
        if (target.value === '') {
            this.setState({ [`${target.name}IsInvalid`]: true });
        }
    }

    /**
     * On focus event handler of textboxes.
     * @param {Object} target [Event target object]
     */
    resetErrorValue({ target }) {
        this.setState({ [`${target.name}IsInvalid`]: false });
    }

    /**
     * Submit button click.
     */
    submitButton() {
        if (this.state.username && this.state.password) {
            const loginInfo = {
                url: '/api/user/login',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                data: {
                    username: this.state.username,
                    password: this.state.password,
                },
            };

            httpHelper(loginInfo, this.loginSuccess, this.requestFailure);
            this.props.showLoader(true);
        }

        if (!this.state.username) {
            this.setState({ usernameIsInvalid: true });
        }

        if (!this.state.password) {
            this.setState({ passwordIsInvalid: true });
        }
    }

    /**
     * HTTP callback success return from the backend.
     * @param  {Response} data [Response Data]
     */
    loginSuccess({ data }) {
        //Cookies.set('skillnetUserTokenData', data);
        if (data.code === 200) {
            Cookies.set('skillnetUsername', this.state.username);
            this.props.showLoader(false);
            this.setState({ errorMessage: "" });
            this.props.history.push('/upload-csv');
        } else {
            this.props.showLoader(false);
            this.props.history.push('/login');
            this.setState({ errorMessage: data.message });
        }
    }

    /**
     * Handles the HTTP request failure.
     * @param  {Object} response [With Error info.]
     */
    requestFailure({ response }) {
        this.props.showLoader(false);
        this.props.history.push('/login');
        this.setState({ errorMessage: `${response.code}: ${response.message}` });
    }

    render() {
        const { classes } = this.props;
        const error = this.getError();
        let loader = null;

        if (this.state.isLoading) {
            loader = (<Loader isLoading={this.state.isLoading} />);
        }

        return (
            <div>
                <Grid
                    container
                    className={classes.root}
                    alignItems="center"
                    direction="column"
                    justify="center"
                >
                    <img src={logoImg} alt="SKILLNET" className={classes.logo_image} />
                    <Grid item xs={12} md={6} lg={12} className={classes.mainContainer}>
                        <Grid>
                            <Paper className={classes.paper_box} elevation={0}>
                                <div className={classes.paper_form}>
                                    <Typography className={classes.headText}>Please Sign In</Typography>
                                        <TextField
                                            error={this.state.usernameIsInvalid}
                                            required
                                            id="username"
                                            label="Username"
                                            defaultValue={this.state.username}
                                            margin="normal"
                                            onChange={this.onChange}
                                            autoComplete="off"
                                            variant="outlined"
                                            name="username"
                                            color="secondary"
                                            onBlur={this.checkValue}
                                            onFocus={this.resetErrorValue}
                                            className={classes.text_field}
                                            InputProps={{
                                                classes: {
                                                    underline: classes.cssUnderline,
                                                    root: classes.placeHolder,
                                                    input: classes.textValue,
                                                },
                                            }}
                                            InputLabelProps={{
                                                className: classes.textLabel,
                                            }}
                                        />
                                        <TextField
                                            error={this.state.passwordIsInvalid}
                                            required
                                            id="password"
                                            type="password"
                                            label="Password"
                                            defaultValue={this.state.password}
                                            margin="normal"
                                            onChange={this.onChange}
                                            autoComplete="off"
                                            name="password"
                                            variant="outlined"
                                            color="secondary"
                                            onBlur={this.checkValue}
                                            onFocus={this.resetErrorValue}
                                            className={classes.text_field}
                                            InputProps={{
                                                classes: {
                                                    underline: classes.cssUnderline,
                                                    root: classes.placeHolder,
                                                    input: classes.textValue,
                                                },
                                            }}
                                            InputLabelProps={{
                                                underline: classes.cssUnderline,
                                                className: classes.textLabel,
                                            }}
                                        />
                                    {error}
                                    <center className={classes.button_div}>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            type="button"
                                            onClick={this.submitButton}
                                            className={classes.login_btn}
                                        >
                                            Sign-In
                                        </Button>
                                    </center>
                                </div>
                            </Paper>
                        </Grid>
                    </Grid>
                </Grid>
                {loader}
            </div>
        );
    }
}

Login.propTypes = {
    showLoader: PropTypes.func,
    classes: PropTypes.object.isRequired,
    history: PropTypes.object,
};

Login.defaultProps = {};

export default withStyles(LoginPageStyle)(Login);
