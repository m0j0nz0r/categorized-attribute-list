const errorCodes = {
    "001" : "Required field."
};
function validateNumberFormat(value){
    const a = value.range && (value.range.rangeMax - value.range.rangeMin);
    let errors = [];
    if (a % value.precision){
        errors.push(0);
    }
    if (a % value.accuracy){
        errors.push(1);
    }
    return errors;
}
function validateAttribute(value){
    if (!value.name){
        return false;
    }
    if ("number" === value.format){
        return !!value.unitOfMeasurement && validateNumberFormat(value).length === 0;
    }
    return true;
}
function getAttributeErrors(value){
    let errors = [];
    if (!value.name){
        errors.push({field: "name", code:"001", });
    }
}

module.exports = {
    errorCodes: errorCodes,
    validateNumberFormat: validateNumberFormat,
    validateAttribute: validateAttribute,
    getAttributeErrors: getAttributeErrors
};