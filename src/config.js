import TagsComponent from './components/TagsComponent';
import t from 'tcomb-form';
const enumTypes = {
    "ResourceTypes" : {
        "0" : "Default Value"
    },
    "DataTypes" : {
        "string" : "String",
        "obj" : "Object"
    },
    "FormatTypes" : {
        "none" : "None",
        "number" : "Number",
        "bool" : "Boolean",
        "date" : "Date-Time",
        "data" : "CDATA",
        "uri" : "URI"
    }
}
const config = {
    "enumTypes" : enumTypes,
    "AttributeType" : {
        name: t.maybe(t.String),
        description: t.maybe(t.String),
        deviceResourceType: t.enums(enumTypes.ResourceTypes),
        defaultValue: t.maybe(t.String),
        dataType: t.enums(enumTypes.DataTypes),
        format: t.enums(enumTypes.FormatTypes),
    },
    "AttributeOptions" : {
        "fields" : {
            "name" : {
                "label" : "Name",
                    "attrs" : {
                    "placeholder" : "Enter a name"
                }
            },
            "description" : {
                "label" : "Description",
                    "attrs" : {
                    "placeholder" : "Enter a description for your new attribute"
                }
            },
            "deviceResourceType" :{
                "disabled" : true
            },
            "defaultValue" : {
                "label" : "Default value",
                    "attrs" : {
                    "placeholder" : "Enter a default Value"
                }
            },
            "dataType" : {
                "nullOption" : false
            },
            "format" : {
                "nullOption" : false
            },
            "enumerations" : {
                "factory" : TagsComponent,
                "attrs" : {
                    "placeholder" : "Enter value"
                }
            },
            "range" : {
                "fields" : {
                    "rangeMin" : {
                        "attrs" : {
                            "placeholder" : "Min range"
                        }
                    },
                    "rangeMax" : {
                        "attrs" : {
                            "placeholder" : "Max range"
                        }
                    }
                }
            },
            "unitOfMeasurement" : {
                "label" : "Unit of Measurement",
                    "attrs" : {
                    "placeholder" : "UoM (eg. mm)"
                }
            },
            "precision" : {
                "attrs" : {
                    "placeholder" : "Precision (eg. 0.5)"
                }
            },
            "accuracy" : {
                "attrs" : {
                    "placeholder" : "Accuracy (eg. 0.5)"
                }
            }
        }
    },
    "defaultAttributeKeys" : [
        'id',
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
        'accuracy',
        'isValid'
    ],
    "ConditionalAttributes" : {
        formats:{
            none: {
                enumerations: t.list(t.String),
            },
            number:{
                range: t.struct({
                    rangeMin: t.Number,
                    rangeMax: t.Number
                }),
                unitOfMeasurement: t.maybe(t.String),
                precision: t.Number,
                accuracy: t.Number
            }
        }
    }
};
export default config;