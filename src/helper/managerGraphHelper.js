export default function evaluateManagerGraph(userSkillData, allUsersData, targetUsers, targetSkillSet, positionTargetData, positionData) {
    const targetUserIdArr = [];
    const targetSkillIdArr = [];

    targetSkillSet.forEach(skill => targetSkillIdArr.push(skill.skill_id));
    targetUsers.forEach(user => targetUserIdArr.push(user.user_id));

    userSkillData.forEach(item => {
        if(targetUserIdArr.indexOf(item.user_id) > -1 && targetSkillIdArr.indexOf(item.skill_id) > -1) {
            const selectedUser = targetUsers.filter(user => user.user_id === item.user_id)[0];

            if (!selectedUser.skillRatings) {
                selectedUser.skillRatings = [];
            }

            selectedUser.skillRatings.push(item.rating);
        }
    });

    targetUsers = evaluateAverageOfUser(targetUsers);
    let distinctManagers = [...new Set(targetUsers.map(user => user.manager_name ))];
    let graphResult = { category: [], dataset: [{ seriesname: 'Manager', data: []}, { seriesname: 'Target Rating', data: []}, { seriesname: 'Group Average Rating', data: []}] };
    graphResult = evaluateIndividualDataSet(distinctManagers, targetUsers, graphResult);
    graphResult = evaluateTargetRatingDataSet(distinctManagers, targetUsers, positionTargetData, positionData, targetSkillIdArr, graphResult);
    graphResult = evaluateGroupAverageRatingDataSet(allUsersData, userSkillData, targetUsers, targetSkillIdArr, graphResult);
    return graphResult;
}

function evaluateAverageOfUser(userSet) {
    userSet.forEach(user => {
        let total = 0;
        if (user.skillRatings) {
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

function evaluateIndividualDataSet(distinctManagers, targetUsers, graphResult) {
    distinctManagers.forEach(manager => {
        graphResult.category.push({ label: manager });
        const selectedUsersOnManagerBasis = targetUsers.filter(user => user.manager_name === manager);
        let managerIndividualTotal = 0;
        let selectedUserLength = 0;
        selectedUsersOnManagerBasis.forEach(userOfManager => {
            if (userOfManager.skillRatingAverage > 0) {
                managerIndividualTotal += userOfManager.skillRatingAverage;
                selectedUserLength++;
            }
        });
        const managerIndividualAverage = managerIndividualTotal/selectedUserLength;
        let inputValue = isNaN(managerIndividualAverage) ? '' : managerIndividualAverage.toFixed(2);
        graphResult.dataset[0].data.push({ value: managerIndividualAverage,
        displayValue:`<div> Name: ${manager}, Manager Rating: ${inputValue}</div>`});
    });

    return graphResult;
}

function evaluateTargetRatingDataSet(distinctManagers, targetUsers, positionTargetData, positionData, targetSkillIdArr, graphResult) {
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
    })

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

    distinctManagers.forEach(manager => {
        const sameManagerUserSet = targetUsers.filter(user => user.manager_name === manager);
        let managerTotalTarget = 0;
        sameManagerUserSet.forEach(user => {
            const selectedPosition = postionObjArr.filter(position => position.position_id === user.position_id)[0];
            managerTotalTarget += selectedPosition.targetAverageRating;
        });

        const managerTotalTargetAverage = managerTotalTarget / sameManagerUserSet.length;
        let inputValue = isNaN(managerTotalTargetAverage) ? '' : managerTotalTargetAverage.toFixed(2);
        graphResult.dataset[1].data.push({ value: managerTotalTargetAverage,
            displayValue:`<div>Target Rating: ${inputValue}</div>`
        });
    });

    return graphResult;
}

function evaluateGroupAverageRatingDataSet(allUsers, userSkillData, targetUsers, targetSkillIdArr, graphResult) {
    const managerArray = [];
    const poolOfUserIds = [];
    const positionObjArr = [];
    const distinctPositionIds = [];

    targetUsers.forEach(user => {
        if (distinctPositionIds.indexOf(user.position_id) < 0) {
            distinctPositionIds.push(user.position_id);
        }
    });

    allUsers.forEach(user => {
        if (distinctPositionIds.indexOf(user.position_id) > -1) {
            const targetPosition = positionObjArr.filter(positionObj => positionObj.position_id === user.position_id);

            if (targetPosition && targetPosition.length > 0) {
                targetPosition[0].user_set.push(user.user_id);
            } else {
                positionObjArr.push({
                    position_id :user.position_id,
                    user_set: [user.user_id],
                    skillSet: [],
                })
            }

            poolOfUserIds.push(user.user_id);
        }
    });

    userSkillData.forEach(element => {
        if (targetSkillIdArr.indexOf(element.skill_id) > -1 && poolOfUserIds.indexOf(element.user_id) > -1) {
            positionObjArr.forEach((positionObj) => {
                if (positionObj.user_set.indexOf(element.user_id) > -1) {
                    positionObj.skillSet.push(element.rating);
                }
            });
        }
    });

    positionObjArr.forEach(positionItem => {
        let total = 0;
        positionItem.skillSet.forEach(skillRating => { total += skillRating; });
        positionItem.positionAverage = total/positionItem.skillSet.length;
    });

    targetUsers.forEach(user => {
        user.groupAverage = positionObjArr.filter(position => position.position_id === user.position_id)[0].positionAverage;
        const targetManager = managerArray.filter(manager => manager.manager_name === user.manager_name);

        if (targetManager.length > 0) {
            targetManager[0].averageRating.push(user.groupAverage);
            targetManager[0].managerTotal += user.groupAverage;
        } else {
            managerArray.push({
                manager_name: user.manager_name,
                averageRating: [user.groupAverage],
                managerTotal: user.groupAverage
            })
        }
    });

    managerArray.forEach(manager => {
        const managerTotalTargetAverage = manager.managerTotal / manager.averageRating.length;
        let inputValue = isNaN(managerTotalTargetAverage) ? '' : managerTotalTargetAverage.toFixed(2);
        graphResult.dataset[2].data.push({ value: managerTotalTargetAverage,
            displayValue:`<div>Group Average Rating: ${inputValue}</div>`
        });
    });
    
    return graphResult;
}