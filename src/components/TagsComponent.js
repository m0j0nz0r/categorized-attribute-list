import React from 'react';
import t from 'tcomb-form';
import ReactListInput from 'react-list-input';

const Input = ({value, onChange, type}) => {
    return <input type={type} value={value} onChange={e => onChange(e.target.value)}/>
};

class TagsComponent extends t.form.Component { // extend the base class
    Item ({decorateHandle, removable, onChange, onRemove, value}) {
        return (
            <div
                style={{
                    display:"flex",
                    alignItems: "center"
                }}>
                {decorateHandle(<span className="material-icons" style={{cursor: 'move'}}>swap_vert</span>)}
                <span
                    className="material-icons"
                    onClick={removable ? onRemove : x => x}
                    style={{
                        cursor: removable ? 'pointer' : 'not-allowed',
                        color: removable ? 'black' : 'gray'
                    }}>close</span>
                <Input className="form-control" value={value} onChange={onChange} />
            </div>
        )
    }

    StagingItem ({value, onAdd, canAdd, add, onChange}) {
        return (
            <div className="form-group">
                <Input
                    className="form-control"
                    value={value}
                    onChange={onChange} />
                <button
                    type="button"
                    onClick={canAdd ? onAdd : undefined}
                    className="btn btn-primary"
                >Add</button>
            </div>
        )
    }
    getTemplate() {
        return (locals) => {
            return <ReactListInput
                initialStagingValue=''
                onChange={value => this.setState({value})}
                maxItems={10}
                minItems={0}
                ItemComponent={this.Item}
                StagingComponent={this.StagingItem}
                value={locals.value}
            />;
        };
    }

}

export default TagsComponent;
