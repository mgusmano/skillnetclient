export default function evaluatePositionGraph(userSkillData, targetUsers, targetSkillSet, positionTargetData, positionData) {
    const targetUserIdArr = [];
    const targetSkillIdArr = [];

    targetSkillSet.forEach(skill => targetSkillIdArr.push(skill.skill_id));
    targetUsers.forEach(user => targetUserIdArr.push(user.user_id));

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
    let distinctPositions = [...new Set(targetUsers.map(user => user.position_id))];
    let graphResult = { category: [], dataset: [{ seriesname: 'Individual', data: [] }, { seriesname: 'Target Rating', data: [] }] };
    graphResult = evaluateIndividualDataSet(distinctPositions, targetUsers, positionData, graphResult);
    graphResult = evaluateTargetRatingDataSet(distinctPositions, targetUsers, positionTargetData, positionData, targetSkillIdArr, graphResult);
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

function evaluateIndividualDataSet(distinctPositions, targetUsers, positionData, graphResult) {
    let postionObjArr = [];
    distinctPositions.forEach(position => {
        const selectedPosition = positionData.filter(pos => pos.position_id === position)[0];
        const positionObj = {
            position_name: selectedPosition.position_name,
            position_id: selectedPosition.position_id,
            target_rating_set: [],
        }
        postionObjArr.push(positionObj);

        graphResult.category.push({ label: selectedPosition.position_name });
        const selectedUsersOnPositionBasis = targetUsers.filter(user => user.position_id === position);
        let positionIndividualTotal = 0;
        let selectedIndividualLength = 0;
        selectedUsersOnPositionBasis.forEach(userOfLocation => {
            if (userOfLocation.skillRatingAverage > 0) {
                positionIndividualTotal += userOfLocation.skillRatingAverage;
                selectedIndividualLength++
            }
        });
        const positionIndividualAverage = positionIndividualTotal / selectedIndividualLength;
        let inputValue = isNaN(positionIndividualAverage) ? '' : positionIndividualAverage.toFixed(2);
        graphResult.dataset[0].data.push({
            value: positionIndividualAverage,
            displayValue: `<div> Name: ${selectedPosition.position_name}, Position Rating: ${inputValue}</div>`
        });
    });

    return graphResult;
}


function evaluateTargetRatingDataSet(distinctPositions, targetUsers, positionTargetData, positionData, targetSkillIdArr, graphResult) {
    let postionObjArr = [];
    distinctPositions.forEach(distinctPositionItem => {
        const selectedPosition = positionData.filter(pos => pos.position_id === distinctPositionItem)[0];
        const positionObj = {
            position_name: selectedPosition.position_name,
            position_id: selectedPosition.position_id,
            target_rating_set: [],
        }
        postionObjArr.push(positionObj);
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

    postionObjArr.forEach(position => {
        const samePositionUserSet = targetUsers.filter(user => user.position_id === position.position_id);
        let positionTotalTarget = 0;
        samePositionUserSet.forEach(user => {
            positionTotalTarget += position.targetAverageRating;
        });

        const positionTotalTargetAverage = positionTotalTarget / samePositionUserSet.length;
        let inputValue = isNaN(positionTotalTargetAverage) ? '' : positionTotalTargetAverage.toFixed(2);
        graphResult.dataset[1].data.push({ value: positionTotalTargetAverage,
            displayValue: `<div> Position Target:${inputValue}</div>` });
    });

    return graphResult;
}