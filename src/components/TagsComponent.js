import React from 'react';
import t from 'tcomb-form';
import ReactListInput from 'react-list-input';

const Input = ({value, onChange, type}) => {
    return <input className="form-control" type={type} value={value} onChange={e => onChange(e.target.value)}/>
};
class TagsComponent extends t.form.Component {
    /**
     * Builds the JSX for each item in the component's value list.
     *
     * @param decorateHandle
     * @param removable
     * @param onChange
     * @param onRemove
     * @param value
     * @returns {XML}
     * @constructor
     */
    Item ({decorateHandle, removable, onChange, onRemove, value}) {
        return (
            <div
                style={{
                    display:"flex",
                    alignItems: "center"
                }}
            >
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

    /**
     * Builds the JSX for the input box and add button for the component.
     *
     * @param value
     * @param onAdd
     * @param canAdd
     * @param add
     * @param onChange
     * @returns {XML}
     * @constructor
     */
    StagingItem ({value, onAdd, canAdd, add, onChange}) {
        return (
            <div className="form-group" style={{display:"flex"}}>
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

    /**
     * Returns the template factory for tcomb-forms to display the component.
     *
     * @returns {function(*)}
     */
    getTemplate() {
        return (locals) => {
            return <div className="list-input">
                    <ReactListInput
                        initialStagingValue=''
                        onChange={locals.onChange}
                        ItemComponent={this.Item}
                        StagingComponent={this.StagingItem}
                        value={locals.value}
                    />
            </div>;
        };
    }

}

export default TagsComponent;
