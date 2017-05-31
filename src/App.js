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
    onChangeHandler(index, value){
        let values = this.state.values, paddedValues = this.state.paddedValues;
        values[index] = value;
        paddedValues[index] = Attribute.getPaddedValue(value);
        this.setState({values:values, paddedValues:paddedValues});
    }
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
            </Collapse.Panel>
        );
    }

    getTabPanel(categoryName, index){
        let panels = this.state.values.filter((v)=>{return v.category === index}).map(this.getPanel),
            collapse = <Collapse
                accordion={true}
            >
                {panels}
            </Collapse>;
        let saveButtonClasses = "btn btn-success" + (this.isValid()?'':' disabled');

        if (panels.length === 1){
            collapse = <Collapse
                accordion={true}
                activeKey="panel-0"
            >
                {panels}
            </Collapse>;
        }
        return (
            <TabPanel key={"tab-panel-" + index}>
                {collapse}
                <button type="button" className="btn btn-primary" onClick={this.addAttribute.bind(this, index)}>Add attribute</button>
                <button className={saveButtonClasses}>Save</button>
            </TabPanel>
        );
    }
    addAttribute(category){
        let values = this.state.values, value = defaultAttributeValues;


        value.category = category;
        value.id = Math.random().toString(36).substr(2);

        values.push(value);

        this.setState({values: values});
    }

    onTabSelect(index, lastIndex, event){
        this.setState({selectedIndex: index});
        return false;
    }
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
