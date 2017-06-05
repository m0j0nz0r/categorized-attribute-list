import React, { Component } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import ReactJson from 'react-json-view';
import 'react-tabs/style/react-tabs.css';
import Collapse from 'rc-collapse';
import 'rc-collapse/assets/index.css';
import Attribute from './Attribute/Attribute';
import config from '../validations/config';

const defaultAttributeValues = config.defaultAttributeValues;
const categories = config.categories;

class AttributeContainer extends Component {
  constructor(props, context, updater) {
    super(props, context, updater);
    this.getPanel = this.getPanel.bind(this);
    this.getTabPanel = this.getTabPanel.bind(this);
    this.onTabSelect = this.onTabSelect.bind(this);
    this.state = {
      values: [],
      paddedValues: [],
      selectedIndex: 0,
      lastAdded: 0,
    };
  }

    /**
     * Updates the values array and the displayed JSON object when a value in the form is changed.
     *
     * @param {number} index - Index of the changed attribute.
     * @param {object} value - New Attribute value.
     */
  onChangeHandler(index, value) {
    const values = this.state.values;
    const paddedValues = this.state.paddedValues;
    values[index] = value;
    paddedValues[index] = Attribute.getPaddedValue(value);
    this.setState({ values, paddedValues });
  }

    /**
     * Updates the selectedIndex state variable.
     *
     * @param {number} index - New tab index.
     */
  onTabSelect(index) {
    this.setState({ selectedIndex: index });
  }
    /**
     * Builds the JSX for the collapsible part of the Attribute display.
     *
     * @param {object} value - Attribute value object.
     * @returns {XML} - JSX Markup.
     */
  getPanel(value) {
    let header = 'New Attribute';
    const index = this.state.values.indexOf(value);
    const onChangeHandler = this.onChangeHandler.bind(this, index);
    const deleteButtonOnClick = this.removeAttribute.bind(this, index);
    if (value.name) {
      header = value.name;
      if (value.description) {
        header += `: ${value.description}`;
      }
    }
    return (
      <Collapse.Panel key={`panel-${index}`} header={header}>
        <Attribute
          key={`attribute-${index}`}
          value={value}
          values={this.state.values}
          onChange={onChangeHandler}
          selectedIndex={this.state.selectedIndex}
        />
        <button className="btn btn-danger material-icons" onClick={deleteButtonOnClick}>delete</button>
      </Collapse.Panel>
    );
  }

    /**
     * Builds the accordion container JSX as a tab element.
     *
     * @param {string} categoryName - Unused, but needed to access the index argument passed by
     * Array.prototype.map
     * @param {number} index - Current item index.
     * @returns {XML} - Result.
     */
  getTabPanel(categoryName, index) {
    const panels = this.state.values.filter(v => v.category === index).map(this.getPanel);
    const addAttributeButtonClick = this.addAttribute.bind(this, index);
    const collapse =
      (<Collapse
        accordion
        activeKey={this.state.currentActiveKey}
        onChange={key => this.setState({ currentActiveKey: key })}
      >
        {panels}
      </Collapse>);
    const saveButtonClasses = `btn btn-success${this.isValid() ? '' : ' disabled'}`;
    return (
      <TabPanel key={`tab-panel-${index}`}>
        {collapse}
        <button type="button" className="btn btn-primary" onClick={addAttributeButtonClick}>Add attribute</button>
        <button className={saveButtonClasses}>Save</button>
      </TabPanel>
    );
  }

    /**
     * Initializes a new attribute and adds it to the values array
     *
     * @param {number} category - The category index to which the attribute should be added.
     */
  addAttribute(category) {
    const values = this.state.values.slice(0);
    const value = Object.assign({}, defaultAttributeValues);
    const paddedValues = this.state.paddedValues.slice(0);

    value.category = category;
    value.id = Math.random().toString(36).substr(2);

    values.push(value);

    paddedValues.push(Attribute.getPaddedValue(value));
    this.setState({
      values,
      paddedValues,
      currentActiveKey: `panel-${values.length - 1}`,
    });
  }

    /**
     * Removes the attribute at the specified index.
     *
     * @param {number} index - Index of the item to be removed.
     */
  removeAttribute(index) {
    const values = this.state.values.splice(0);
    const paddedValues = this.state.paddedValues.splice(0);

    values.splice(index, 1);
    paddedValues.splice(index, 1);

    this.setState({ values, paddedValues });
  }

    /**
     * Returns true if all attributes in the values array are valid.
     *
     * @returns {boolean} - True if all the items in the values array are valid.
     */
  isValid() {
    let valid = false;
    if (this.state.paddedValues.length) {
      valid = !this.state.paddedValues.find(v => !v.isValid);
    }
    return valid;
  }
  render() {
    const panels = categories.map(this.getTabPanel);
    const tabList = categories.map(v => <Tab key={`tab-${v}`}>{v}</Tab>);
    return (
      <div className="row">
        <div className="col-6">
          <Tabs selectedIndex={this.state.selectedIndex} onSelect={this.onTabSelect}>
            <TabList>{tabList}</TabList>
            {panels}
          </Tabs>
        </div>
        <div className="col-6">
          <ReactJson src={this.state.paddedValues} className="col-6" />
        </div>
      </div>
    );
  }

}

export default AttributeContainer;
