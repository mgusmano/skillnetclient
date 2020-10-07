import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import { Grid, Typography } from "@material-ui/core";
import { toast } from 'react-toastify';
import Select from "react-select";
import Button from "@material-ui/core/Button";
import PropTypes from "prop-types";
import UploadCSVStyle from "../styles/uploadCSV";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import "react-select/dist/react-select.css";
import httpHelper from "../helper/httpHelper";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Chart from "./Chart";
import { dynamicsort } from '../helper/commonHelper';
import Tooltip from '@material-ui/core/Tooltip';
import Info from '@material-ui/icons/InfoOutlined';
import Zoom from '@material-ui/core/Zoom';
import evaluateLocationGraph from '../helper/locationGraphHelper';
import evaluatePositionGraph from '../helper/positionGraphHelper';
import evaluateManagerGraph from '../helper/managerGraphHelper';
import evaluateIndividualGraph from '../helper/individualGraphHelper';
import Horizontal from '../layout/Horizontal'
import Vertical from '../layout/Vertical'
import Splitter from '../layout/Splitter'
import Separator from '../layout/Separator'


class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.userSkillData = [];
    this.state = {
      labelEBPC: 'Function', //'EB/PC',
      //labelSubFunction: 'SubFunction',
      labelPosition: 'Job Band', //'Position',
      //labelSegment: 'Segment',

      labelSegment: 'Function', //'Segment',
      labelLine: 'Capabilities Group', //'Line',
      labelCompetency: 'Capability', //'Competency',

      userData: [],
      clearAllFlag: false,
      userDataClone: [],
      skillData: [],
      skillDataClone: [],
      positionData: [],
      positionTargetData: [],
      filterObjClearAll: '',
      filterObj: {
        rating: 0,
        is_eb: "",
        geo_location: [],
        manager_name: [],
        position_id: [],
        is_core: "",
        segement: [],
        line: [],
        competency: [],
        isUser: "filters",
        isSkill: "filters",
        filterUser: {},
        filterSkill: {},
        skillIds: [],
        userIds: [],
        outputId: 1,
      },
      options: {
        positionOption: [],
        managerOption: [],
        locationOption: [],
        segementOption: [],
        lineOption: [],
        competencyOption: [],
        userOption: [],
        skillOption: [],
        filterUserOptions: [],
        filterUserOptionsClone: [],
        filterSkillOptions: [],
        sourceOption: [
          { label: "Self", value: 1 },
          { label: "Manager", value: 0 },
        ],
        coreOption: [
          { label: "Core", value: 1 },
          { label: "Segment", value: 0 },
        ],
        ebOption: [
          { label: "EB", value: 1 },
          { label: "PC", value: 0 },
        ],
        outputOption: [
          { label: "Individuals", value: 1 },
          { label: "Manager", value: 2 },
          { label: "Position", value: 3 },
          { label: "Location", value: 4 },
        ],
        themeOption: [
          { label: "fusion", value: "fusion" },
          { label: "gammel", value: "gammel" },
          { label: "candy", value: "candy" }
        ],
        userSkillAvgData: [],
        userSkillAvgTarget: [],
      },
      dataSource: null,
      theme: 'fusion',
      coreOptionData: [
        { label: "Core", value: 1 },
        { label: "Segment", value: 0 },
      ],
      ebOptionData: [
        { label: "EB", value: 1 },
        { label: "PC", value: 0 },
      ],
    };
  }

  componentDidMount() {

    this.setClearFilterObj();
    this.getAllUser();
    this.getAllSkill();
    this.getAllUserSkill();
    this.getAllPosition();
    this.getPositionTarget();


    // var me = this
    // setTimeout(function(){
    //   me.generateGraphData()
    // }, 1000);

  }

  doChart = () => {
    this.generateGraphData()
  }


  setClearFilterObj = () => {
    let { filterObjClearAll, filterObj } = this.state;
    filterObjClearAll = JSON.stringify(filterObj)
    this.setState({ filterObjClearAll })
  }

  /**
   * Request API to fetch User table data
   * @return {Object} [HTTP Response]
   */
  getAllUser = () => {
    const httpObj = {
      url: "api/user/getAllUser",
      method: "GET",
    };
    httpHelper(httpObj, this.setUserData, this.requestFailure, false);
    this.props.showLoader(true);
  };

  /**
   * Request API to fetch Skill table data
   * @return {Object} [HTTP Response]
   */
  getAllSkill = () => {
    const httpObj = {
      url: "api/user/getAllSkill",
      method: "GET",
    };
    httpHelper(httpObj, this.setSkillData, this.requestFailure, false);
    this.props.showLoader(true);
  };

  /**
   * Request API to fetch Position table data
   * @return {Object} [HTTP Response]
   */
  getAllPosition = () => {
    const httpObj = {
      url: "api/user/getAllPosition",
      method: "GET",
    };
    httpHelper(httpObj, this.setPositionData, this.requestFailure, false);
    this.props.showLoader(true);
  };

  /**
   * Request API to fetch Position_target table data
   * @return {Object} [HTTP Response]
   */
  getPositionTarget = () => {
    const httpObj = {
      url: "api/user/getPositionTarget",
      method: "GET",
    };
    httpHelper(httpObj, this.setPositionTargetData, this.requestFailure, false);
    this.props.showLoader(true);
  };

  /**
   * This function set the Users table data (recieved from API response) in state
   */
  setUserData = ({ data }) => {
    //console.log(JSON.stringify(data))
    //debugger
    const { options } = this.state;
    if (data && data.length > 0) {
      data.forEach((d) => {
        options.userOption.push({
          label: d.user_name,
          value: d.user_id,
        });

        options.filterUserOptions.push({
          label: d.user_name,
          value: d.user_id,
        });
      });
      this.setState(
        {
          userDataClone: [...data],
          userData: [...data],
          options,
        },
        () => {
          this.setUniqueOptions();
        }
      )
    }
    else {
      let errorMessage = (data && data.sqlMessage) ? data.sqlMessage : 'User data not found!';
      toast.error(errorMessage);
    }
  };

  /**
   * This function set the Skill table data (recieved from API response) in state
   */
  setSkillData = ({ data }) => {
    //getAllSkill.json
    //console.log(JSON.stringify(data))
    //debugger
    const { options } = this.state;
    if (data && data.length > 0) {
      data.forEach((d) => {
        let obj = { value: d.skill_id, label: d.skill_name };
        options.skillOption.push(obj);
        options.filterSkillOptions.push(obj);
      });
      this.setState(
        {
          options,
          skillData: [...data],
          skillDataClone: [...data],
        },
        () => {
          this.setSkillFilterData();
        }
      )
    }
    else {
      let errorMessage = (data && data.sqlMessage) ? data.sqlMessage : 'Skill data not found!';
      toast.error(errorMessage);
    }
  };

  /**
   * This function set the Position data (recieved from API response) in state
   */
  setPositionData = ({ data }) => {
    //console.log(JSON.stringify(data))
    //debugger
    const { options } = this.state;
    options.positionOption = this.customizePositionData(data);
    this.setState({
      positionData: [...data],
      options,
    });
  };

  customizePositionData = (data) => {
    //console.log(JSON.stringify(data))
    //debugger
    let array = [];
    if (data.length > 0) {
      data.forEach((d) => {
        if (!array.some((el) => el.label === d.position_name)) {
          array.push({
            label: d.position_name,
            value: d.position_id,
          });
        }
      });
    }
    return array;
  };

  /**
   * This function set the Position target data (recieved from API response) in state.
   */
  setPositionTargetData = ({ data }) => {
    //console.log(JSON.stringify(data))
    //debugger
    this.setState({
      positionTargetData: [...data],
    });
  };

  /**
   * Add Basic Info failure callback.
   * @param {Object} error [Error Data.]
   * @return {[type]} [description]
   */
  requestFailure = (e) => {
    console.log(e)
    this.props.showLoader(false);
    let error = {
      status: false,
      message: e.message,
    };
    this.setState({ error: error });
  };

  getFilterDataByEB = (data, selectedEB) => {
    if (data && selectedEB) {
      let { value } = selectedEB;
      let filterByEBData = data.filter((d) => d.is_eb === value);
      return filterByEBData;
    }

    return data;
  };

  getFilterDataByCore = (data, selectedCore) => {
    if (data && selectedCore) {
      let { value } = selectedCore;
      let filterByEBData = data.filter((d) => d.is_core === value);
      return filterByEBData;
    }

    return data;
  };

  getFilterDataBySelect = (data, selected, property) => {
    if (data && selected.length > 0) {
      let filterData = data.filter((d) => {
        if (selected.some((s) => s.label === d[property])) {
          return d;
        }
      });
      return filterData;
    } else {
      return data;
    }
  };

  getFilterDataByPosition = (data, selected, property, isSelect = true) => {
    let filterData = [];
    let array = [];
    if (data && selected.length > 0) {
      filterData = data.filter((d) => {
        if (selected.some((s) => s.value === d[property])) {
          return d;
        }
      });
    } else {
      filterData = [...data];
    }

    if (isSelect) {
      filterData.forEach((user) => {
        array.push({ label: user.user_name, value: user.user_id });
      });
      return array;
    }

    return filterData;
  };

  getUniqueData = (data, property, id, parentProp1) => {
    let uniqueData = [];
    data.forEach((d) => {
      if (!uniqueData.some((el) => el.label === d[property])) {
        let obj = { label: d[property], value: d[id] }
        if (parentProp1) {
          obj[parentProp1] = d[parentProp1]
        }
        uniqueData.push(obj);
      }
    });
    return uniqueData;
  };

  getUniqueDataPosition = (data, property, positionData) => {
    let uniqueData = [];
    data.forEach((d) => {
      let obj = positionData.find(
        (position) => position.position_id === d.position_id
      );
      if (obj) {
        uniqueData.push({ label: obj.position_name, value: obj.position_id });
      }
    });
    let array = this.getUniqueData(uniqueData, "label", "value");
    return array;
  };

  getUniqueSkillData = (data, property) => {
    let uniqueData = [];
    data.forEach((d) => {
      if (!uniqueData.some((el) => el.label === d[property])) {
        let obj = { label: d[property], value: d[property] }
        uniqueData.push(obj);
      }
    });
    return uniqueData;
  };

  getUserDataArray = (userDataClone) => {
    const userArray = [];
    userDataClone.forEach((user) => {
      userArray.push({ label: user.user_name, value: user.user_id });
    });
    return userArray;
  }

  getFilterUserData = (seletedEB, selectedLoc, selectedM, selectedP, userData) => {
    let array = [];
    let data = [...userData];
    if (seletedEB) {
      data = userData.filter((user) => user.is_eb === seletedEB.value);
    } else if (selectedLoc.length > 0) {
      data = this.getFilterDataBySelect(userData, selectedLoc, "geo_location");
    } else if (selectedM.length > 0) {
      data = this.getFilterDataBySelect(userData, selectedM, "manager_name");
    } else if (selectedP.length > 0) {
      data = this.getFilterDataBySelect(userData, selectedP, "position_id");
    }
    array = this.getUniqueData(data, "user_name", "user_id");
    return array;
  };

  setUniqueOptions = () => {
    const { options, positionData, userDataClone, clearAllFlag } = this.state;
    if (userDataClone.length > 0) {
      let optionsClone = JSON.parse(JSON.stringify(options));
      optionsClone.locationOption = this.getUniqueData(userDataClone, "geo_location", "user_id");
      optionsClone.managerOption = this.getUniqueData(userDataClone, "manager_name", "user_id", "geo_location");
      optionsClone.positionOption = this.getUniqueDataPosition(userDataClone, "position_id", positionData);
      optionsClone.filterUserOptions = this.getUserDataArray(userDataClone);
      this.setState({ options: optionsClone }, () => {
        if (clearAllFlag) {
          this.setSkillFilterData();
        }
      });
    }
  }

  setSkillFilterData = () => {
    const { options, filterObj, skillData } = this.state;
    const {
      segementOption,
      lineOption,
      competencyOption,
      coreOption,
    } = options;

    let selectedCore = coreOption.find(
      (line) => line.value === filterObj.is_core
    );
    skillData.forEach((data) => {
      if (
        !segementOption.some((el) => el.label === data.segement) &&
        (selectedCore ? data.is_core === selectedCore.value : true)
      ) {
        segementOption.push({ label: data.segement, value: data.segement });
      }
    });
    let selectedSegment = segementOption.filter((line) => {
      return filterObj.segement.includes(line.value);
    });
    if (!selectedCore || selectedSegment) {
      skillData.forEach((data) => {
        let segment = selectedSegment.find((ss) => ss.value === data.segement);
        if (
          !lineOption.some((el) => el.value === data.line) &&
          (selectedSegment.length > 0 ? (segment ? true : false) : true)
        ) {
          lineOption.push({
            label: data.line,
            value: data.line,
            segement: segment ? segment.value : "",
          });
        }
      });
    }

    let selectedLine = lineOption.filter((line) => {
      return filterObj.line.includes(line.value);
    });
    if (
      (!selectedCore && !selectedSegment) ||
      selectedLine ||
      selectedSegment
    ) {
      skillData.forEach((data) => {
        let obj = this.getSelectedSegmentLine(
          selectedSegment,
          selectedLine,
          data
        );
        let { flag } = obj;
        if (
          !competencyOption.some((el) => el.value === data.competency) &&
          flag
        ) {
          competencyOption.push({
            label: data.competency,
            value: data.competency,
            line: data.line,
          });
        }
      });
    }
    let selectedCompetency = competencyOption.filter((competency) => {
      return filterObj.competency.includes(competency.value);
    });
    if (
      selectedLine.length > 0 ||
      selectedSegment.length > 0 ||
      selectedCompetency.length > 0
    ) {
      options.filterSkillOptions = [];
      skillData.forEach((skill) => {
        let competency = this.getSelectedSegmentLineSkill(
          selectedSegment,
          selectedLine,
          selectedCompetency,
          skill
        );
        if (competency) {
          let obj = { value: skill.skill_id, label: skill.skill_name };
          options.filterSkillOptions.push(obj);
        }
      });
    }
    this.setState({ options, clearAllFlag: false });
  };

  getSelectedSegmentLine = (selectedSegment, selectedLine, data) => {
    let line = [];
    let flag = false;
    if (selectedSegment.length > 0 && selectedLine.length === 0) {
      line = selectedSegment.find((sl) => sl.value === data.segement);
      flag = line ? true : false;
    } else if (selectedSegment.length === 0 && selectedLine.length > 0) {
      line = selectedLine.find((sl) => sl.value === data.line);
      flag = line ? true : false;
    } else if (selectedSegment.length > 0 && selectedLine.length > 0) {
      let filterSegment = [];
      let filterLine = [];
      filterSegment = selectedSegment.find((sl) => sl.value === data.segement);
      filterLine = selectedLine.find((sl) => sl.value === data.line);
      flag = filterSegment && filterLine ? true : false;
    } else if (selectedSegment.length === 0 && selectedLine.length === 0) {
      flag = true;
    }
    return { flag, line };
  };

  getSelectedSegmentLineSkill = (
    selectedSegment,
    selectedLine,
    selectedCompetency,
    skill
  ) => {
    let type = selectedSegment.length > 0 ? "segment" : "";
    type =
      selectedSegment.length === 0 && selectedLine.length > 0 ? "line" : type;
    type =
      selectedSegment.length > 0 && selectedLine.length > 0
        ? "segmentLine"
        : type;
    type = selectedCompetency.length > 0 ? "competency" : type;
    let competency = null;
    switch (type) {
      case "segment":
        competency = selectedSegment.find((sl) => sl.label === skill.segement);
        return competency;
      case "line":
        competency = selectedLine.find((sl) => sl.label === skill.line);
        return competency;
      case "segmentLine":
        let segment = selectedSegment.find((sl) => sl.label === skill.segement);
        if (segment) {
          competency = segment
            ? selectedLine.find(
              (sl) =>
                sl.label === skill.line && segment.label === skill.segement
            )
            : competency;
        }

        return competency;
      case "competency":
        competency = selectedCompetency.find(
          (sl) => sl.label === skill.competency
        );
        return competency;
      default:
        return competency;
    }
  };

  getSelectedParent = (
    selectedLocation,
    selectedManager,
    selectedPosition,
    user
  ) => {
    let type = selectedLocation.length > 0 ? "location" : "";
    type =
      selectedLocation.length === 0 && selectedManager.length > 0
        ? "manager"
        : type;
    type =
      selectedLocation.length > 0 && selectedManager.length > 0
        ? "locationManager"
        : type;
    type = selectedPosition.length > 0 ? "position" : type;
    let position = null;
    switch (type) {
      case "location":
        position = selectedLocation.find(
          (sl) => sl.label === user.geo_location
        );
        return position;
      case "manager":
        position = selectedManager.find((sl) => sl.label === user.manager_name);
        return position;
      case "locationManager":
        let location = selectedLocation.find(
          (sl) => sl.label === user.geo_location
        );
        if (location) {
          position = location
            ? selectedManager.find(
              (sl) =>
                sl.label === user.manager_name &&
                location.label === user.geo_location
            )
            : position;
        }

        return position;
      case "position":
        position = selectedPosition.find((sl) => sl.value === user.position_id);
        return position;
      default:
        return position;
    }
  };

  selectChangeHandler = (e, name) => {
    let { filterObj } = this.state;
    filterObj[name] = Array.isArray(e)
      ? e.map((data) => data.value)
      : e.value;

    this.setState({ filterObj });
  };

  skillMultiSelectChangeHandler = (selectedOption) => {

    let skillDataClone = JSON.parse(JSON.stringify(this.state.skillData));
    let filterObjClone = JSON.parse(JSON.stringify(this.state.filterObj));

    let result = [];
    let selectedOptionValArr = [];

    for (let index = 0; index < selectedOption.length; index++) {
      selectedOptionValArr.push(selectedOption[index].value)
    }
    filterObjClone.skillIds = selectedOptionValArr;

    for (let index = 0; index < skillDataClone.length; index++) {
      if (selectedOptionValArr.indexOf(skillDataClone[index].skill_id) > -1) {
        result.push(skillDataClone[index]);
      }
    }

    this.setState({ skillDataClone: result, filterObj: filterObjClone });
  }

  skillSelectChangeHandler = (selectedOption, fieldName) => {
    let filterObjClone = JSON.parse(JSON.stringify(this.state.filterObj));
    let skillDataClone = JSON.parse(JSON.stringify(this.state.skillDataClone));
    let skillData = JSON.parse(JSON.stringify(this.state.skillData));
    let isUpdateSkillClone = false;

    if (fieldName === 'is_core') {
      if (selectedOption) {
        skillDataClone = skillDataClone.filter(skill => skill.is_core === selectedOption.value);
        filterObjClone.is_core = selectedOption.value;
      } else {
        filterObjClone[fieldName] = '';
        isUpdateSkillClone = true
      }
    } else {
      if (selectedOption.length > filterObjClone[fieldName].length) {
        let selectedOptionValArr = filterObjClone[fieldName];

        if (selectedOption.length > 1) {
          let filteredSkillData = null;
          selectedOptionValArr.push(selectedOption[selectedOption.length - 1].value);
          filteredSkillData = skillData.filter(user => (user[fieldName] === selectedOption[selectedOption.length - 1].value));
          skillDataClone = skillDataClone.concat(filteredSkillData);
        } else {
          skillDataClone = skillDataClone.filter(skill => (skill[fieldName] === selectedOption[0].value));
          selectedOptionValArr.push(selectedOption[0].value);
        }
      } else {
        let selectedOptionValArr = [];

        for (let index = 0; index < selectedOption.length; index++) {
          selectedOptionValArr.push(selectedOption[index].value)
        }

        filterObjClone[fieldName] = selectedOptionValArr;
        isUpdateSkillClone = true;
      }
    }
    this.setState({ skillDataClone, filterObj: filterObjClone }, this.setSkillFilterDataUpdate.bind(this, fieldName, isUpdateSkillClone));
  }

  setSkillFilterDataUpdate = (selectionFilterName, isUpdateSkillClone = false) => {
    const { options, filterObj, skillDataClone, skillData } = this.state;
    const { segementOption, lineOption, competencyOption, coreOption } = options;
    let targetData = JSON.parse(JSON.stringify(skillDataClone));

    if (isUpdateSkillClone) {
      targetData = JSON.parse(JSON.stringify(skillData));
    }

    if (targetData.length > 0) {
      let selectedCore = coreOption.find((coreOption) => coreOption.value === filterObj.is_core);
      let selectedSegment = segementOption.filter((segmentOption) => filterObj.segement.includes(segmentOption.value));
      let selectedLine = lineOption.filter((lineOption) => filterObj.line.includes(lineOption.value));
      let selectedCompetency = competencyOption.filter((competencyOption) => filterObj.competency.includes(competencyOption.value));

      let filteredData = this.getFilterDataByCore(targetData, selectedCore);
      filteredData = this.getFilterDataBySelect(filteredData, selectedSegment, "segement"); //get filter data after location select
      filteredData = this.getFilterDataBySelect(filteredData, selectedLine, "line");//get filter data after manager select
      filteredData = this.getFilterDataBySelect(filteredData, selectedCompetency, "competency");//get filter data after position select

      if ((selectionFilterName !== 'segement' && filterObj.segement.length === 0) || (selectionFilterName === 'segement' && filterObj.segement.length === 0)) {
        options.segementOption = this.getUniqueSkillData(filteredData, "segement");
      }

      if ((selectionFilterName !== 'line' && filterObj.line.length === 0) || (selectionFilterName === 'line' && filterObj.line.length === 0)) {
        options.lineOption = this.getUniqueSkillData(filteredData, "line");
      }

      if ((selectionFilterName !== 'competency' && filterObj.competency.length === 0) || (selectionFilterName === 'competency' && filterObj.competency.length === 0)) {
        options.competencyOption = this.getUniqueSkillData(filteredData, "competency")
      }

      options.coreOption = this.getCoreOptions(filteredData);
      options.filterSkillOptions = this.getFilteredSkillOptions(filteredData);

      if (isUpdateSkillClone) {
        this.setState({ options, skillDataClone: filteredData });
      } else {
        this.setState({ options });
      }
    }
  }

  userMultiSelectChangeHandler = (selectedOption) => {
    let userDataClone = JSON.parse(JSON.stringify(this.state.userData));
    let filterObjClone = JSON.parse(JSON.stringify(this.state.filterObj));

    let result = [];
    let selectedOptionValArr = [];

    for (let index = 0; index < selectedOption.length; index++) {
      selectedOptionValArr.push(selectedOption[index].value)
    }
    filterObjClone.userIds = selectedOptionValArr;

    for (let index = 0; index < userDataClone.length; index++) {
      if (selectedOptionValArr.indexOf(userDataClone[index].user_id) > -1) {
        result.push(userDataClone[index]);
      }
    }

    this.setState({ userDataClone: result, filterObj: filterObjClone });
  }

  userSelectChangeHandler = (selectedOption, fieldName) => {
    let filterObjClone = JSON.parse(JSON.stringify(this.state.filterObj));
    let userDataClone = JSON.parse(JSON.stringify(this.state.userDataClone));
    let userData = JSON.parse(JSON.stringify(this.state.userData));
    let isUpdateUserClone = false;

    if (fieldName === 'is_eb') {
      if (selectedOption) {
        let newUserData = [...userDataClone];
        if (filterObjClone.manager_name.length === 0 && filterObjClone.position_id.length === 0 && filterObjClone.geo_location.length === 0) {
          newUserData = [...userData];
        }
        userDataClone = newUserData.filter(user => user.is_eb === selectedOption.value);
        filterObjClone.is_eb = selectedOption.value;
      } else {
        filterObjClone[fieldName] = '';
        isUpdateUserClone = true;
      }
    } else {
      if (selectedOption.length > filterObjClone[fieldName].length) {
        // in case of addition.
        let selectedOptionValArr = filterObjClone[fieldName];

        if (selectedOption.length > 1) {
          let filteredUserData = null;
          selectedOptionValArr.push(selectedOption[selectedOption.length - 1].value);
          if (fieldName !== 'position_id') {
            filteredUserData = userData.filter(user => (user[fieldName] === selectedOption[selectedOption.length - 1].label));
          } else {
            filteredUserData = userData.filter(user => (user[fieldName] === selectedOption[selectedOption.length - 1].value));
          }
          userDataClone = userDataClone.concat(filteredUserData);
        } else {
          if (fieldName !== 'position_id') {
            userDataClone = userDataClone.filter(user => (user[fieldName] === selectedOption[0].label));
            selectedOptionValArr.push(selectedOption[0].value);
          } else {
            userDataClone = userDataClone.filter(user => (user[fieldName] === selectedOption[0].value));
            selectedOptionValArr.push(selectedOption[0].value);
          }
        }

        filterObjClone[fieldName] = selectedOptionValArr;
      } else {
        // in case of removal.
        let selectedOptionValArr = [];

        for (let index = 0; index < selectedOption.length; index++) {
          selectedOptionValArr.push(selectedOption[index].value)
        }

        filterObjClone[fieldName] = selectedOptionValArr;
        isUpdateUserClone = true;
      }
    }
    this.setState({ userDataClone, filterObj: filterObjClone }, this.setUserFilterDataUpdate.bind(this, fieldName, isUpdateUserClone));
  }

  setUserFilterDataUpdate = (selectionFilterName, isUpdateUserClone) => {
    const { options, filterObj, positionData, userDataClone, userData } = this.state;
    const { managerOption, locationOption, positionOption, ebOption } = options;
    let targetDataSet = JSON.parse(JSON.stringify(userDataClone));

    if (isUpdateUserClone) {
      targetDataSet = JSON.parse(JSON.stringify(userData));
    }

    if (targetDataSet.length > 0) {
      let selectedEB = ebOption.find((line) => line.value === filterObj.is_eb);
      let selectedLocation = locationOption.filter((location) => filterObj.geo_location.includes(location.value));
      let selectedManager = managerOption.filter((manager) => filterObj.manager_name.includes(manager.value));
      let selectedPosition = positionOption.filter((option) => filterObj.position_id.includes(option.value));

      let filteredData = this.getFilterDataByEB(targetDataSet, selectedEB);
      filteredData = this.getFilterDataBySelect(filteredData, selectedLocation, "geo_location"); //get filter data after location select
      filteredData = this.getFilterDataBySelect(filteredData, selectedManager, "manager_name");//get filter data after manager select
      filteredData = this.getFilterDataByPosition(filteredData, selectedPosition, "position_id", false);//get filter data after manager select

      if ((selectionFilterName !== 'geo_location' && filterObj.geo_location.length === 0) || (selectionFilterName === 'geo_location' && filterObj.geo_location.length === 0)) {
        options.locationOption = this.getUniqueData(filteredData, "geo_location", "user_id");
      }

      if ((selectionFilterName !== 'manager_name' && filterObj.manager_name.length === 0) || (selectionFilterName === 'manager_name' && filterObj.manager_name.length === 0)) {
        options.managerOption = this.getUniqueData(filteredData, "manager_name", "user_id", "geo_location");
      }

      if ((selectionFilterName !== 'position_id' && filterObj.position_id.length === 0) || (selectionFilterName === 'position_id' && filterObj.position_id.length === 0)) {
        options.positionOption = this.getUniqueDataPosition(filteredData, "position_id", positionData)
      }

      if (selectionFilterName !== 'is_eb') {
        options.ebOption = this.getEBPCOptions(filteredData);
      }

      options.filterUserOptions = this.getFilteredUserOptions(filteredData);

      this.setState({ options, userDataClone: filteredData });
    }
  }

  getEBPCOptions = (filteredData) => {
    const optionEBPC = [];
    let isEB = false;
    let isPC = false;

    for (let index = 0; index < filteredData.length; index++) {
      if (filteredData[index].is_eb === 1 && !isEB) {
        isEB = true;
        optionEBPC.push({ label: 'EB', value: 1 });
      } else if (filteredData[index].is_eb === 0 && !isPC) {
        isPC = true;
        optionEBPC.push({ label: 'PC', value: 0 });
      } else if (isPC && isEB) {
        break;
      }
    }

    return optionEBPC;
  }

  getCoreOptions = (filteredData) => {
    const optionCore = [];
    let isCore = false;
    let isSegment = false;

    for (let index = 0; index < filteredData.length; index++) {
      if (filteredData[index].is_core === 1 && !isCore) {
        isCore = true;
        optionCore.push({ label: 'Core', value: 1 });
      } else if (filteredData[index].is_core === 0 && !isSegment) {
        isSegment = true;
        optionCore.push({ label: 'Segment', value: 0 });
      } else if (isSegment && isCore) {
        break;
      }
    }

    return optionCore;
  }

  getFilteredSkillOptions = (filteredData) => {
    const result = [];
    filteredData.forEach((data) => result.push({ label: data.skill_name, value: data.skill_id }));
    return result;
  }

  getFilteredUserOptions = (filteredData) => {
    const result = [];
    filteredData.forEach((data) => result.push({ label: data.user_name, value: data.user_id }));
    return result;
  }

  /**
   * Clear slected dropdown when their parent dropdown will changed
   */
  clearSelectedFilter = (filterObj, name, options) => {
    let flag = "";
    if (name === "is_core") {
      options.segementOption = [];
      options.lineOption = [];
      options.competencyOption = [];
      flag = "skill";
    } else if (name === "segement") {
      let selectedSegment = options.segementOption.filter((line) => {
        return filterObj.segement.includes(line.value);
      });
      let selectedLine = options.lineOption.filter((line) => {
        return filterObj.line.includes(line.segementId);
      });
      let lineArray = [...filterObj.line];
      if (selectedSegment.length < 1) {
        lineArray = [];
      } else {
        selectedLine.forEach((l, index) => {
          if (!selectedSegment.some((sl) => sl.value === l.segement)) {
            lineArray.splice(index, 1);
          }
        });
      }

      filterObj.line = [...lineArray];
      options.lineOption = [];
      options.competencyOption = [];
      flag = "skill";
    } else if (name === "line") {
      let selectedLine = options.lineOption.filter((line) => {
        return filterObj.line.includes(line.value);
      });
      let selectedCompetency = options.competencyOption.filter((competency) => {
        return filterObj.competency.includes(competency.value);
      });
      let compentencyArray = [...filterObj.competency];
      if (selectedCompetency.length < 1) {
        compentencyArray = [];
      } else {
        selectedCompetency.forEach((l, index) => {
          if (!selectedLine.some((sl) => sl.value === l.line)) {
            compentencyArray.splice(index, 1);
          }
        });
      }

      filterObj.competency = [...compentencyArray];
      options.competencyOption = [];
      flag = "skill";
    } else if (name === "competency") {
      flag = "skill";
    } else if (name === "is_eb") {
      options.locationOption = [];
      options.managerOption = [];
      options.positionOption = [];
      flag = "user";
    } else if (name === "geo_location") {
      let selectedLocation = options.locationOption.filter((location) => {
        return filterObj.geo_location.includes(location.value);
      });
      let selectedManager = options.managerOption.filter((manager) => {
        return filterObj.manager_name.includes(manager.value);
      });
      selectedManager.forEach((l, index) => {
        if (!selectedLocation.some((sl) => sl.label === l.geo_location)) {
          selectedManager.splice(index, 1);
        }
      });
      filterObj.manager_name = selectedManager.length > 0 ? selectedManager.map(manager => manager.value) : []

      options.managerOption = [];
      options.positionOption = [];
      flag = "user";
    } else if (name === "manager_name") {
      let selectedManager = options.managerOption.filter((option) => {
        return filterObj.manager_name.includes(option.value);
      });
      let selectedPosition = options.positionOption.filter((option) => {
        return filterObj.position_id.includes(option.value);
      });
      let positionArray = [...filterObj.position_id];
      if (selectedPosition.length < 1) {
        positionArray = [];
      } else {
        selectedPosition.forEach((l, index) => {
          if (!selectedManager.some((sl) => sl.value === l.manager_name)) {
            positionArray.splice(index, 1);
          }
        });
      }
      filterObj.position_id = [...positionArray];
      options.positionOption = [];
      flag = "user";
    } else if (name === "position_id") {
      flag = "user";
    }
    return { filterObj, options, flag };
  };

  handleRadioChange = (event) => {
    let { filterObj, options, userData, userDataClone, skillData, skillDataClone, coreOptionData, ebOptionData } = this.state;
    let name = event.target.name;
    filterObj[name] = event.target.value;
    let obj = this.clearSelectedFilterOnRadio(filterObj, name, options);
    filterObj = { ...obj };
    if (name === "isUser") {
      userDataClone = [...userData]
      options.ebOption = [...ebOptionData]
    } else if (name === 'isSkill') {
      skillDataClone = [...skillData]
      options.coreOption = [...coreOptionData];
      options.filterSkillOptions = [...options.skillOption]
    }
    this.setState({ filterObj, userDataClone }, () => {
      if (name === "isUser") {
        this.setUniqueOptions()
      } else if (name === 'isSkill') {
        this.setSkillFilterData()
      }
    });
  };

  clearSelectedFilterOnRadio = (filterObj, name, options) => {
    let value = filterObj[name];
    if (name === "isSkill" && value === "filters") {
      filterObj.skillIds = [];
    } else if (name === "isSkill" && value === "skill") {
      filterObj.is_core = "";
      filterObj.segement = [];
      filterObj.line = [];
      filterObj.competency = [];
      filterObj.filterSkill = {};
      options.filterSkillOptions = [];
    } else if (name === "isUser" && value === "user") {
      filterObj.is_eb = "";
      filterObj.geo_location = [];
      filterObj.manager_name = [];
      filterObj.position_id = [];
      filterObj.filterUser = {};
      options.filterUserOptions = [];
    } else if (name === "isUser" && value === "filters") {
      filterObj.userIds = [];
    }
    return filterObj;
  };

  generateGraphData = () => {
    //console.log('generateGraphData')
    const { filterObj, userData, userDataClone, skillDataClone, positionTargetData, positionData } = this.state;
    let targetGraphData = null;
    userDataClone.forEach(user => {
      if (user.skillRatings && user.skillRatings.length > 0) {
        user.skillRatings = []
        user.skillRatingAverage = 0
      }
    })
    if (filterObj.outputId === 4) {
      const targetDataSet = this.userSkillData.filter(item => filterObj.rating === item.is_self);
      targetGraphData = evaluateLocationGraph(targetDataSet, userDataClone, skillDataClone, positionTargetData, positionData);
    } else if (filterObj.outputId === 3) {
      const targetDataSet = this.userSkillData.filter(item => filterObj.rating === item.is_self);
      targetGraphData = evaluatePositionGraph(targetDataSet, userDataClone, skillDataClone, positionTargetData, positionData);
    } else if (filterObj.outputId === 2) {
      const targetDataSet = this.userSkillData.filter(item => filterObj.rating === item.is_self);
      targetGraphData = evaluateManagerGraph(targetDataSet, userData, userDataClone, skillDataClone, positionTargetData, positionData);
    } else if (filterObj.outputId === 1) {
      const targetDataSet = this.userSkillData.filter(item => filterObj.rating === item.is_self);
      targetGraphData = evaluateIndividualGraph(targetDataSet, userData, userDataClone, skillDataClone, positionTargetData, positionData);
    }

    const dataSource = {
      chart: {
        caption: "Assessment Report",
        scrollColor: "#32CD32",
        subcaption: "2020, Quarter - 1",
        theme: this.state.theme,
        adjustDiv: "0",
        yAxisValueDecimals: "2",
        forceYAxisValueDecimals: "1",
        yAxisMaxValue: "5.00",
        yAxisMinValue: "0.00",
        numDivLines: "9",
        labelDisplay: "rotate",
        canvasPadding: "30",
        baseFontSize: "16",
        showToolTip: "1",
        lineThickness: "3",
        flatScrollBars: "1",
        scrollheight: "10",
        numVisiblePlot: "20",
        plottooltext: "$displayValue",
        decimals: "2"
      },
      categories: [
        {
          category: targetGraphData.category
        }
      ],
      dataset: targetGraphData.dataset
    }
    console.log(dataSource)
    this.setState({ dataSource });
  }

  getAllUserSkill = () => {
    const httpObj = {
      url: "api/user/getUserSkill",
      method: "GET",
    };
    httpHelper(httpObj, this.setUserSkillData, this.requestFailure, false);
    this.props.showLoader(true);
  };

  /**
   * This function set the Users table data (recieved from API response) in state
   */
  setUserSkillData = ({ data }) => {
    //getUserSkill.json
    this.userSkillData = data;
    //console.log(JSON.stringify(data))
    //debugger

    requestAnimationFrame(this.doChart)

    this.props.showLoader(false);



  };

  // Handler for radio buttons to change chart theme.
  themeHandler = (e) => {
    const { dataSource } = this.state;
    let currentTheme = Array.isArray(e) ? e.map((data) => data.value) : e.value;
    if (dataSource) {
      dataSource.chart.theme = currentTheme
      this.setState({
        theme: currentTheme,
        dataSource: dataSource
      });
    } else {
      this.setState({
        theme: currentTheme
      });
    }
  }

  //Clear all filter
  clearAllFilter = () => {
    let { filterObj, options, userData, userDataClone, skillData, skillDataClone, coreOptionData, ebOptionData, filterObjClearAll, clearAllFlag } = this.state;
    filterObj = JSON.parse(filterObjClearAll)
    userDataClone = [...userData]
    options.ebOption = [...ebOptionData]
    skillDataClone = [...skillData]
    options.coreOption = [...coreOptionData];
    options.filterSkillOptions = [...options.skillOption]
    this.setState({ filterObj, options, userDataClone, skillDataClone, clearAllFlag: true }, () => {
      this.setUniqueOptions()
    })
  }


  // render() {
  //   return (
  //   <div>hi</div>
  //   )
  // }


  render() {
    const { classes } = this.props;
    const { filterObj, options, labelEBPC, labelPosition, labelSegment, labelLine, labelCompetency } = this.state;
    let {
      managerOption,
      locationOption,
      positionOption,
      segementOption,
      lineOption,
      competencyOption,
      userOption,
      skillOption,
      sourceOption,
      coreOption,
      ebOption,
      filterSkillOptions,
      filterUserOptions,
      outputOption,
      themeOption
    } = options;
    filterUserOptions = filterUserOptions.sort(dynamicsort("label"));
    managerOption = managerOption.sort(dynamicsort("label"));
    locationOption = locationOption.sort(dynamicsort("label"));
    userOption = userOption.sort(dynamicsort("label"));
    positionOption = positionOption.sort(dynamicsort("value"));

    //console.log(filterObj.is_eb)
//      <div style={{flex:'auto', display:'flex', flexDirection:'column', padding:'10px'}}>
    return (
<React.Fragment>
<Vertical style={{width:'250px'}}>

  <ExpansionPanel defaultExpanded={false} square classes={{ root: classes.filterPanel, expanded: classes.filterPanelFirstExpanded }}>
          <ExpansionPanelSummary
            expandIcon={<ExpandMoreIcon />}

            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Typography color="primary" className={classes.Panelheading}>Assessment Filter</Typography>
            <Tooltip placement="top" TransitionComponent={Zoom} title="This selection allows you to chose between assessments completed by a manager vs self assessments">
              <Info className={classes.toolTipIcon} />
            </Tooltip>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails className={classes.filterPanelContent}>
            <Grid container>
              <Grid item sm={12} md={12} lg={12}>
                <Grid container className={classes.toolTipIconDiv}>
                  <Typography className={classes.slctBoxLabel}>
                    Assessment Source
                </Typography>
                </Grid>

                <Select
                  name="rating"
                  value={0}
                  onChange={(e) => this.selectChangeHandler(e, "rating")}
                  className="search-select"
                  optionalClassName="form-select-option"
                  searchable
                  removeSelected
                  options={sourceOption}
                  placeholder="Select Rating Source..."
                  clearable={false}
                />
              </Grid>
              <Grid item sm={7} md={7} lg={7} />
            </Grid>
          </ExpansionPanelDetails>
        </ExpansionPanel>
        <ExpansionPanel defaultExpanded={false} square classes={{ root: classes.filterPanel, expanded: classes.filterPanelExpanded }}>
          <ExpansionPanelSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel2a-content"
            id="panel2a-header"
          >
            <Typography color="primary" className={classes.Panelheading}>User Filter</Typography>
          </ExpansionPanelSummary>

          <ExpansionPanelDetails className={classes.filterPanelContent}>
            <Grid container >
              <Grid className={classes.radioGroup} item sm={12} md={12} lg={12}>
                <FormControl component="fieldset">
                  <RadioGroup
                    row
                    aria-label="position"
                    name="isUser"
                    value={filterObj.isUser}
                  >
                    <Grid container spacing={3}>
                      <Grid xclassName={classes.toolTipIconDiv} item sm={12} md={12} lg={12}>
                        <FormControlLabel
                          className={classes.radioBtnLabel}
                          value="filters"
                          control={<Radio color="primary" />}
                          label="Filters"
                          onChange={this.handleRadioChange}
                        />
                        <Tooltip placement="top" TransitionComponent={Zoom} title='Selecting the "Filters" button will enable data at the Line, Manager, Position and Location level'>
                          <Info className={classes.toolTipIcon} />
                        </Tooltip>
                      </Grid>
                      <Grid xclassName={classes.toolTipIconDiv} item sm={12} md={12} lg={12}>
                        <FormControlLabel
                          className={classes.radioBtnLabel}
                          value="user"
                          control={<Radio color="primary" />}
                          label="Users"
                          onChange={this.handleRadioChange}
                        />
                        <Tooltip placement="top" TransitionComponent={Zoom} title='Selecting the "Users" radio button will enable data at the individual level only'>
                          <Info className={classes.toolTipIcon} />
                        </Tooltip>
                      </Grid>
                    </Grid>
                  </RadioGroup>
                </FormControl>
              </Grid>

              <Grid item sm={12} md={12} lg={12}>
                <Typography className={classes.slctBoxLabel}>{labelEBPC}</Typography>
                <Select
                  name="is_eb"
                  value={filterObj.is_eb}
                  onChange={(e) => this.userSelectChangeHandler(e, "is_eb")}
                  className="search-select"
                  optionalClassName="form-select-option"
                  searchable
                  removeSelected
                  options={ebOption}
                  placeholder={`Select ${labelEBPC}...`}
                  clearable
                  disabled={filterObj.isUser === "user" ? true : false}
                />
              </Grid>

              <Grid item sm={12} md={12} lg={12}>
                <Typography className={classes.slctBoxLabel}>Sub-Function</Typography>
                <Select
                  name="is_eb"
                  value={filterObj.is_eb}
                  onChange={(e) => this.userSelectChangeHandler(e, "is_eb")}
                  className="search-select"
                  optionalClassName="form-select-option"
                  searchable
                  removeSelected
                  options={ebOption}
                  placeholder={`Select ${labelEBPC}...`}
                  clearable
                  disabled={filterObj.isUser === "user" ? true : false}
                />
              </Grid>

              <Grid item sm={12} md={12} lg={12}>
                <Typography className={classes.slctBoxLabel}>Segment</Typography>
                <Select
                  name="is_eb"
                  value={filterObj.is_eb}
                  onChange={(e) => this.userSelectChangeHandler(e, "is_eb")}
                  className="search-select"
                  optionalClassName="form-select-option"
                  searchable
                  removeSelected
                  options={ebOption}
                  placeholder={`Select ${labelEBPC}...`}
                  clearable
                  disabled={filterObj.isUser === "user" ? true : false}
                />
              </Grid>

              <Grid xclassName={classes.selectBoxContainer} item sm={12} md={12} lg={12}>
                <Typography className={classes.slctBoxLabel}>
                  Manager
                </Typography>
                <Select
                  name="manager_name"
                  multi={true}
                  value={filterObj.manager_name}
                  onChange={(e) => this.userSelectChangeHandler(e, "manager_name")}
                  className="search-select"
                  optionalClassName="form-select-option"
                  searchable
                  removeSelected
                  options={managerOption}
                  placeholder="Select Manager..."
                  clearable={false}
                  disabled={filterObj.isUser === "user" ? true : false}
                />
              </Grid>
              <Grid xclassName={classes.selectBoxContainer} item sm={12} md={12} lg={12}>
                <Typography className={classes.slctBoxLabel}>
                  {labelPosition}
                </Typography>
                <Select
                  name="position_id"
                  multi={true}
                  value={filterObj.position_id}
                  onChange={(e) => this.userSelectChangeHandler(e, "position_id")}
                  className="search-select"
                  optionalClassName="form-select-option"
                  searchable
                  removeSelected
                  options={positionOption}
                  placeholder={`Select ${labelPosition}...`}
                  clearable={false}
                  disabled={filterObj.isUser === "user" ? true : false}
                />
              </Grid>

              <Grid xclassName={classes.filterDiv} item sm={12} md={12} lg={12}>
                <Typography className={classes.slctBoxLabel}>
                  Location
                </Typography>
                <Select
                  name="geo_location"
                  multi={true}
                  value={filterObj.geo_location}
                  onChange={(e) => this.userSelectChangeHandler(e, "geo_location")}
                  className="search-select"
                  optionalClassName="form-select-option"
                  searchable
                  removeSelected
                  options={locationOption}
                  placeholder="Select Location..."
                  clearable={false}
                  disabled={filterObj.isUser === "user" ? true : false}
                />
              </Grid>


              <Grid xclassName={classes.filterDiv} item sm={12} md={12} lg={12}>
                <Typography className={classes.slctBoxLabel}>
                  Filtered Users
                </Typography>
                <Select
                  name="filterUser"
                  value={filterObj.filterUser}
                  className="search-select"
                  optionalClassName="form-select-option"
                  searchable
                  removeSelected
                  options={filterUserOptions}
                  placeholder="Filtered Users List..."
                  clearable={false}
                  disabled={filterObj.isUser === "user" ? true : false}
                />
              </Grid>
              <Grid xclassName={classes.filterDiv} item sm={12} md={12} lg={12}>
                <Typography className={classes.slctBoxLabel}>User</Typography>
                <Select
                  multi={true}
                  name="userIds"
                  value={this.state.filterObj.userIds}
                  defaultValue=""
                  onChange={this.userMultiSelectChangeHandler}
                  className="search-select"
                  optionalClassName="form-select-option"
                  searchable
                  options={[...userOption]}
                  placeholder="User List"
                  clearable={false}
                  disabled={filterObj.isUser === "filters" ? true : false}
                />
              </Grid>
            </Grid>
          </ExpansionPanelDetails>
        </ExpansionPanel>
        <ExpansionPanel defaultExpanded={false} square classes={{ root: classes.filterPanel, expanded: classes.filterPanelExpanded }}>
          <ExpansionPanelSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel3a-content"
            id="panel3a-header"
          >
            <Typography color="primary" className={classes.Panelheading}>Skill Filter</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails className={classes.filterPanelContent}>
            <Grid container>

              <Grid className={classes.radioGroup} item sm={12} md={12} lg={12}>
                <FormControl component="fieldset">
                  <RadioGroup
                    row
                    aria-label="position"
                    name="isSkill"
                    value={filterObj.isSkill}
                  >
                    <Grid container spacing={3}>
                      <Grid className={classes.toolTipIconDiv} item sm={12} md={12} lg={12}>
                        <FormControlLabel
                          className={classes.radioBtnLabel}
                          value="filters"
                          control={
                            <Radio
                              color="primary"
                              onChange={this.handleRadioChange}
                            />
                          }
                          label="Filters"
                        />
                        <Tooltip placement="top" TransitionComponent={Zoom} title='Selecting the "Filters" radio button will enable data at the Line, Segment, and Competency level'>
                          <Info className={classes.toolTipIcon} />
                        </Tooltip>
                      </Grid>
                      <Grid className={classes.toolTipIconDiv} item sm={12} md={12} lg={12}>
                        <FormControlLabel
                          className={classes.radioBtnLabel}
                          value="skill"
                          control={
                            <Radio
                              color="primary"
                              onChange={this.handleRadioChange}
                            />
                          }
                          label="Skills"
                        />
                        <Tooltip placement="top" TransitionComponent={Zoom} title='Selecting the "Skills" button will enable data at the skill level only'>
                          <Info className={classes.toolTipIcon} />
                        </Tooltip>
                      </Grid>
                    </Grid>
                  </RadioGroup>
                </FormControl>
              </Grid>

              <Grid item sm={12} md={12} lg={12}>

                {/* <Typography className={classes.slctBoxLabel}>
                  Core/Segment
                </Typography>
                <Select
                  name="is_core"
                  value={filterObj.is_core}
                  onChange={(e) => this.skillSelectChangeHandler(e, "is_core")}
                  className="search-select"
                  optionalClassName="form-select-option"
                  searchable
                  removeSelected
                  options={coreOption}
                  placeholder="Select Core/Segment..."
                  clearable
                  disabled={filterObj.isSkill === "skill" ? true : false}
                /> */}

              </Grid>

              <Grid xclassName={classes.selectBoxContainer} item sm={12} md={12} lg={12}>
                <Typography className={classes.slctBoxLabel}>
                  {labelSegment}
                </Typography>
                <Select
                  name="segement"
                  multi={true}
                  value={filterObj.segement}
                  onChange={(e) => this.skillSelectChangeHandler(e, "segement")}
                  className="search-select"
                  optionalClassName="form-select-option"
                  searchable
                  removeSelected
                  options={segementOption}
                  placeholder={`Select ${labelSegment}...`}
                  clearable={false}
                  disabled={filterObj.isSkill === "skill" ? true : false}
                />
              </Grid>

              <Grid xclassName={classes.selectBoxContainer} item sm={12} md={12} lg={12}>
                <Typography className={classes.slctBoxLabel}>{labelLine}</Typography>
                <Select
                  name="line"
                  multi={true}
                  value={filterObj.line}
                  onChange={(e) => this.skillSelectChangeHandler(e, "line")}
                  className="search-select"
                  optionalClassName="form-select-option"
                  searchable
                  removeSelected
                  options={lineOption}
                  placeholder={`Select ${labelLine}...`}
                  clearable={false}
                  disabled={filterObj.isSkill === "skill" ? true : false}
                />
                <Grid item sm={12} md={12} lg={12} />
              </Grid>
              <Grid xclassName={classes.selectBoxContainer} item sm={12} md={12} lg={12}>
                <Typography className={classes.slctBoxLabel}>
                {labelCompetency}
                </Typography>
                <Select
                  name="competency"
                  multi={true}
                  value={filterObj.competency}
                  onChange={(e) => this.skillSelectChangeHandler(e, "competency")}
                  className="search-select"
                  optionalClassName="form-select-option"
                  searchable
                  removeSelected
                  options={competencyOption}
                  placeholder={`Select ${labelCompetency}...`}
                  clearable={false}
                  disabled={filterObj.isSkill === "skill" ? true : false}
                />
              </Grid>

              <Grid xclassName={classes.filterDiv} item sm={12} md={12} lg={12}>
                <Typography className={classes.slctBoxLabel}>
                  Filtered Skill
                </Typography>
                <Select
                  name="filterSkill"
                  value={filterObj.filterSkill}
                  className="search-select"
                  optionalClassName="form-select-option"
                  searchable
                  removeSelected
                  options={filterSkillOptions}
                  placeholder="Filtered Skill List..."
                  clearable={false}
                  disabled={filterObj.isSkill === "skill" ? true : false}
                />
              </Grid>

              <Grid xclassName={classes.filterDiv} item sm={12} md={12} lg={12}>
                <Typography className={classes.slctBoxLabel}>Skill</Typography>
                <Select
                  multi={true}
                  name="skillIds"
                  value={filterObj.skillIds}
                  defaultValue=""
                  onChange={this.skillMultiSelectChangeHandler}
                  className="search-select"
                  optionalClassName="form-select-option"
                  searchable
                  options={[...skillOption]}
                  placeholder="Select Skills..."
                  clearable={false}
                  disabled={filterObj.isSkill === "filters" ? true : false}
                />
              </Grid>
            </Grid>
          </ExpansionPanelDetails>
        </ExpansionPanel>




</Vertical>

<Splitter/>


<Vertical style={{flex:'1'}}>


  {/* <div style={{border:'0px solid green',height: '100px', display:'flex', flexDirection:'row',justifyContent:'center',alignItems: 'center'}}>
    <Button style={{padding:'10px 10px 10px 10px',marginRight:'20px',width:'200px',fontSize:'18px',background:'rgb(5,55,75)',color:'white'}} >Big Button 1</Button>
    <Button style={{padding:'10px 10px 10px 10px',marginRight:'20px',width:'200px',fontSize:'18px',background:'rgb(5,55,75)',color:'white'}} >Big Button 2</Button>
    <Button style={{padding:'10px 10px 10px 10px',marginRight:'20px',width:'200px',fontSize:'18px',background:'rgb(5,55,75)',color:'white'}} >Big Button 3</Button>
    <Button style={{padding:'10px 10px 10px 10px',marginRight:'20px',width:'200px',fontSize:'18px',background:'rgb(5,55,75)',color:'white'}} >Big Button 4</Button>
  </div> */}







        <div style={{border:'0px solid red',flex:1, display:'flex', flexDirection:'column', padding:'10px'}}>



        <Grid
          container
          className={classes.filterTitleDiv}
        >





          <Grid item sm={5} md={4} lg={3} className={classes.filterOptDiv}>
            <Typography className={classes.filterBoxLabel}>
              Output:
            </Typography>

            <Select
              name="outputId"
              style={{ width: '220px' }}
              value={this.state.filterObj.outputId}
              defaultValue=""
              onChange={(e) => this.selectChangeHandler(e, "outputId")}
              className="search-select"
              optionalClassName="form-select-option"
              searchable
              options={[...outputOption]}
              placeholder="Select Graph view..."
              clearable={false}

            />
          </Grid>



          <Grid item sm={5} md={4} lg={3} className={classes.filterOptDiv}>
            <Typography className={classes.filterBoxLabel}>
              Select Theme:
              </Typography>
            <Select
              name="theme"
              style={{ width: '220px' }}
              value={this.state.theme}
              defaultValue=""
              onChange={this.themeHandler}
              className="search-select"
              optionalClassName="form-select-option"
              searchable
              options={[...themeOption]}
              placeholder="Select theme..."
              clearable={false}

            />
          </Grid>





          <Grid item sm={2} md={4} lg={6} className={classes.ChartbtnDiv}>
            <Button
              size="medium"
              className={classes.chartBtn}
              variant="contained"
              color="primary"
              onClick={this.generateGraphData}
            >
              Create Chart
            </Button>
          </Grid>
        </Grid>
        <Grid item sm={12} md={12} lg={12}>
          {this.state.dataSource && <div>
            <Chart dataSource={this.state.dataSource} />
          </div>}
        </Grid>

        </div>

      </Vertical>


</React.Fragment>



    );
  }
}

Dashboard.propTypes = {
  classes: PropTypes.object,
  showLoader: PropTypes.func,
};

Dashboard.defaultProps = {};

export default withStyles(UploadCSVStyle)(Dashboard);
