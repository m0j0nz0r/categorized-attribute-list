/**
 * Constant to define error codes and messages.
 *
 * @type {{001: string, 002: string, 003: string, 004: string, 005: string, 006: string}}
 */
const errorCodes = {
    "001" : "Required field.",
    "002" : "Min range is greater than Max range",
    "003" : "Does not divide range exactly",
    "004" : "Is greater than range",
    "005" : "Is not a number",
    "006" : "Is duplicated"
};

/**
 * Returns true if the value is empty.
 *
 * @param value
 * @returns {boolean}
 */
function isEmpty(value){
    return (value === undefined || value === null || value === '');
}

/**
 * Returns true if the supplied field has any errors in the list.
 *
 * @param {string} field
 * @param {Object[]} errors
 * @returns {boolean}
 */
function hasError(field, errors){
    return !!errors.find((e)=> e.field === field);
}

/**
 * Encapsulation for validation for accuracy and precision fields.
 *
 * @param {string} field
 * @param {number} value
 * @param {Object[]} errors
 */
function precisionCheck(field, value, errors){
    const fieldValue = value[field];
    const range = value.range.rangeMax - value.range.rangeMin;
    if (isEmpty(fieldValue)){
        errors.push({field:field, code: "001"});
    }
    else if(isNaN(fieldValue)){
        errors.push({field:field, code: "005"});
    }
    else{
        if (fieldValue > range){
            errors.push({field : field, code: "004"});
        }
        else if(range % fieldValue !== 0){
            errors.push({field:field, code:"003"});
        }
    }
}

/**
 * Main validation function. Returns a list of errors.
 *
 * @param value - Value to validate
 * @param values - List of values to check for duplicate names.
 * @returns {Array}
 */
function getAttributeErrors(value, values){
    let errors = [];
    if (isEmpty(value.name)){
        errors.push({field: "name", code:"001", });
    }
    else{
        if (values.filter((v) => v.id !== value.id && v.name === value.name).length > 0){
            errors.push({field: "name", code:"006"});
        }
    }

    //number format validation
    if ('number' === value.format){
        if (isEmpty(value.range.rangeMin)){
            errors.push({field:"rangeMin", code: "001"});
        }
        else if(isNaN(value.range.rangeMin)){
            errors.push({field:"rangeMin", code: "005"});
        }
        if (isEmpty(value.range.rangeMax)){
            errors.push({field:"rangeMax", code: "001"});
        }
        else if(isNaN(value.range.rangeMax)){
            errors.push({field:"rangeMax", code: "005"});
        }
        if (isEmpty(value.unitOfMeasurement)){
            errors.push({field:"unitOfMeasurement", code: "001"});
        }
        if (!hasError("rangeMax", errors) && !hasError("rangeMin", errors)){
            const range = value.range.rangeMax - value.range.rangeMin;
            if (range < 0){
                errors.push({field:"rangeMin", code: "002"});
                errors.push({field:"rangeMax", code: "002"});
            }
            else{
                precisionCheck("precision", value, errors);
                precisionCheck("accuracy", value, errors);
            }
        }
    }
    return errors;
}

module.exports = {
    errorCodes: errorCodes,
    hasError: hasError,
    getAttributeErrors: getAttributeErrors
};