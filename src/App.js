import React, { Component } from 'react';
import { Route, Switch, Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import { ToastContainer } from 'react-toastify';
// Material-UI
import { createMuiTheme } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';
import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import IconButton from '@material-ui/core/IconButton';
import Toolbar from '@material-ui/core/Toolbar';
import logoImg from '../src/images/logo.png';
import GeneralMills from '../src/images/GeneralMills.png';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';
import 'typeface-roboto';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import UploadCSV from './components/UploadCSV';
import BackIcon from '@material-ui/icons/ArrowBackRounded';
import Spinner from 'react-spinkit';
// theming
const theme = createMuiTheme({
  palette: {
    background: {
      default: '#fff',
    },
    primary: {
      main: '#0d6298',
    },

    secondary: {
      main: '#4282AA',
    },
    tonalOffset: 0.1,
  },
  typography: {
    fontFamily: [
      'montserrat',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
  },
});

// Styling
const styles = theme => ({
  root: {
    flexGrow: 1
  },
  flex: {
    flexGrow: 1,
    textAlign: 'right'
  },
  appBar: {
    backgroundColor: '#fff',
    boxShadow: '0px 0px 8px 8px rgba(0, 0, 0, 0.03)',

  },
  widget: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    padding: theme.spacing(4)
  },
  logo: {
    height: 72,
  },
  anchor: {
    textDecoration: 'none',
  },
  back_btn: {
    fontWeight: 700,
    fontSize: 16,
    textTransform: 'capitalize',
  },
});

class App extends Component {
  constructor(props) {
    super(props);

    this.showLoader = this.showLoader.bind(this);

    this.state = {
      isLoading: false,
      isLogin: false
    };
  }

  logout = () => {
    Cookies.remove('skillnetUsername');
    this.setState({ isLogin: false })
  }

  /**
   * Change the isLoading state of the Dashboard page.
   * @param  {[Bool]} value [true/false to hide and show loaders.]
   */
  showLoader(value) {
    this.setState({ isLoading: value });
  }

  getLoginIcon = () => {
    const { classes } = this.props;
    let link = (<Link className={classes.anchor} to="/login">
      <IconButton size="medium" color="primary">
        <CloudUploadIcon fontSize="large" />
      </IconButton>
    </Link>);
    if (Cookies.get('skillnetUsername')) {
      link = <Link className={classes.anchor} to="/">
        <Button onClick={this.logout} className={classes.back_btn} startIcon={<BackIcon />}>
          Dashboard
        </Button>
      </Link>
    }

    return link;
  }

  render() {
    const { classes } = this.props;
    let loaderContainer = '';

    if (this.state.isLoading) {
      loaderContainer= <div className="overlay">
          <Spinner name='chasing-dots' className="spinner"
            fadeIn="none"
            color="rgb(59, 172, 247)" />
        </div>
    }

    return (
      <ThemeProvider theme={theme}>
        {loaderContainer}
        <CssBaseline />
        <ToastContainer />
        <div className={classes.root}>
          <AppBar position="static" className={classes.appBar}>
            <Toolbar>
              <img src={logoImg} alt="SKILLNET" className={classes.logo} />
              <img src={GeneralMills} style={{marginTop:'10px'}} alt="GeneralMills" className={classes.logo} />
              <div color="inherit" className={classes.flex} />
              a{this.getLoginIcon()}
            </Toolbar>
          </AppBar>
          <Grid container>
            <Grid item xs={12}>
              <Grid container justify="space-around" spacing={Number('0')}>
                <Switch>
                  <Route
                    path="/login"
                    render={props => (<Login showLoader={this.showLoader} {...props} />)}
                  />
                  <Route
                    path="/upload-csv"
                    render={props => (<UploadCSV showLoader={this.showLoader} {...props} />)}
                  />
                  <Route
                    path="/"
                    render={props => (<Dashboard showLoader={this.showLoader} {...props} exact />)}
                  />
                </Switch>
              </Grid>
            </Grid>
          </Grid>
        </div>
      </ThemeProvider>
    );
  }
}

export default withStyles(styles)(App);
