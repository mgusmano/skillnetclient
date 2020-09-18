export default function evaluateLocationGraph(userSkillData, targetUsers, targetSkillSet, positionTargetData, positionData) {
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
    let distinctLocations = [...new Set(targetUsers.map(user => user.geo_location))];
    let graphResult = { category: [], dataset: [{ seriesname: 'Individual', data: [] }, { seriesname: 'Target Rating', data: [] }] };
    graphResult = evaluateIndividualDataSet(distinctLocations, targetUsers, graphResult);
    graphResult = evaluateTargetRatingDataSet(distinctLocations, targetUsers, positionTargetData, positionData, targetSkillIdArr, graphResult);
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

function evaluateIndividualDataSet(distinctLocations, targetUsers, graphResult) {
    distinctLocations.forEach(location => {
        graphResult.category.push({ label: location });
        const selectedUsersOnLocationBasis = targetUsers.filter(user => user.geo_location === location);
        let locationIndividualTotal = 0;
        let selectedIndividualLength = 0
        selectedUsersOnLocationBasis.forEach(userOfLocation => {
            if (userOfLocation.skillRatingAverage > 0) {
                locationIndividualTotal += userOfLocation.skillRatingAverage;
                selectedIndividualLength++;
            }
        });
        const locationIndividualAverage = locationIndividualTotal / selectedIndividualLength;
        let inputValue = isNaN(locationIndividualAverage) ? '' : locationIndividualAverage.toFixed(2);
        graphResult.dataset[0].data.push({
            value: locationIndividualAverage,
            displayValue: `<div> Name: ${location}, Location Rating: ${inputValue}</div>`
        });
    });

    return graphResult;
}

function evaluateTargetRatingDataSet(distinctLocations, targetUsers, positionTargetData, positionData, targetSkillIdArr, graphResult) {
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

    distinctLocations.forEach(location => {
        const sameLocationUserSet = targetUsers.filter(user => user.geo_location === location);
        let locationTotalTarget = 0;
        sameLocationUserSet.forEach(user => {
            const selectedPosition = postionObjArr.filter(position => position.position_id === user.position_id)[0];
            locationTotalTarget += selectedPosition.targetAverageRating;
        });

        const locationTotalTargetAverage = locationTotalTarget / sameLocationUserSet.length;
        let inputValue = isNaN(locationTotalTargetAverage) ? '' : locationTotalTargetAverage.toFixed(2);
        graphResult.dataset[1].data.push({ value: locationTotalTargetAverage,
            displayValue: `Target Rating: ${inputValue}` });
    });

    return graphResult;
}