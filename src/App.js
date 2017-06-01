import React, { Component } from 'react';
import './App.css';
import {Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import Collapse from 'rc-collapse';
import 'rc-collapse/assets/index.css'
import Attribute from './components/Attribute';
import ReactJson from 'react-json-view';
import config from './config';

const defaultAttributeValues = config.defaultAttributeValues;
const categories = config.categories;

class App extends Component {
    constructor(props, context, updater){
        super(props, context, updater);
        this.getPanel = this.getPanel.bind(this);
        this.getTabPanel = this.getTabPanel.bind(this);
        this.onTabSelect = this.onTabSelect.bind(this);
        this.state = {
            values: [],
            paddedValues: [],
            selectedIndex: 0
        };
    }

    /**
     * Updates the values array and the displayed JSON object whenever a value in the form is changed.
     *
     * @param index
     * @param value
     */
    onChangeHandler(index, value){
        let values = this.state.values, paddedValues = this.state.paddedValues;
        values[index] = value;
        paddedValues[index] = Attribute.getPaddedValue(value);
        this.setState({values:values, paddedValues:paddedValues});
    }

    /**
     * Builds the JSX for the collapsible part of the Attribute display.
     *
     * @param value
     * @returns {XML}
     */
    getPanel(value){
        let header = "",
            index = this.state.values.indexOf(value);
        if (value.name){
            header = value.name;
            if (value.description){
                header += ": " + value.description;
            }
        }
        return (
            <Collapse.Panel key={"panel-" + index} header={header}>
                <Attribute
                    key={"attribute-" + index}
                    value={value}
                    values={this.state.values}
                    onChange={this.onChangeHandler.bind(this, index)}
                    selectedIndex={this.state.selectedIndex}
                />
                <button className="btn btn-danger material-icons" onClick={this.removeAttribute.bind(this, index)}>delete</button>
            </Collapse.Panel>
        );
    }

    /**
     * Builds the accordion container JSX as a tab element.
     *
     * @param categoryName - Unused, but needed to access the index argument passed by Array.prototype.map
     * @param index
     * @returns {XML}
     */
    getTabPanel(categoryName, index){
        let panels = this.state.values.filter((v)=>{return v.category === index}).map(this.getPanel),
            collapse = <Collapse
                accordion={true}
                defaultActiveKey="panel-0"
            >
                {panels}
            </Collapse>;
        let saveButtonClasses = "btn btn-success" + (this.isValid()?'':' disabled');

        return (
            <TabPanel key={"tab-panel-" + index}>
                {collapse}
                <button type="button" className="btn btn-primary" onClick={this.addAttribute.bind(this, index)}>Add attribute</button>
                <button className={saveButtonClasses}>Save</button>
            </TabPanel>
        );
    }

    /**
     * Initializes a new attribute and adds it to the values array
     *
     * @param category
     */
    addAttribute(category){
        let values = this.state.values.slice(0),
            value = Object.assign({}, defaultAttributeValues),
            paddedValues = this.state.paddedValues.slice(0);

        value.category = category;
        value.id = Math.random().toString(36).substr(2);

        values.push(value);

        paddedValues.push(Attribute.getPaddedValue(value));
        this.setState({values: values, paddedValues: paddedValues});
    }

    /**
     * Removes the attribute at the specified index.
     *
     * @param {number} index
     */
    removeAttribute(index){
        let values = this.state.values.splice(0),
            paddedValues = this.state.paddedValues.splice(0);

        values.splice(index, 1);
        paddedValues.splice(index, 1);

        this.setState({values: values, paddedValues: paddedValues});
    }
    /**
     * Updates the selectedIndex state variable.
     *
     * @param index
     * @returns {boolean}
     */
    onTabSelect(index){
        this.setState({selectedIndex: index});
        return false;
    }

    /**
     * Returns true if all attributes in the values array are valid.
     *
     * @returns {boolean}
     */
    isValid(){
        let valid = false;
        if (this.state.paddedValues.length){
            valid = !this.state.paddedValues.find((v) => {return !v.isValid;});
        }
        return valid;
    }
    render() {
        let panels = categories.map(this.getTabPanel);
        let tabList = categories.map((v)=> <Tab key={"tab-" + v}>{v}</Tab>);
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

export default App;
