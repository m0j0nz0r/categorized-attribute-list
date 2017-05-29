import React, { Component } from 'react';
import './App.css';
import Collapse from 'rc-collapse';
import 'rc-collapse/assets/index.css'
import Attribute from './components/Attribute';

const defaultAttributeValues = {
    name: "",
    description: "",
    deviceResourceType: 0,
    dataType: "string",
    format: "none",
    enumerations: []
};
class App extends Component {
    constructor(props, context, updater){
        super(props, context, updater);
        this.getPanel = this.getPanel.bind(this);
        this.addAttribute = this.addAttribute.bind(this);
        this.state = {
            values: []
        };
    }
    onChangeHandler(index, value){
        let values = this.state.values;
        values[index] = value;
        this.setState({values:values});
    }
    getPanel(value, index){
        let header = "",
            isDuplicated = App.isDuplicated(value.name, this.state.values);
        if (value.name){
            header = value.name;
            if (value.description){
                header += ": " + value.description;
            }
        }
        return (
            <Collapse.Panel header={header}>
                <Attribute
                    key={"panel-" + index}
                    value={value}
                    onChange={this.onChangeHandler.bind(this, index)}
                    isDuplicated={isDuplicated}
                />
            </Collapse.Panel>
        );
    }
    static isDuplicated(name, values){
        let counter = 0;
        values.forEach((v) => {if (v.name === name){ counter++;}});
        return counter > 1;
    }
    addAttribute(){
        let values = this.state.values;

        values.push(defaultAttributeValues);

        this.setState({values: values});
    }
    render() {
        let panels = this.state.values.map(this.getPanel);
        return (
            <div>
                <Collapse
                    accordion={true}
                >
                    {panels}
                </Collapse>
                <button type="button" onClick={this.addAttribute}>Add attribute</button>
            </div>
        );
    }
}

export default App;
