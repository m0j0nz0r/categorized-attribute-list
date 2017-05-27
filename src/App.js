import React, { Component } from 'react';
import './App.css';
import t from 'tcomb-form';


const Form = t.form.Form;

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

const RangeFields = t.struct({
    minRange: t.Number,
    maxRange: t.Number
});
const Attribute = {
    name: t.String,
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
            unitOfMeasurement: t.String,
            precision: t.Number,
            accuracy: t.Number
        }
    },
};
const options = {
    fields:{
        name:{
            attrs:{
                placeholder: "Enter a name"
            }
        },
        description: {
            attrs:{
                placeholder: "Enter a description for your new attribute"
            }
        },
        deviceResourceType:{
            disabled: true
        },
        defaultValue:{
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

class App extends Component {
    constructor(props, context, updater){
        let defaultValue = {
            deviceResourceType: 0,
            dataType: "string",
            format: "none",
        }, defaultAttribute;

        super(props, context, updater);
        defaultAttribute = App.getAttribute(defaultValue);
        this.save = this.save.bind(this);
        this.onFormChange = this.onFormChange.bind(this);
        this.state = {
            value: defaultValue,
            options: options,
            attribute: defaultAttribute
        }
    }

    static getAttribute(value){
        let returnValue = Attribute;

        if (value.dataType === "string"){
            if (['none', 'number'].indexOf(value.format) !== -1){
                returnValue = Object.assign({}, returnValue, ConditionalAttributes.formats[value.format]);
            }
        }

        return t.struct(returnValue);
    }

    onFormChange(value){
        let options = t.update(this.state.options, {
            fields: {
                defaultValue: {
                    disabled: {'$set':value.dataType === "obj"}
                },
                format:{
                    disabled: {'$set':value.dataType === "obj"}
                }
            }
        }),
            attribute = App.getAttribute(value);



        this.setState({options: options, value: value, attribute: attribute});
    }
    save(){
        let value = this && this.refs.form.getValue();
        console.log(value);
    }
    render() {
        return (
            <div>
                <Form
                    ref="form"
                    type={this.state.attribute}
                    options={this.state.options}
                    value={this.state.value}
                    onChange={this.onFormChange}
                />
                <button onClick={this.save}>Save</button>
            </div>
        );
    }
}

export default App;
