import React, { Component } from 'react';
import t from 'tcomb-form';
import config from '../config';
import validator from './Validator';
const Form = t.form.Form;

const AttributeType = config.AttributeType;

const defaultAttributeKeys = config.defaultAttributeKeys;

const ConditionalAttributes = config.ConditionalAttributes;

class Attribute extends Component {
    constructor(props, context, updater){
        const value = props.value;
        super(props, context, updater);

        this.onFormChange = this.onFormChange.bind(this);

        const errorList = validator.getAttributeErrors(value, props.values);

        const nameErrors = errorList.find((v) => v.field === "name");

        let options = config.AttributeOptions;
        if (nameErrors && nameErrors.code === "006" && !options.fields.name.hasError){
            options = Attribute.getErrorDisplayOptions(options, errorList);

            value.isValid = false;
        }

        this.state = {
            value: value,
            options: options,
            attribute: Attribute.getAttribute(props.value)
        };

    }

    /**
     * Builds the type object to display the proper conditional fields depending on format and dataType.
     *
     * @param value
     * @returns {*}
     */
    static getAttribute(value){
        let returnValue = AttributeType;

        if (value.dataType === "string"){
            if (['none', 'number'].indexOf(value.format) !== -1){
                returnValue = Object.assign({}, returnValue, ConditionalAttributes.formats[value.format]);
            }
        }

        return t.struct(returnValue);
    }

    /**
     * Clears unneeded fields and sets default values when needed.
     *
     * @param value
     * @returns {*}
     */
    static updateFormValues(value){
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
        else{
            value.range = {
                rangeMin:0,
                rangeMax:20
            };
        }
        if (value.format !== 'none'){
            value.enumerations = [];
        }
        return value;
    }

    /**
     * Returns the options object for tcomb-forms to display the appropiate error messages.
     *
     * @param options
     * @param errorList
     * @returns {*}
     */
    static getErrorDisplayOptions(options, errorList){
        let localOptions = t.update(options, {
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

        });

        errorList.forEach((error)=>{
            let obj = {fields:{}};
            obj.fields[error.field] = {
                hasError: {$set:true},
                error: {$set:validator.errorCodes[error.code]}
            };
            if ("rangeMin" === error.field || "rangeMax" === error.field){
                obj = {
                    fields:{
                        range: obj
                    }
                };
            }
            localOptions = t.update(localOptions, obj);
        });

        return localOptions;
    }

    /**
     * Returns a flattened object representing the passed value. For the json display requirement.
     *
     * @param value
     * @returns {{}}
     */
    static getPaddedValue(value){
        let returnValue = {};
        defaultAttributeKeys.forEach((k) =>{
            let newValue;
            switch(k){
                case 'deviceResourceType':
                    newValue = config.enumTypes.ResourceTypes[value[k]];
                    break;
                case 'dataType':
                    newValue = config.enumTypes.DataTypes[value[k]];
                    break;
                case 'format':
                    newValue = config.enumTypes.FormatTypes[value[k]];
                    break;
                case 'category':
                    newValue = config.categories[value[k]];
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

        return returnValue;
    }

    /**
     * Updates form status and runs validation when any value is changed on the form.
     *
     * @param value
     */
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
            });

        value = Attribute.updateFormValues(value);

        const attribute = Attribute.getAttribute(Attribute.updateFormValues(value));

        let errorList = validator.getAttributeErrors(value, this.props.values);

        options = Attribute.getErrorDisplayOptions(options, errorList);

        value.isValid = errorList.length === 0;

        this.props.onChange(value);

        this.setState({options: options, value: value, attribute: attribute});
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
