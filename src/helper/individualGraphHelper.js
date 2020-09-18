export default function evaluateIndividualGraph(userSkillData, allUsersData, targetUsers, targetSkillSet, positionTargetData, positionData, skillData, userData) {
    const targetUserIdArr = [];
    const targetSkillIdArr = [];
    targetUsers.forEach(user => targetUserIdArr.push(user.user_id));
    targetSkillSet.forEach(skill => targetSkillIdArr.push(skill.skill_id));

    userSkillData.forEach(item => {
        if (targetUserIdArr.indexOf(item.user_id) > -1 && targetSkillIdArr.indexOf(item.skill_id) > -1) {
            const selectedUser = targetUsers.filter(user => user.user_id === item.user_id)[0];
            if (!selectedUser.skillRatings) {
                selectedUser.skillRatings = [];
            }
            selectedUser.skillRatings.push(item.rating);
        }
    });
    targetUsers = evaluateAverageOfUser(targetUsers);
    let graphResult = {
        category: [], dataset: [
            { seriesname: 'Individual', data: [] },
            { seriesname: 'Target Rating', data: [] },
            { seriesname: 'Group Avg', data: [] },
            { seriesname: 'Manager Rating', data: [] }
        ]
    };
    graphResult = evaluateIndividualDataSet(targetUsers, graphResult);
    graphResult = evaluateTargetRatingDataSet(targetUsers, positionTargetData, positionData, targetSkillIdArr, graphResult);
    graphResult = evaluateGroupRatingDataSet(targetUsers, allUsersData, userSkillData, positionData, targetSkillIdArr, graphResult);
    graphResult = evaluateDirectorRatingDataSet(targetUsers, allUsersData, userSkillData, positionData, targetSkillIdArr, graphResult);

    return graphResult;
}

function evaluateAverageOfUser(userSet) {
    userSet.forEach(user => {
        let total = 0;
        if (user.skillRatings && user.skillRatings.length > 0) {
            user.skillRatings.forEach(skillRating => {
                total += skillRating;
            });
            user.skillRatingAverage = total / user.skillRatings.length;
        } else {
            user.skillRatingAverage = 0;
        }
    });

    return userSet;
}

function evaluateIndividualDataSet(targetUsers, graphResult) {
    targetUsers.forEach(user => {
        graphResult.category.push({ label: user.user_name });
        if (user.skillRatingAverage > 0) {
            graphResult.dataset[0].data.push({
                value: user.skillRatingAverage,
                displayValue: `<div>Name: ${user.user_name}, Individual Rating: ${user.skillRatingAverage.toFixed(2)}</div>`
            });
        } else {
            graphResult.dataset[0].data.push({
                value: '',
                displayValue: `<div>Name: ${user.user_name}, Individual Rating: ${''}</div>`
            });
        }
    });
    return graphResult;
}

function evaluateTargetRatingDataSet(targetUsers, positionTargetData, positionData, targetSkillIdArr, graphResult) {
    let distinctPositions = [...new Set(targetUsers.map(user => user.position_id))];
    let postionObjArr = [];
    targetUsers.forEach(user => {
        const isPosition = postionObjArr.filter(position => position.position_id === user.position_id).length;
        if (!isPosition) {
            const selectedPosition = positionData.filter(pos => pos.position_id === user.position_id)[0];
            const positionObj = {
                position_name: selectedPosition.position_name,
                position_id: selectedPosition.position_id,
                target_rating_set: [],
            }
            postionObjArr.push(positionObj);
        }
    });

    positionTargetData.forEach(element => {
        if (element.target_rating && distinctPositions.indexOf(element.position_id) > -1 && targetSkillIdArr.indexOf(element.skill_id) > -1) {
            const targetPositionObj = postionObjArr.filter(positionObj => positionObj.position_id === element.position_id)[0];
            targetPositionObj.target_rating_set.push(element.target_rating);
        }
    });

    postionObjArr.forEach(positionObj => {
        let totalTargetRating = 0;
        positionObj.target_rating_set.forEach((rating) => {
            totalTargetRating += rating;
        });
        positionObj.targetAverageRating = totalTargetRating / positionObj.target_rating_set.length;
    });

    targetUsers.forEach(user => {
        const selectedPosition = postionObjArr.filter(position => position.position_id === user.position_id)[0];
        let targetAverageRatingValue = isNaN(selectedPosition.targetAverageRating) ? '' : selectedPosition.targetAverageRating.toFixed(2);
        graphResult.dataset[1].data.push({
            value: targetAverageRatingValue, displayValue: `<div>Target Rating: ${targetAverageRatingValue}</div>`
        });
    });

    return graphResult;
}

function evaluateGroupRatingDataSet(targetUsers, allUsersData, userSkillData, positionData, targetSkillIdArr, graphResult) {
    let distinctPositions = [...new Set(targetUsers.map(user => user.position_id))];
    let postionObjArr = [];

    allUsersData.forEach(user => {
        if (distinctPositions.indexOf(user.position_id) > -1) {
            const selectedPositionObj = postionObjArr.filter(position => position.position_id === user.position_id);

            if (selectedPositionObj && selectedPositionObj.length === 0) {
                const selectedPosition = positionData.filter(pos => pos.position_id === user.position_id)[0];
                const positionObj = {
                    position_name: selectedPosition.position_name,
                    position_id: selectedPosition.position_id,
                    user_id_set: [user.user_id],
                    skill_rating_set: [],
                }
                postionObjArr.push(positionObj);
            } else if (selectedPositionObj && selectedPositionObj.length > 0) {
                selectedPositionObj[0].user_id_set.push(user.user_id);
            }
        }
    });

    userSkillData.forEach(element => {
        if (targetSkillIdArr.indexOf(element.skill_id) > -1) {
            postionObjArr.forEach((positionObj) => {
                if (positionObj.user_id_set.indexOf(element.user_id) > -1) {
                    positionObj.skill_rating_set.push(element.rating);
                }
            });
        }
    });

    postionObjArr.forEach(positionObj => {
        let totalSkillRating = 0;
        positionObj.skill_rating_set.forEach((rating) => {
            totalSkillRating += rating;
        });
        positionObj.skillAverageRating = totalSkillRating / positionObj.skill_rating_set.length;
    });

    targetUsers.forEach(user => {
        const selectedPosition = postionObjArr.filter(position => position.position_id === user.position_id)[0];
        let skillAverageRatingValue = isNaN(selectedPosition.skillAverageRating) ? '' : selectedPosition.skillAverageRating.toFixed(2);
        graphResult.dataset[2].data.push({
            value: selectedPosition.skillAverageRating,
            displayValue: `<div>Position: ${selectedPosition.position_name}, Position Rating: ${skillAverageRatingValue}</div>`
        });
    });
    return graphResult;
}

function evaluateDirectorRatingDataSet(targetUsers, allUsersData, userSkillData, positionData, targetSkillIdArr, graphResult) {
    let distinctManagers = [...new Set(targetUsers.map(user => user.manager_name))];
    let managersObjArr = [];
    allUsersData.forEach(user => {
        if (distinctManagers.indexOf(user.manager_name) > -1) {
            const selectedManager = managersObjArr.filter(manager => manager.manager_name === user.manager_name);
            if (selectedManager && selectedManager.length > 0) {
                selectedManager[0].user_id_set.push(user.user_id);
            } else {
                const managerObj = {
                    manager_name: user.manager_name,
                    user_id_set: [user.user_id],
                    skill_rating_set: [],
                }
                managersObjArr.push(managerObj);
            }
        }
    });

    userSkillData.forEach(element => {
        if (targetSkillIdArr.indexOf(element.skill_id) > -1) {
            managersObjArr.forEach((managerObj) => {
                if (managerObj.user_id_set.indexOf(element.user_id) > -1) {
                    managerObj.skill_rating_set.push(element.rating);
                }
            });
        }
    });

    managersObjArr.forEach(managerObj => {
        let managerTotalRating = 0;
        managerObj.skill_rating_set.forEach(rating => {
            managerTotalRating += rating;
        });
        managerObj.skill_average = managerTotalRating / managerObj.skill_rating_set.length;
    });

    targetUsers.forEach(user => {
        const selectedManager = managersObjArr.filter(manager => manager.manager_name === user.manager_name)[0];
        let skill_averageValue = isNaN(selectedManager.skill_average) ? '' : selectedManager.skill_average.toFixed(2);
        graphResult.dataset[3].data.push({
            value: selectedManager.skill_average,
            displayValue: `<div>Manager: ${user.manager_name}, Manager Rating: ${skill_averageValue}</div>`
        });
    });
    return graphResult;
}
