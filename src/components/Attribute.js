import React, { Component } from 'react';
import t from 'tcomb-form';
import TagsComponent from './TagsComponent';

const Form = t.form.Form;

t.String.getValidationErrorMessage = (value, path, context) => {
    if (!value){
        return "Required field";
    }
    return null;
};
t.Number.getValidationErrorMessage = (value) => {
    if (null === value){
        return "Required field";
    }
    if (isNaN(value)){
        return "Not a number";
    }
    return null;
};

const ResourceTypesObject = {0:"Default Value"};
const ResourceTypes = t.enums(ResourceTypesObject);

const DataTypesObject = {
    string: "String",
    obj: "Object"
};
const DataTypes = t.enums(DataTypesObject);

const FormatTypesObject = {
    none: "None",
    number: "Number",
    bool: "Boolean",
    date: "Date-Time",
    data: "CDATA",
    uri: "URI"
};
const FormatTypes = t.enums(FormatTypesObject);

const RangeFields = t.refinement(t.struct({
    rangeMin: t.Number,
    rangeMax: t.Number
}), (value) => {
    return value.rangeMin <= value.rangeMax;
});

RangeFields.getValidationErrorMessage = (value) => {
    if (value.rangeMin > value.rangeMax){
        return "Min range is greater than Max range";
    }
    return null;
};

const AttributeType = {
    name: t.maybe(t.String),
    description: t.maybe(t.String),
    deviceResourceType: ResourceTypes,
    defaultValue: t.maybe(t.String),
    dataType: DataTypes,
    format: FormatTypes,
};

const defaultAttributeKeys = [
    'category',
    'name',
    'description',
    'deviceResourceType',
    'defaultValue',
    'dataType',
    'format',
    'enumerations',
    'rangeMin',
    'rangeMax',
    'unitOfMeasurement',
    'precision',
    'accuracy'
];

const ConditionalAttributes = {
    formats:{
        none: {
            enumerations: t.list(t.String),
        },
        number:{
            range: RangeFields,
            unitOfMeasurement: t.maybe(t.String),
            precision: t.Number,
            accuracy: t.Number
        }
    },
};

const options = {
    fields:{
        name:{
            label: "Name",
            attrs:{
                placeholder: "Enter a name"
            }
        },
        description: {
            label: "Description",
            attrs:{
                placeholder: "Enter a description for your new attribute"
            }
        },
        deviceResourceType:{
            disabled: true
        },
        defaultValue:{
            label: "Default value",
            attrs:{
                placeholder: "Enter a default Value"
            }
        },
        dataType: {
            nullOption: false
        },
        format:{
            nullOption: false
        },
        enumerations:{
            factory: TagsComponent,
            attrs: {
                placeholder: "Enter value"
            }
        },
        range: {
            fields:{
                rangeMin:{
                    attrs: {
                        placeholder: "Min range"
                    }
                },
                rangeMax:{
                    attrs: {
                        placeholder: "Max range"
                    }
                }
            }
        },
        unitOfMeasurement:{
            label: "Unit of Measurement",
            attrs:{
                placeholder: "UoM (eg. mm)"
            }
        },
        precision:{
            attrs:{
                placeholder: "Precision (eg. 0.5)"
            }
        },
        accuracy:{
            attrs:{
                placeholder: "Accuracy (eg. 0.5)"
            }
        }
    }
};

class Attribute extends Component {
    constructor(props, context, updater){
        super(props, context, updater);

        this.onFormChange = this.onFormChange.bind(this);
        this.showErrors = this.showErrors.bind(this);
        this.state = {
            value: props.value,
            options: options,
            attribute: Attribute.getAttribute(props.value),
            isValid: false
        };
    }

    static getAttribute(value){
        let returnValue = AttributeType;

        if (value.dataType === "string"){
            if (['none', 'number'].indexOf(value.format) !== -1){
                returnValue = Object.assign({}, returnValue, ConditionalAttributes.formats[value.format]);
            }
        }

        return t.refinement(t.struct(returnValue), Attribute.validateAttribute);
    }

    static validateAttribute(value){
        if (!value.name){
            return false;
        }
        if ("number" === value.format){
            return !!value.unitOfMeasurement && Attribute.validateNumberFormat(value).length === 0;
        }
        return true;
    }

    static validateNumberFormat(value){
        let a = value.range && (value.range.rangeMax - value.range.rangeMin),
            errors = [];
        if (a % value.precision){
            errors.push(0);
        }
        if (a % value.accuracy){
            errors.push(1);
        }
        return errors;
    }

    componentDidMount(){
        this.props.onChange(this.state.value, this.getPaddedValue(this.state.value));
        this.showErrors(this.refs.form.validate());
    }

    componentDidUpdate(prevProps, prevState){
        if (this.state.value.name && (this.state.options.fields.name.hasError !== this.props.isDuplicated)){
            this.showErrors(this.refs.form.validate());
        }
        if (this.state.isValid !== prevState.isValid){
            this.props.onChange(this.state.value, this.getPaddedValue(this.state.value));
        }
    }

    onFormChange(value){
        let options = t.update(this.state.options, {
                fields: {
                    defaultValue: {
                        disabled: {$set:value.dataType === "obj"}
                    },
                    format:{
                        disabled: {$set:value.dataType === "obj"}
                    }
                }
            }),
            attribute = Attribute.getAttribute(value);
        if (value.dataType === 'obj'){
            value.defaultValue = null;
            value.format = 'none';
        }
        if (value.format !== 'number'){
            delete value.range;
            delete value.unitOfMeasurement;
            delete value.precision;
            delete value.accuracy;
        }
        if (value.format !== 'none'){
            value.enumerations = [];
        }
        this.props.onChange(value, this.getPaddedValue(value));
        this.setState({options: options, value: value, attribute: attribute}, () => {
            this.showErrors(this.refs.form.validate());
        });
    }

    showErrors(validationResults){
        let options = t.update(this.state.options, {
            hasError: {$set:false},
            fields: {
                name:{
                    hasError:{$set:false}
                },
                unitOfMeasurement:{
                    hasError:{$set:false}
                },
                range: {
                    fields:{
                        rangeMin:{
                            hasError: {$set: false},
                        },
                        rangeMax:{
                            hasError: {$set: false},
                        }
                    }
                },
                precision:{
                    hasError: {$set: false}
                },
                accuracy:{
                    hasError: {$set: false}
                }
            }

        }), isValid = true;

        if (!validationResults.value.name){
            isValid = false;
            options = t.update(options, {
                fields:{
                    name: {
                        hasError:{
                            $set: true
                        },
                        error: {
                            $set: "Required field"
                        }
                    }
                }
            })
        }
        else if(this.props.isDuplicated){
            isValid = false;
            options = t.update(options, {
                fields:{
                    name: {
                        hasError:{
                            $set: true
                        },
                        error: {
                            $set: "Duplicated name"
                        }
                    }
                }
            })
        }

        if ("number" === validationResults.value.format && !validationResults.value.unitOfMeasurement){
            isValid = false;
            options = t.update(options, {
                fields:{
                    unitOfMeasurement: {
                        hasError:{
                            $set: true
                        },
                        error: {
                            $set: "Required field"
                        }
                    }
                }
            });
        }

        if (validationResults.errors.length){
            isValid = false;
            validationResults.errors.forEach((error) => {
                let errors;
                if (!error.path.length){
                    if ("number" === error.actual.format){

                        errors = Attribute.validateNumberFormat(error.actual);
                        if (errors.length > 0){
                            errors.forEach((v) => {
                                switch(v){
                                    case 0:
                                        options = t.update(options, {
                                            fields: {
                                                precision:{
                                                    hasError: {$set: true },
                                                    error: { $set: 'Precision does not divide range exactly'}
                                                }
                                            }
                                        });
                                        break;
                                    case 1:
                                        options = t.update(options, {
                                            fields: {
                                                accuracy:{
                                                    hasError: {$set: true },
                                                    error: { $set: 'Accuracy does not divide range exactly'}
                                                }
                                            }
                                        });
                                        break;
                                    default:
                                }
                            });
                        }
                    }
                }
                else if ("range" === error.path[0]){
                    options = t.update(options, {
                        fields: {
                            range: {
                                fields:{
                                    rangeMin:{
                                        hasError: {$set: true},
                                        error: {$set:error.message}
                                    },
                                    rangeMax:{
                                        hasError: {$set: true},
                                        error: {$set:error.message}
                                    }
                                }
                            }
                        }
                    });
                }
            })
        }

        this.setState({options:options, isValid: isValid});
    }

    getPaddedValue(value){
        let returnValue = {};
        defaultAttributeKeys.forEach((k) =>{
            let newValue;
            switch(k){
                case 'deviceResourceType':
                    newValue = ResourceTypesObject[value[k]];
                    break;
                case 'dataType':
                    newValue = DataTypesObject[value[k]];
                    break;
                case 'format':
                    newValue = FormatTypesObject[value[k]];
                    break;
                case 'rangeMin': 
                case 'rangeMax':
                    newValue = value.range && value.range[k];
                    break;
                default:
                    newValue = value[k];
            }
            returnValue[k] = (newValue===undefined)?null:newValue;
        });
        returnValue.isValid = this.state.isValid;
        return returnValue;
    }

    render() {
        return (
            <div className={this.props.className}>
                <Form
                    ref="form"
                    type={this.state.attribute}
                    options={this.state.options}
                    value={this.state.value}
                    onChange={this.onFormChange}
                />
            </div>
        );
    }
}

export default Attribute;
