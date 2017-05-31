import TagsComponent from './components/TagsComponent';
const config = {
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
    }
};
export default config;