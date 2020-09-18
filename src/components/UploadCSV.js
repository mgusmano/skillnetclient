import { checkExcelFile, getCurrentQuarter } from '../helper/commonHelper.jsx';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import UploadImg from '..//images/FileUpload.svg';
import Dropzone from 'react-dropzone';
import Grid from '@material-ui/core/Grid';
import httpHelper from '../helper/httpHelper';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Select from 'react-select';
import Typography from '@material-ui/core/Typography';
import UploadCSVStyle from '../styles/uploadCSV';
import 'react-select/dist/react-select.css';

class UploadCSV extends Component {
    constructor(props) {
        super(props);

        this.changeSelectedQuarter = this.changeSelectedQuarter.bind(this);
        this.requestFailure = this.requestFailure.bind(this);
        this.handleDrop = this.handleDrop.bind(this);
        this.uploadCSV = this.uploadCSV.bind(this);
        this.uploadSuccessful = this.uploadSuccessful.bind(this);
        this.showError = this.showError.bind(this);

        const currentYear = new Date().getFullYear();
        const quarter = getCurrentQuarter();
        this.state = {
            selectedYear: { label: currentYear, value: currentYear },
            selectedFile: null,
            selectedFileName: '',
            error: {
                status: false,
                message: ''
            },
            selectedQuarter: {label: quarter, value: quarter}
        };
    }

    componentDidMount() {
        this.props.showLoader();
    }

    /**
    * Work with the change of SELECT of a Quarter.
    * @param {Object} option [Selected Option]
    */
    changeSelectedQuarter(option) {
        this.setState({ selectedQuarter: option });
    }

    /**
    * Handle Drop event of React Dropzone.
    * @param {Array} accepted [Accepted Files]
    * @param {Array} rejected [Rejected Files]
    */
    handleDrop(accepted, rejected) {
        let error = {};
        let selectedFile = null;
        let selectedFileName = '';

        if (rejected.length > 0) {
            error = {
                status: true,
                message: 'Uploaded file is over 10 MB and is therefore rejected.'
            };
        } else if (accepted.length > 0) {
            const isExcel = checkExcelFile(accepted[0].type, accepted[0].name);
            if (isExcel) {
                [selectedFile] = accepted;
                selectedFileName = accepted[0].name;
            } else {
                error = {
                    status: true,
                    message: 'Unsupported File Format.'
                };
            }
        }

        this.setState({ selectedFile, error: error, selectedFileName });
    }

    /**
    * Upload Holiday function.
    * @return {[type]} [description]
    */
    uploadCSV() {
        if (this.state.selectedFile) {
            const data = new FormData();
            data.append('selectedYear', this.state.selectedYear.value);
            data.append('quarter', this.state.selectedQuarter.value);
            data.append('csvFile', this.state.selectedFile);

            const httpObj = {
                url: 'api/user/uploadCsvFile',
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                data,
            };

            httpHelper(httpObj, this.uploadSuccessful, this.requestFailure, false);
            this.props.showLoader(true);
            this.uploadSuccessful({
                data: {
                    responseCode: 2000
                },
            });
        } else {
            let error = {
                status: true,
                message: 'No file selected.'
            };
            this.setState({ error: error });
        }
    }

    /**
    * Add Basic Info failure callback.
    * @param {Object} error [Error Data.]
    * @return {[type]} [description]
    */
    requestFailure(e) {
        this.props.showLoader(false);
        let error = {
            status: true,
            message: e.message
        }
        this.setState({ error: error });
    }

    /**
    * When the file uploading is successful.
    * @return {Object} [HTTP Response]
    */
    uploadSuccessful({ data }) {
        if (data.responseCode === 2000) {
            let error = {
                status: false,
                message: 'File Uploaded Successfully!'
            }

            this.setState({
                selectedFile: null,
                selectedFileName: '',
                error: error
            });
            this.props.showLoader(false);
        } else {
            this.requestFailure(data);
        }
    }

    /**
    * Showcase or Hide Error Messages.
    */
    showError() {
        let error = null;
        const { classes } = this.props;
        const errorClass = this.state.error.status ? classes.errorMsg : classes.successMsg;
        if (this.state.error.message) {
            error = (
                <Grid container>
                    <Grid item sm={12} md={12} lg={12} className={classes.errDiv}>
                        <span className={errorClass}>{this.state.error.message}</span>
                    </Grid>
                </Grid>
            );
        }

        return error;
    }

    render() {
        const errorMessage = this.showError();
        const { classes } = this.props;

        return (
            <section>
                <Grid container>
                <Grid item sm={1} md={1} lg={1}/>
                <Grid item sm={11} md={11} lg={11}>
                <Grid container>
                    <Grid item sm={12} md={12} lg={12}>
                        <Typography className={classes.uploadTitle}>
                            Upload File
                        </Typography>
                    </Grid>
                    <Grid container className={classes.selctBoxDiv}>
                        <Grid item sm={2} md={2} lg={2}>
                            <Typography className={classes.slctBoxLabel}>
                                Year
                            </Typography>
                            <Select
                                name="form-field-name"
                                value={this.state.selectedYear}
                                className="search-select"
                                optionalClassName="form-select-option"
                                disabled={true}
                                clearable={false}
                            />
                        </Grid>
                        <Grid item sm={5} md={5} lg={5} />
                        <Grid item sm={2} md={2} lg={2}>
                            <Typography className={classes.slctBoxLabel}>
                                Quarter
                            </Typography>
                            <Select
                                name="form-field-name"
                                value={this.state.selectedQuarter}
                                onChange={this.changeSelectedQuarter}
                                className="search-select"
                                optionalClassName="form-select-option"
                                options={[
                                    {label: 1, value: 1},
                                    {label: 2, value: 2},
                                    {label: 3, value: 3},
                                    {label: 4, value: 4}
                                ]}
                                clearable={false}
                            />
                            <Grid item sm={4} md={4} lg={4} />
                        </Grid>
                    </Grid>
                    <Grid container>
                        <Grid item sm={9} md={9} lg={9} >
                            <Dropzone
                                className={classes.dropZone}
                                onDrop={this.handleDrop}
                                multiple={false}
                                maxSize={10000000}
                            >
                                <Grid container>
                                    <Grid item sm={12} md={12} lg={12} className={classes.dropZoneMsg}>
                                        <img
                                            className={classes.UpldImg}
                                            src={UploadImg}
                                            alt="Data upload"
                                        />
                                    </Grid>
                                    <Grid item sm={12} md={12} lg={12} className={classes.dropZoneMsg}>
                                        <Typography className={classes.drpznTxt}>
                                            Drop files here or Choose a file to upload.
                                        </Typography>
                                    </Grid>
                                    <Grid item sm={12} md={12} lg={12} className={classes.drpznTxtHelper}>
                                        Supported format xlsx
                                    </Grid>
                                    <Grid item sm={12} md={12} lg={12} className={classes.mdleAlign}>
                                        <Typography className={classes.fileName}>
                                            {this.state.selectedFileName}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Dropzone>
                            {errorMessage}
                        </Grid>
                        <Grid item sm={2} md={2} lg={2} />
                    </Grid>
                    
                    <Grid item sm={9} md={9} lg={9} className={classes.buttonDiv}>
                        <Button
                            variant="contained"
                            color="primary"
                            disableRipple
                            onClick={this.uploadCSV}
                            className={classes.uploadBtn}
                        >
                            Start Upload
                        </Button>
                    </Grid>
                </Grid>
                </Grid>
                </Grid>
            </section>
        );
    }
}

UploadCSV.propTypes = {
    classes: PropTypes.object,
    showLoader: PropTypes.func,
};

UploadCSV.defaultProps = {};

export default withStyles(UploadCSVStyle)(UploadCSV);