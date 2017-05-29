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

const ResourceTypes = t.enums({0 : "Default Value"});

const DataTypes = t.enums({
    string: "String",
    obj: "Object"
});

const FormatTypes = t.enums({
    none: "None",
    number: "Number",
    bool: "Boolean",
    date: "Date-Time",
    data: "CDATA",
    uri: "URI"
});

const RangeFields = t.refinement(t.struct({
    minRange: t.Number,
    maxRange: t.Number
}), (value) => {
    return value.minRange <= value.maxRange;
});
RangeFields.getValidationErrorMessage = (value) => {
    if (value.minRange > value.maxRange){
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
                minRange:{
                    attrs: {
                        placeholder: "Min range"
                    }
                },
                maxRange:{
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
            attribute: Attribute.getAttribute(props.value)
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
        if (!value.name || !value.unitOfMeasurement){
            return false;
        }
        if ("number" === value.format){
            return Attribute.validateNumberFormat(value).lenght === 0;
        }
        return true;
    }

    static validateNumberFormat(value){
        let a = value.range.maxRange - value.range.minRange,
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
        this.showErrors(this.refs.form.validate());
    }

    componentDidUpdate(){
        if (this.state.value.name && this.state.options.fields.name.hasError !== this.props.isDuplicated){
            this.showErrors(this.refs.form.validate());
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
        this.props.onChange(value);
        this.setState({options: options, value: value, attribute: attribute}, () => {
            this.showErrors(this.refs.form.validate());
        });
    }

    showErrors(validationResults){
        let options = t.update(this.state.options, {
            fields: {
                name:{
                    hasError:{$set:false}
                },
                unitOfMeasurement:{
                    hasError:{$set:false}
                },
                range: {
                    fields:{
                        minRange:{
                            hasError: {$set: false},
                        },
                        maxRange:{
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

        });

        if (!validationResults.value.name){
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
                                    minRange:{
                                        hasError: {$set: true},
                                        error: {$set:error.message}
                                    },
                                    maxRange:{
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
        this.setState({options:options});
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
