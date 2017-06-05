import React, { Component } from 'react';
import t from 'tcomb-form';
import config from '../../validations/config';
import validator from '../../validations/Validator';

const Form = t.form.Form;
const AttributeType = config.AttributeType;
const defaultAttributeKeys = config.defaultAttributeKeys;
const ConditionalAttributes = config.ConditionalAttributes;

class Attribute extends Component {
    /**
     * Builds the type object to display the proper conditional fields depending on format and
     * dataType.
     *
     * @param {object} value - Current form values.
     * @returns {*} tcomb form types structure.
     */
  static getAttribute(value) {
    let returnValue = AttributeType;

    if (value.dataType === 'string') {
      if (['none', 'number'].indexOf(value.format) !== -1) {
        returnValue = Object.assign({}, returnValue, ConditionalAttributes.formats[value.format]);
      }
    }

    return t.struct(returnValue);
  }

    /**
     * Clears unneeded fields and sets default values when needed.
     *
     * @param {object} value - Form value object.
     * @returns {*} - new form value object.
     */
  static updateFormValues(value) {
    const returnValue = Object.assign({}, value);
    if (returnValue.dataType === 'obj') {
      returnValue.defaultValue = null;
      returnValue.format = 'none';
    }
    if (returnValue.format !== 'number') {
      delete returnValue.range;
      delete returnValue.unitOfMeasurement;
      delete returnValue.precision;
      delete returnValue.accuracy;
    } else {
      const defaults = config.defaultNumberFormatValues;
      let rangeMin = null;
      let rangeMax = null;
      let unitOfMeasurement = returnValue.unitOfMeasurement;
      let precision = returnValue.precision;
      let accuracy = returnValue.accuracy;

      if (!returnValue.range) {
        returnValue.range = {};
      }
      rangeMin = returnValue.range.rangeMin;
      if (rangeMin === null || rangeMin === undefined) {
        rangeMin = defaults.range.rangeMin;
      }
      rangeMax = returnValue.range.rangeMax;
      if (rangeMax === null || rangeMax === undefined) {
        rangeMax = defaults.range.rangeMax;
      }
      if (unitOfMeasurement === null || unitOfMeasurement === undefined) {
        unitOfMeasurement = defaults.unitOfMeasurement;
      }
      if (precision === null || precision === undefined) {
        precision = defaults.precision;
      }
      if (accuracy === null || accuracy === undefined) {
        accuracy = defaults.accuracy;
      }
      returnValue.range = {
        rangeMin,
        rangeMax,
      };
      returnValue.unitOfMeasurement = unitOfMeasurement;
      returnValue.precision = precision;
      returnValue.accuracy = accuracy;
    }
    if (returnValue.format !== 'none') {
      returnValue.enumerations = [];
    }
    return returnValue;
  }

    /**
     * Returns the options object for tcomb-forms to display the appropiate error messages.
     *
     * @param {object} options - Current options object.
     * @param {object[]} errorList - List of errors.
     * @returns {*} - New options.
     */
  static getErrorDisplayOptions(options, errorList) {
    let localOptions = t.update(options, {
      hasError: { $set: false },
      fields: {
        name: {
          hasError: { $set: false },
        },
        unitOfMeasurement: {
          hasError: { $set: false },
        },
        range: {
          fields: {
            rangeMin: {
              hasError: { $set: false },
            },
            rangeMax: {
              hasError: { $set: false },
            },
          },
        },
        precision: {
          hasError: { $set: false },
        },
        accuracy: {
          hasError: { $set: false },
        },
      },

    });

    errorList.forEach((error) => {
      let obj = { fields: {} };
      obj.fields[error.field] = {
        hasError: { $set: true },
        error: { $set: validator.errorCodes[error.code] },
      };
      if (error.field === 'rangeMin' || error.field === 'rangeMax') {
        obj = {
          fields: {
            range: obj,
          },
        };
      }
      localOptions = t.update(localOptions, obj);
    });

    return localOptions;
  }

    /**
     * Returns a flattened object representing the passed value. For the json display requirement.
     *
     * @param {object} value - form value object.
     * @returns {{}} - Flattened object.
     */
  static getPaddedValue(value) {
    const returnValue = {};
    defaultAttributeKeys.forEach((k) => {
      let newValue;
      switch (k) {
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
      returnValue[k] = newValue === undefined ? null : newValue;
    });

    return returnValue;
  }
  constructor(props, context, updater) {
    const value = props.value;
    super(props, context, updater);

    this.onFormChange = this.onFormChange.bind(this);

    const errorList = validator.getAttributeErrors(value, props.values);

    const nameErrors = errorList.find(v => v.field === 'name');

    let options = config.AttributeOptions;
    if (nameErrors && nameErrors.code === '006' && !options.fields.name.hasError) {
      options = Attribute.getErrorDisplayOptions(options, errorList);

      value.isValid = false;
    }

    this.state = {
      value,
      options,
      attribute: Attribute.getAttribute(props.value),
    };
  }


    /**
     * Updates form status and runs validation when any value is changed on the form.
     *
     * @param {object} value - Form value object.
     */
  onFormChange(value) {
    let options = t.update(this.state.options, {
      fields: {
        defaultValue: {
          disabled: { $set: value.dataType === 'obj' },
        },
        format: {
          disabled: { $set: value.dataType === 'obj' },
        },
      },
    });

    const newValue = Attribute.updateFormValues(value);

    const attribute = Attribute.getAttribute(Attribute.updateFormValues(newValue));

    const errorList = validator.getAttributeErrors(newValue, this.props.values);

    options = Attribute.getErrorDisplayOptions(options, errorList);

    newValue.isValid = errorList.length === 0;

    this.props.onChange(newValue);

    this.setState({ options, value: newValue, attribute });
  }


  render() {
    const ref = 'form';
    return (
      <div className={this.props.className}>
        <Form
          ref={ref}
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
