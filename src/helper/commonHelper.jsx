
/**
 * Check Excel file format and Mime Type
 * @param  {String} fileType [Name of the File.]
 * @param  {String} fileName [Type of the File.]
 * @return {Boolean}         [Is Excel or Not.]
 */
function checkExcelFile(fileType, fileName) {
    if (fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        || fileType === 'application/vnd.ms-excel.'
        || fileType === 'text/csv'
        || fileName.endsWith('.csv')
        || fileName.endsWith('.xls')
        || fileName.endsWith('.xlsx')) {
        return true;
    }

    return false;
}

function getCurrentQuarter() {
    let date = new Date();
    let quarterArr = [4, 1, 2, 3];
    return quarterArr[Math.floor(date.getMonth() / 3)];
}

function dynamicsort(property, order) {
    var sort_order = 1;
    if (order === "desc") {
        sort_order = -1;
    }
    return function (a, b) {
        // a should come before b in the sorted order
        if (a[property] < b[property]) {
            return -1 * sort_order;
            // a should come after b in the sorted order
        } else if (a[property] > b[property]) {
            return 1 * sort_order;
            // a and b are the same
        } else {
            return 0 * sort_order;
        }
    }
}

export {
    checkExcelFile,
    getCurrentQuarter,
    dynamicsort
};
